/**
 * LunasCheckout Soroban contract — admin operations (server-side only).
 * The admin key can ONLY call create_order / confirm_payment / expire_order.
 * It can never move user funds.
 */
import * as StellarSdk from '@stellar/stellar-sdk';
import { rpc, NETWORK_PASSPHRASE } from './stellar';
import { orderIdToBytes } from './db';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CHECKOUT_CONTRACT!;

function adminKeypair(): StellarSdk.Keypair {
  const secret = process.env.CHECKOUT_ADMIN_SECRET;
  if (!secret) throw new Error('CHECKOUT_ADMIN_SECRET not set');
  return StellarSdk.Keypair.fromSecret(secret);
}

/**
 * Build, simulate, sign, and submit a contract call. Returns the tx hash.
 */
async function invokeContract(
  functionName: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<string> {
  const kp = adminKeypair();
  const account = await rpc.getAccount(kp.publicKey());
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const prepared = await rpc.prepareTransaction(tx);
  prepared.sign(kp);

  const response = await rpc.sendTransaction(prepared);
  if (response.status === 'ERROR') {
    throw new Error(`Contract call ${functionName} failed: ${JSON.stringify(response)}`);
  }

  const txHash = response.hash;

  // Poll getTransaction until SUCCESS or FAILED
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2_000));
    const poll = await rpc.getTransaction(txHash);
    if (poll.status === 'SUCCESS') return txHash;
    if (poll.status === 'FAILED') throw new Error(`TX failed: ${txHash}`);
    // NOT_FOUND = still pending, keep polling
  }
  throw new Error(`TX not confirmed after polling: ${txHash}`);
}

// ─── Contract functions ───────────────────────────────────────────────────────

/** Register a new pending order on-chain. */
export async function contractCreateOrder(
  orderId: string,
  merchantAddress: string,
  amountStroops: number
): Promise<string> {
  const args = [
    StellarSdk.xdr.ScVal.scvBytes(orderIdToBytes(orderId)),
    new StellarSdk.Address(merchantAddress).toScVal(),
    StellarSdk.nativeToScVal(BigInt(amountStroops), { type: 'i128' }),
  ];
  return invokeContract('create_order', args);
}

/** Mark an order as paid — called by the backend watcher after verifying on Horizon. */
export async function contractConfirmPayment(
  orderId: string,
  assetPaid: string,
  txHash: string
): Promise<string> {
  // tx_ref in contract is BytesN<32> — store the first 32 bytes of the tx hash
  const txHashBytes = Buffer.from(txHash.padEnd(64, '0').slice(0, 64), 'hex');
  const args = [
    StellarSdk.xdr.ScVal.scvBytes(orderIdToBytes(orderId)),
    StellarSdk.xdr.ScVal.scvSymbol(assetPaid),
    StellarSdk.xdr.ScVal.scvBytes(txHashBytes),
  ];
  return invokeContract('confirm_payment', args);
}

/** Expire a pending order. */
export async function contractExpireOrder(orderId: string): Promise<string> {
  const args = [StellarSdk.xdr.ScVal.scvBytes(orderIdToBytes(orderId))];
  return invokeContract('expire_order', args);
}

/** Read order status from chain (frontend fallback). */
export async function contractGetStatus(orderId: string): Promise<string> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const kp = adminKeypair();
  const account = await rpc.getAccount(kp.publicKey());

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'get_status',
        StellarSdk.xdr.ScVal.scvBytes(orderIdToBytes(orderId))
      )
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${JSON.stringify(sim)}`);
  }

  const result = (sim as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) return 'Unknown';

  // OrderStatus enum serializes as scvVec([scvSymbol("Pending")])
  const val = result.retval;
  if (val.switch() === StellarSdk.xdr.ScValType.scvVec()) {
    const vec = val.vec();
    if (vec && vec.length > 0) {
      const sym = vec[0];
      if (sym.switch() === StellarSdk.xdr.ScValType.scvSymbol()) {
        return sym.sym().toString();
      }
    }
  }
  return 'Unknown';
}
