/**
 * Neon Postgres via @neondatabase/serverless (HTTP driver, no TCP pool needed).
 * Off-chain metadata only — payment truth lives on-chain.
 */
import { neon } from '@neondatabase/serverless';

let _client: ReturnType<typeof neon> | null = null;

function client() {
  if (!_client) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    _client = neon(process.env.DATABASE_URL);
  }
  return _client;
}

/** Tagged-template query helper — rows typed as any[] since neon's return
 *  type is a TS union that can't be indexed without a cast at every call site. */
function db(strings: TemplateStringsArray, ...values: unknown[]): Promise<any[]> {
  return client()(strings, ...values) as unknown as Promise<any[]>;
}

let _initPromise: Promise<void> | null = null;

export async function initDb() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    await db`
      CREATE TABLE IF NOT EXISTS merchants (
        address    TEXT    PRIMARY KEY,
        store_name TEXT    NOT NULL DEFAULT '',
        verified   BOOLEAN NOT NULL DEFAULT FALSE,
        stake_tx   TEXT,
        created_at BIGINT  NOT NULL
      )
    `;
    await db`
      CREATE TABLE IF NOT EXISTS products (
        id               TEXT    PRIMARY KEY,
        merchant_address TEXT    NOT NULL,
        title            TEXT    NOT NULL,
        description      TEXT    NOT NULL DEFAULT '',
        price_stroops    BIGINT  NOT NULL,
        type             TEXT    NOT NULL DEFAULT 'one_time',
        created_at       BIGINT  NOT NULL
      )
    `;
    await db`
      CREATE TABLE IF NOT EXISTS orders (
        id               TEXT    PRIMARY KEY,
        product_id       TEXT,
        merchant_address TEXT    NOT NULL,
        amount_stroops   BIGINT  NOT NULL,
        status           TEXT    NOT NULL DEFAULT 'pending',
        asset_paid       TEXT,
        tx_hash          TEXT,
        paid_at          BIGINT,
        created_at       BIGINT  NOT NULL
      )
    `;
    await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'one_time'`;
    await db`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`;
  })();
  return _initPromise;
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
  const rows = await db`SELECT * FROM merchants WHERE address = ${address}`;
  if (!rows[0]) return null;
  return rowToMerchant(rows[0]);
}

export async function upsertMerchant(address: string, storeName: string): Promise<Merchant> {
  await initDb();
  const now = Date.now();
  await db`
    INSERT INTO merchants (address, store_name, verified, stake_tx, created_at)
    VALUES (${address}, ${storeName}, FALSE, NULL, ${now})
    ON CONFLICT (address) DO UPDATE SET store_name = excluded.store_name
  `;
  return (await getMerchant(address))!;
}

export async function setMerchantVerified(address: string, stakeTx: string): Promise<void> {
  await initDb();
  await db`UPDATE merchants SET verified = TRUE, stake_tx = ${stakeTx} WHERE address = ${address}`;
}

function rowToMerchant(r: any): Merchant {
  return {
    address: String(r.address),
    store_name: String(r.store_name),
    verified: Boolean(r.verified),
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
  await db`
    INSERT INTO products (id, merchant_address, title, description, price_stroops, type, created_at)
    VALUES (${id}, ${data.merchantAddress}, ${data.title}, ${description}, ${price_stroops}, ${type}, ${now})
  `;
  return { id, merchant_address: data.merchantAddress, title: data.title, description, price_stroops, type, created_at: now };
}

export async function getProduct(id: string): Promise<Product | null> {
  await initDb();
  const rows = await db`SELECT * FROM products WHERE id = ${id}`;
  if (!rows[0]) return null;
  return rowToProduct(rows[0]);
}

export async function listProducts(merchantAddress: string): Promise<Product[]> {
  await initDb();
  const rows = await db`SELECT * FROM products WHERE merchant_address = ${merchantAddress} ORDER BY created_at DESC`;
  return rows.map(rowToProduct);
}

export async function updateProduct(
  id: string,
  merchantAddress: string,
  data: { title?: string; description?: string; priceUsdc?: number }
): Promise<void> {
  await initDb();
  if (data.title !== undefined) {
    await db`UPDATE products SET title = ${data.title} WHERE id = ${id} AND merchant_address = ${merchantAddress}`;
  }
  if (data.description !== undefined) {
    await db`UPDATE products SET description = ${data.description} WHERE id = ${id} AND merchant_address = ${merchantAddress}`;
  }
  if (data.priceUsdc !== undefined) {
    const price_stroops = Math.round(data.priceUsdc * 10_000_000);
    await db`UPDATE products SET price_stroops = ${price_stroops} WHERE id = ${id} AND merchant_address = ${merchantAddress}`;
  }
}

export async function deleteProduct(id: string, merchantAddress: string): Promise<void> {
  await initDb();
  await db`DELETE FROM products WHERE id = ${id} AND merchant_address = ${merchantAddress}`;
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
  await db`
    INSERT INTO orders (id, product_id, merchant_address, amount_stroops, status, created_at)
    VALUES (${data.id}, ${data.productId ?? null}, ${data.merchantAddress}, ${data.amountStroops}, 'pending', ${now})
  `;
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
  const rows = await db`SELECT * FROM orders WHERE id = ${id}`;
  if (!rows[0]) return null;
  const order = rowToOrder(rows[0]);
  // Lazy expiry: pending orders older than 24h are auto-expired
  if (order.status === 'pending' && Date.now() - order.created_at > ORDER_EXPIRY_MS) {
    await markOrderExpired(id);
    order.status = 'expired';
  }
  return order;
}

export async function listOrders(merchantAddress: string): Promise<Order[]> {
  await initDb();
  const rows = await db`SELECT * FROM orders WHERE merchant_address = ${merchantAddress} ORDER BY created_at DESC LIMIT 50`;
  return rows.map(rowToOrder);
}

export async function markOrderPaid(id: string, assetPaid: string, txHash: string): Promise<void> {
  await initDb();
  await db`UPDATE orders SET status='paid', asset_paid=${assetPaid}, tx_hash=${txHash}, paid_at=${Date.now()} WHERE id=${id}`;
}

export async function markOrderExpired(id: string): Promise<void> {
  await initDb();
  await db`UPDATE orders SET status='expired' WHERE id=${id} AND status='pending'`;
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
