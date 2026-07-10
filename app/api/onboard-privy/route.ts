import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASE, USDC_ASSET, horizon } from '@/lib/stellar';
import { CIRCLE_USDC_ISSUER_TESTNET } from '@/lib/cctp';

export const runtime = 'nodejs';

const FRIENDBOT = 'https://friendbot.stellar.org';

// Circle's USDC on Stellar testnet (received via CCTP from EVM chains)
const CIRCLE_USDC = new StellarSdk.Asset('USDC', CIRCLE_USDC_ISSUER_TESTNET);

function hasAsset(balances: any[], asset: StellarSdk.Asset) {
  return balances.some(
    (b) => b.asset_code === asset.getCode() && b.asset_issuer === asset.getIssuer()
  );
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

    // 1. Fund via friendbot if account doesn't exist
    let accountRecord: StellarSdk.Horizon.AccountResponse;
    try {
      accountRecord = await horizon.loadAccount(address);
    } catch {
      const fbRes = await fetch(`${FRIENDBOT}?addr=${encodeURIComponent(address)}`);
      if (!fbRes.ok) {
        return NextResponse.json({ error: 'Friendbot failed — try again in a few seconds' }, { status: 503 });
      }
      await new Promise((r) => setTimeout(r, 2500));
      try {
        accountRecord = await horizon.loadAccount(address);
      } catch {
        return NextResponse.json({ error: 'Account not yet active — try again in a few seconds' }, { status: 503 });
      }
    }

    const balances = accountRecord.balances as any[];
    const hasCustomUsdc = hasAsset(balances, USDC_ASSET);
    const hasCircleUsdc = hasAsset(balances, CIRCLE_USDC);

    // 2. If both trustlines exist, nothing to do
    if (hasCustomUsdc && hasCircleUsdc) {
      return NextResponse.json({ alreadySetup: true });
    }

    // 3. Build changeTrust for whichever trustlines are missing
    const ops: StellarSdk.Operation.Operation[] = [];
    if (!hasCustomUsdc) ops.push(StellarSdk.Operation.changeTrust({ asset: USDC_ASSET }));
    if (!hasCircleUsdc) ops.push(StellarSdk.Operation.changeTrust({ asset: CIRCLE_USDC }));

    const builder = new StellarSdk.TransactionBuilder(accountRecord, {
      fee: '1000000',
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    for (const op of ops) builder.addOperation(op);
    const tx = builder.setTimeout(300).build();

    return NextResponse.json({
      alreadySetup: false,
      xdr: tx.toXDR(),
      txHash: tx.hash().toString('hex'),
    });
  } catch (err) {
    console.error('/api/onboard-privy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
