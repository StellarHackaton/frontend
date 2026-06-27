/**
 * Stellar SDK client helpers — Horizon (history + paths) and RPC (contract calls).
 * Import this server-side only (API routes, watcher).
 */
import * as StellarSdk from '@stellar/stellar-sdk';

// ─── Singletons ───────────────────────────────────────────────────────────────

export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const horizon = new StellarSdk.Horizon.Server(
  process.env.NEXT_PUBLIC_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'
);

export const rpc = new StellarSdk.rpc.Server(
  process.env.NEXT_PUBLIC_RPC_URL ?? 'https://soroban-testnet.stellar.org'
);

// ─── Asset helpers ────────────────────────────────────────────────────────────

export function parseAsset(assetStr: string): StellarSdk.Asset {
  if (assetStr === 'native' || assetStr === 'XLM') return StellarSdk.Asset.native();
  const [code, issuer] = assetStr.split(':');
  if (!code || !issuer) throw new Error(`Invalid asset string: ${assetStr}`);
  return new StellarSdk.Asset(code, issuer);
}

export function assetLabel(asset: StellarSdk.Asset): string {
  if (asset.isNative()) return 'XLM';
  return asset.getCode();
}

export const USDC_ASSET = parseAsset(
  process.env.NEXT_PUBLIC_USDC_ASSET ?? 'USDC:GDUTNTK3AA5RUV3QCFYD3REH4MP7ET6BMIRYH5NGI6SOY6HZUPCINXZ3'
);

// ─── Path-finding ─────────────────────────────────────────────────────────────

export interface PayableOption {
  assetCode: string;
  assetIssuer: string | null;
  label: string;       // friendly name shown in UI
  sourceAmount: string;
  path: Array<{ assetCode: string; assetIssuer: string | null }>;
}

const FRIENDLY_LABELS: Record<string, string> = {
  USDC:  'Dollar',
  EURC:  'Euro',
  PYUSD: 'Dollar (PayPal)',
  XLM:   'Saldo Stellar',
  native:'Saldo Stellar',
};

/**
 * Query Horizon strict-receive paths for a given buyer → USDC conversion.
 * Returns list of assets Budi can pay with + how much of each.
 */
export async function getPaymentPaths(
  buyerAddress: string,
  destAmountUsdc: string
): Promise<PayableOption[]> {
  // Pass buyerAddress as the source account — Horizon reads buyer's
  // actual balances and returns all assets that have a path to USDC.
  const records = await horizon
    .strictReceivePaths(buyerAddress, USDC_ASSET, destAmountUsdc)
    .call();

  return (records.records ?? [])
    .filter((r: any) => parseFloat(r.source_amount) > 0)
    .map((r: any) => {
      const code: string = r.source_asset_type === 'native' ? 'XLM' : r.source_asset_code;
      const issuer: string | null = r.source_asset_type === 'native' ? null : r.source_asset_issuer;
      return {
        assetCode: code,
        assetIssuer: issuer,
        label: FRIENDLY_LABELS[code] ?? code,
        sourceAmount: r.source_amount,
        path: (r.path ?? []).map((p: any) => ({
          assetCode: p.asset_type === 'native' ? 'XLM' : p.asset_code,
          assetIssuer: p.asset_type === 'native' ? null : p.asset_issuer,
        })),
      };
    });
}

// ─── Unsigned XDR builder ─────────────────────────────────────────────────────

/**
 * Build an unsigned pathPaymentStrictReceive transaction.
 * Returns the XDR string for the buyer to sign in their wallet.
 */
export async function buildPaymentXdr(params: {
  buyerAddress: string;
  merchantAddress: string;
  sendAssetCode: string;
  sendAssetIssuer: string | null;
  sendMax: string;
  destAmountUsdc: string;
  path: Array<{ assetCode: string; assetIssuer: string | null }>;
  memoText: string; // orderId (max 28 chars)
}): Promise<string> {
  const buyerAccount = await horizon.loadAccount(params.buyerAddress);

  const sendAsset =
    params.sendAssetCode === 'XLM' || params.sendAssetCode === 'native'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(params.sendAssetCode, params.sendAssetIssuer!);

  const intermediatePath = params.path
    .filter((p) => !(p.assetCode === 'XLM' && !p.assetIssuer))
    .map((p) =>
      p.assetCode === 'XLM'
        ? StellarSdk.Asset.native()
        : new StellarSdk.Asset(p.assetCode, p.assetIssuer!)
    );

  const tx = new StellarSdk.TransactionBuilder(buyerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax: params.sendMax,
        destination: params.merchantAddress,
        destAsset: USDC_ASSET,
        destAmount: params.destAmountUsdc,
        path: intermediatePath,
      })
    )
    .addMemo(StellarSdk.Memo.text(params.memoText))
    .setTimeout(60)
    .build();

  return tx.toXDR();
}

// ─── Payment watcher helpers ──────────────────────────────────────────────────

export interface MatchedPayment {
  txHash: string;
  assetCode: string;
  amount: string;
}

/**
 * Check recent inbound payments to merchant for a matching orderId memo.
 * Returns the matched payment, or null if not found yet.
 */
export async function findMatchingPayment(
  merchantAddress: string,
  expectedAmountStroops: number,
  orderId: string   // 28-char hex used as memo text
): Promise<MatchedPayment | null> {
  const expectedAmount = (expectedAmountStroops / 10_000_000).toFixed(7);
  const usdcCode = USDC_ASSET.getCode();
  const usdcIssuer = USDC_ASSET.getIssuer();

  const payments = await horizon
    .payments()
    .forAccount(merchantAddress)
    .order('desc')
    .limit(20)
    .call();

  for (const record of payments.records) {
    const p = record as any;

    // Only path_payment_strict_receive or payment in USDC
    const isUsdc =
      (p.asset_code === usdcCode && p.asset_issuer === usdcIssuer) ||
      (p.to_asset_code === usdcCode && p.to_asset_issuer === usdcIssuer);
    if (!isUsdc) continue;

    const amount = p.amount ?? p.to_amount;
    if (parseFloat(amount) !== parseFloat(expectedAmount)) continue;

    // Fetch the transaction to check memo
    const txRecord = await (record as any).transaction();
    if (txRecord.memo !== orderId) continue;

    return {
      txHash: txRecord.hash,
      assetCode: p.asset_code ?? p.from_asset_code ?? 'USDC',
      amount,
    };
  }
  return null;
}
