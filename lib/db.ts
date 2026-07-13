/**
 * SQLite database via @libsql/client (pure JS, no native build needed).
 * Off-chain metadata only — payment truth lives on-chain.
 */
import { createClient } from '@libsql/client';
import path from 'path';

const DB_PATH = `file:${path.join(process.cwd(), 'lunas.db')}`;

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createClient({ url: DB_PATH });
  }
  return _client;
}

export async function initDb() {
  const db = getClient();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS merchants (
      address    TEXT    PRIMARY KEY,
      store_name TEXT    NOT NULL DEFAULT '',
      verified   INTEGER NOT NULL DEFAULT 0,
      stake_tx   TEXT,
      created_at INTEGER NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT    PRIMARY KEY,
      merchant_address TEXT NOT NULL,
      title         TEXT    NOT NULL,
      price_stroops INTEGER NOT NULL,
      type          TEXT    NOT NULL DEFAULT 'one_time',
      created_at    INTEGER NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id               TEXT    PRIMARY KEY,
      product_id       TEXT,
      merchant_address TEXT    NOT NULL,
      amount_stroops   INTEGER NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'pending',
      asset_paid       TEXT,
      tx_hash          TEXT,
      paid_at          INTEGER,
      created_at       INTEGER NOT NULL
    )
  `);

  // Migrations for columns added after initial schema
  try {
    await db.execute(`ALTER TABLE products ADD COLUMN type TEXT NOT NULL DEFAULT 'one_time'`);
  } catch { /* already exists */ }
  try {
    await db.execute(`ALTER TABLE products ADD COLUMN description TEXT NOT NULL DEFAULT ''`);
  } catch { /* already exists */ }
}

// ─── Merchants ────────────────────────────────────────────────────────────────

export interface Merchant {
  address: string;
  store_name: string;
  verified: boolean;
  stake_tx: string | null;
  created_at: number;
}

export async function getMerchant(address: string): Promise<Merchant | null> {
  await initDb();
  const res = await getClient().execute({ sql: `SELECT * FROM merchants WHERE address = ?`, args: [address] });
  if (!res.rows[0]) return null;
  return rowToMerchant(res.rows[0]);
}

export async function upsertMerchant(address: string, storeName: string): Promise<Merchant> {
  await initDb();
  const now = Date.now();
  await getClient().execute({
    sql: `INSERT INTO merchants (address, store_name, verified, stake_tx, created_at)
          VALUES (?, ?, 0, NULL, ?)
          ON CONFLICT(address) DO UPDATE SET store_name = excluded.store_name`,
    args: [address, storeName, now],
  });
  return (await getMerchant(address))!;
}

export async function setMerchantVerified(address: string, stakeTx: string): Promise<void> {
  await initDb();
  await getClient().execute({
    sql: `UPDATE merchants SET verified = 1, stake_tx = ? WHERE address = ?`,
    args: [stakeTx, address],
  });
}

function rowToMerchant(r: any): Merchant {
  return {
    address: String(r.address),
    store_name: String(r.store_name),
    verified: Number(r.verified) === 1,
    stake_tx: r.stake_tx ? String(r.stake_tx) : null,
    created_at: Number(r.created_at),
  };
}

// ─── Order ID helpers ─────────────────────────────────────────────────────────

/**
 * Generate a 14-byte random ID (28 hex chars).
 * Fits in a Stellar text memo (max 28 bytes) and zero-pads to BytesN<32>.
 */
export function generateOrderId(): string {
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
}

/** Convert a 28-char hex orderId to a 32-byte Buffer for Soroban BytesN<32>. */
export function orderIdToBytes(orderId: string): Buffer {
  return Buffer.concat([Buffer.from(orderId, 'hex'), Buffer.alloc(18)]);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  merchant_address: string;
  title: string;
  description: string;
  price_stroops: number;
  type: 'one_time' | 'permanent';
  created_at: number;
}

export async function createProduct(data: {
  merchantAddress: string;
  title: string;
  description?: string;
  priceUsdc: number;
  type?: 'one_time' | 'permanent';
}): Promise<Product> {
  await initDb();
  const id = generateOrderId();
  const price_stroops = Math.round(data.priceUsdc * 10_000_000);
  const type = data.type ?? 'one_time';
  const description = data.description ?? '';
  const now = Date.now();
  await getClient().execute({
    sql: `INSERT INTO products (id, merchant_address, title, description, price_stroops, type, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.merchantAddress, data.title, description, price_stroops, type, now],
  });
  return { id, merchant_address: data.merchantAddress, title: data.title, description, price_stroops, type, created_at: now };
}

export async function getProduct(id: string): Promise<Product | null> {
  await initDb();
  const res = await getClient().execute({ sql: `SELECT * FROM products WHERE id = ?`, args: [id] });
  if (!res.rows[0]) return null;
  return rowToProduct(res.rows[0]);
}

export async function listProducts(merchantAddress: string): Promise<Product[]> {
  await initDb();
  const res = await getClient().execute({
    sql: `SELECT * FROM products WHERE merchant_address = ? ORDER BY created_at DESC`,
    args: [merchantAddress],
  });
  return res.rows.map(rowToProduct);
}

export async function updateProduct(
  id: string,
  merchantAddress: string,
  data: { title?: string; description?: string; priceUsdc?: number }
): Promise<void> {
  await initDb();
  if (data.title !== undefined) {
    await getClient().execute({
      sql: `UPDATE products SET title = ? WHERE id = ? AND merchant_address = ?`,
      args: [data.title, id, merchantAddress],
    });
  }
  if (data.description !== undefined) {
    await getClient().execute({
      sql: `UPDATE products SET description = ? WHERE id = ? AND merchant_address = ?`,
      args: [data.description, id, merchantAddress],
    });
  }
  if (data.priceUsdc !== undefined) {
    await getClient().execute({
      sql: `UPDATE products SET price_stroops = ? WHERE id = ? AND merchant_address = ?`,
      args: [Math.round(data.priceUsdc * 10_000_000), id, merchantAddress],
    });
  }
}

export async function deleteProduct(id: string, merchantAddress: string): Promise<void> {
  await initDb();
  await getClient().execute({
    sql: `DELETE FROM products WHERE id = ? AND merchant_address = ?`,
    args: [id, merchantAddress],
  });
}

function rowToProduct(r: any): Product {
  return {
    id: String(r.id),
    merchant_address: String(r.merchant_address),
    title: String(r.title),
    description: String(r.description ?? ''),
    price_stroops: Number(r.price_stroops),
    type: (String(r.type ?? 'one_time')) as 'one_time' | 'permanent',
    created_at: Number(r.created_at),
  };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  product_id: string | null;
  merchant_address: string;
  amount_stroops: number;
  status: 'pending' | 'paid' | 'expired';
  asset_paid: string | null;
  tx_hash: string | null;
  paid_at: number | null;
  created_at: number;
}

export async function createOrder(data: {
  id: string;
  productId?: string;
  merchantAddress: string;
  amountStroops: number;
}): Promise<Order> {
  await initDb();
  const now = Date.now();
  await getClient().execute({
    sql: `INSERT INTO orders (id, product_id, merchant_address, amount_stroops, status, created_at)
          VALUES (?, ?, ?, ?, 'pending', ?)`,
    args: [data.id, data.productId ?? null, data.merchantAddress, data.amountStroops, now],
  });
  return {
    id: data.id,
    product_id: data.productId ?? null,
    merchant_address: data.merchantAddress,
    amount_stroops: data.amountStroops,
    status: 'pending',
    asset_paid: null,
    tx_hash: null,
    paid_at: null,
    created_at: now,
  };
}

const ORDER_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getOrder(id: string): Promise<Order | null> {
  await initDb();
  const res = await getClient().execute({ sql: `SELECT * FROM orders WHERE id = ?`, args: [id] });
  if (!res.rows[0]) return null;
  const order = rowToOrder(res.rows[0]);
  // Lazy expiry: pending orders older than 24h are auto-expired
  if (order.status === 'pending' && Date.now() - order.created_at > ORDER_EXPIRY_MS) {
    await markOrderExpired(id);
    order.status = 'expired';
  }
  return order;
}

export async function listOrders(merchantAddress: string): Promise<Order[]> {
  await initDb();
  const res = await getClient().execute({
    sql: `SELECT * FROM orders WHERE merchant_address = ? ORDER BY created_at DESC LIMIT 50`,
    args: [merchantAddress],
  });
  return res.rows.map(rowToOrder);
}

export async function markOrderPaid(id: string, assetPaid: string, txHash: string): Promise<void> {
  await initDb();
  await getClient().execute({
    sql: `UPDATE orders SET status='paid', asset_paid=?, tx_hash=?, paid_at=? WHERE id=?`,
    args: [assetPaid, txHash, Date.now(), id],
  });
}

export async function markOrderExpired(id: string): Promise<void> {
  await initDb();
  await getClient().execute({
    sql: `UPDATE orders SET status='expired' WHERE id=? AND status='pending'`,
    args: [id],
  });
}

function rowToOrder(r: any): Order {
  return {
    id: String(r.id),
    product_id: r.product_id ? String(r.product_id) : null,
    merchant_address: String(r.merchant_address),
    amount_stroops: Number(r.amount_stroops),
    status: String(r.status) as Order['status'],
    asset_paid: r.asset_paid ? String(r.asset_paid) : null,
    tx_hash: r.tx_hash ? String(r.tx_hash) : null,
    paid_at: r.paid_at ? Number(r.paid_at) : null,
    created_at: Number(r.created_at),
  };
}
