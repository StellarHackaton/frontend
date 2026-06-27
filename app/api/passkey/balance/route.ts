import { NextRequest, NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, NETWORK_PASSPHRASE } from "@/lib/stellar";

// USDC Stellar Asset Contract (SAC) on testnet
const USDC_SAC = process.env.NEXT_PUBLIC_USDC_SAC ?? "";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !USDC_SAC) {
    return NextResponse.json({ balance: 0 });
  }

  try {
    const contract = new StellarSdk.Contract(USDC_SAC);

    // Use a random keypair as tx source — simulation only, never submitted
    const dummy = StellarSdk.Keypair.random();
    const source = new StellarSdk.Account(dummy.publicKey(), "0");

    const tx = new StellarSdk.TransactionBuilder(source, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call("balance", new StellarSdk.Address(address).toScVal())
      )
      .setTimeout(30)
      .build();

    const sim = await rpc.simulateTransaction(tx);

    if (StellarSdk.rpc.Api.isSimulationError(sim)) {
      return NextResponse.json({ balance: 0 });
    }

    const result = (sim as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result;
    if (!result) return NextResponse.json({ balance: 0 });

    // SAC balance() returns i128 in stroops (7 decimal places)
    const raw = StellarSdk.scValToNative(result.retval) as bigint;
    const balance = Number(raw) / 10_000_000;

    return NextResponse.json({ balance });
  } catch (e) {
    console.error("SAC balance error:", e);
    return NextResponse.json({ balance: 0 });
  }
}
