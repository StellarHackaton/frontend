/**
 * POST /api/merchant/stake
 * Verifies a merchant's stake transaction and marks them as verified.
 *
 * Flow:
 * 1. Merchant sends 10 USDC to ADMIN_PUBLIC_KEY from their wallet
 * 2. Merchant calls this endpoint with { address, txHash }
 * 3. We verify the tx on Horizon (correct amount, correct destination)
 * 4. Mark merchant as verified in DB
 */
import { NextRequest, NextResponse } from 'next/server';
import { setMerchantVerified, getMerchant } from '@/lib/db';

export const runtime = 'nodejs';

const HORIZON = process.env.NEXT_PUBLIC_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';
const ADMIN_ADDRESS = process.env.ADMIN_PUBLIC_KEY!;
const STAKE_AMOUNT = '10.0000000'; // 10 USDC
const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER ?? '';

export async function POST(req: NextRequest) {
  const { address, txHash } = await req.json() as { address: string; txHash: string };
  if (!address || !txHash) {
    return NextResponse.json({ error: 'address and txHash required' }, { status: 400 });
  }

  // Fetch tx from Horizon
  const res = await fetch(`${HORIZON}/transactions/${txHash}`);
  if (!res.ok) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  const tx = await res.json();

  // Fetch operations of this tx
  const opsRes = await fetch(`${HORIZON}/transactions/${txHash}/operations`);
  if (!opsRes.ok) return NextResponse.json({ error: 'Could not fetch operations' }, { status: 400 });
  const opsData = await opsRes.json();
  const ops = opsData._embedded?.records ?? [];

  // Find a payment of 10 USDC from merchant to admin
  const valid = ops.some((op: any) =>
    op.type === 'payment' &&
    op.from === address &&
    op.to === ADMIN_ADDRESS &&
    op.asset_type !== 'native' &&
    op.asset_code === 'USDC' &&
    op.asset_issuer === USDC_ISSUER &&
    parseFloat(op.amount) >= 10
  );

  if (!valid) {
    return NextResponse.json({
      error: `Transaksi tidak valid. Kirim minimal 10 USDC ke ${ADMIN_ADDRESS}`,
    }, { status: 400 });
  }

  await setMerchantVerified(address, txHash);
  const merchant = await getMerchant(address);
  return NextResponse.json({ merchant });
}
