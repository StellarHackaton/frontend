import { NextRequest, NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@/lib/stellar";

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

async function ensureFunded(address: string) {
  try {
    await rpc.getAccount(address);
    return; // already exists
  } catch {
    // Account not found → fund via testnet friendbot
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error(`Friendbot gagal: ${await res.text()}`);
    // Wait a bit for the ledger to close
    await new Promise((r) => setTimeout(r, 5000));
  }
}

export async function POST(req: NextRequest) {
  let xdr: string;
  try {
    const body = await req.json();
    xdr = body.xdr;
    if (!xdr) throw new Error("missing xdr");
  } catch {
    return NextResponse.json({ error: "Body harus JSON { xdr: string }" }, { status: 400 });
  }

  try {
    // Parse the signed transaction to get the source account
    const tx = StellarSdk.TransactionBuilder.fromXDR(
      xdr,
      TESTNET_PASSPHRASE
    ) as StellarSdk.Transaction;

    // Fund the source account if not yet on testnet
    await ensureFunded(tx.source);

    // Submit the fully-signed transaction directly to Soroban RPC
    const send = await rpc.sendTransaction(tx);
    if (send.status === "ERROR") {
      throw new Error(`sendTransaction error: ${JSON.stringify(send)}`);
    }

    const hash = send.hash;

    // Poll until confirmed
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await rpc.getTransaction(hash);
      if (poll.status === "SUCCESS") {
        return NextResponse.json({ hash, status: "SUCCESS" });
      }
      if (poll.status === "FAILED") {
        throw new Error(`TX gagal: ${hash}`);
      }
      // NOT_FOUND = still pending, keep polling
    }

    // Timeout but tx was submitted — return hash anyway
    return NextResponse.json({ hash, status: "PENDING" });
  } catch (e: any) {
    console.error("[passkey/send]", e);
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
