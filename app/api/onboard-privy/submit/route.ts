import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASE, horizon } from '@/lib/stellar';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { xdr, address, signature } = await req.json() as {
      xdr: string;
      address: string;
      signature: string; // 0x-prefixed hex from Privy signRawHash
    };

    if (!xdr || !address || !signature) {
      return NextResponse.json({ error: 'Missing xdr, address, or signature' }, { status: 400 });
    }

    // Parse the unsigned transaction
    const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction;

    // Decode signature (strip 0x prefix, parse hex → bytes)
    const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
    const sigBytes = Buffer.from(sigHex, 'hex');

    // Build key hint (last 4 bytes of raw Ed25519 public key)
    const rawKey = StellarSdk.StrKey.decodeEd25519PublicKey(address);
    const hint = Buffer.from(rawKey.slice(-4));

    // Attach the decorated signature
    tx.signatures.push(new StellarSdk.xdr.DecoratedSignature({ hint, signature: sigBytes }));

    // Submit to Horizon
    const result = await horizon.submitTransaction(tx);
    return NextResponse.json({ success: true, hash: result.hash });
  } catch (err: any) {
    const codes = err?.response?.data?.extras?.result_codes;
    console.error('/api/onboard-privy/submit error:', codes ?? err?.message);
    return NextResponse.json(
      { error: codes ? JSON.stringify(codes) : 'Submission failed' },
      { status: 400 }
    );
  }
}
