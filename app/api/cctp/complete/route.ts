/**
 * POST /api/cctp/complete
 * Body: { message: "0x...", attestation: "0x...", merchantAddress: "G..." }
 *
 * Submits the attested CCTP message to Stellar's CctpForwarder contract.
 * CctpForwarder atomically mints USDC and forwards it to merchantAddress.
 */
import { NextRequest, NextResponse } from "next/server";
import * as StellarSdk from "@stellar/stellar-sdk";
import { CCTP_FORWARDER_CONTRACT } from "@/lib/cctp";
import { markOrderPaid } from "@/lib/db";
import { contractConfirmPayment } from "@/lib/contract";

export const runtime = "nodejs";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const IS_MAINNET = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet";
const NETWORK = IS_MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;

// Server keypair to pay Stellar tx fees (uses CHECKOUT_ADMIN_SECRET from .env.local)
const ADMIN_SECRET = process.env.CHECKOUT_ADMIN_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { message, attestation, merchantAddress, orderId } = await req.json() as {
      message: string;       // hex: "0x..."
      attestation: string;   // hex: "0x..."
      merchantAddress: string;
      orderId?: string;
    };

    if (!message || !attestation || !merchantAddress) {
      return NextResponse.json({ error: "Missing message, attestation, or merchantAddress" }, { status: 400 });
    }

    if (!ADMIN_SECRET) {
      return NextResponse.json({ error: "Server misconfigured: missing CHECKOUT_ADMIN_SECRET" }, { status: 500 });
    }

    const adminKeypair = StellarSdk.Keypair.fromSecret(ADMIN_SECRET);
    const server = new StellarSdk.rpc.Server(RPC_URL);
    const horizonUrl = IS_MAINNET
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org";
    const usdcIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER ?? "GDUTNTK3AA5RUV3QCFYD3REH4MP7ET6BMIRYH5NGI6SOY6HZUPCINXZ3";

    // Pre-check: verify merchant has USDC trustline
    try {
      const acctRes = await fetch(`${horizonUrl}/accounts/${merchantAddress}`);
      if (acctRes.ok) {
        const acctData = await acctRes.json();
        const hasUsdcTrust = acctData.balances?.some(
          (b: any) => b.asset_code === "USDC" && b.asset_issuer === usdcIssuer
        );
        if (!hasUsdcTrust) {
          return NextResponse.json(
            { error: "Merchant account has no USDC trustline. Please add USDC to your Stellar wallet first." },
            { status: 400 }
          );
        }
      }
    } catch { /* ignore pre-check failure, let simulation catch it */ }

    // Convert hex strings to Buffer (strip 0x prefix)
    const messageBytes = Buffer.from(message.replace(/^0x/, ""), "hex");
    const attestationBytes = Buffer.from(attestation.replace(/^0x/, ""), "hex");

    // Build Soroban invocation: CctpForwarder.mint_and_forward(message, attestation)
    const contract = new StellarSdk.Contract(CCTP_FORWARDER_CONTRACT);
    const adminAccount = await server.getAccount(adminKeypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: "5000000", // 0.5 XLM max fee — Soroban ops cost more
      networkPassphrase: NETWORK,
    })
      .addOperation(
        contract.call(
          "mint_and_forward",
          StellarSdk.xdr.ScVal.scvBytes(messageBytes),
          StellarSdk.xdr.ScVal.scvBytes(attestationBytes)
        )
      )
      .setTimeout(120)
      .build();

    // Simulate first to get resource fees + footprint
    const simResult = await server.simulateTransaction(tx);

    if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
      console.error("Soroban simulation error:", simResult.error);
      return NextResponse.json(
        { error: `Soroban simulation failed: ${simResult.error}` },
        { status: 400 }
      );
    }

    // Assemble (adds resource fees + footprint from simulation)
    const assembled = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
    assembled.sign(adminKeypair);

    // Submit to Stellar RPC
    const sendResult = await server.sendTransaction(assembled);

    if (sendResult.status === "ERROR") {
      return NextResponse.json(
        { error: `Transaction error: ${sendResult.errorResult}` },
        { status: 400 }
      );
    }

    // Poll for confirmation
    const hash = sendResult.hash;
    let confirmed = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const status = await server.getTransaction(hash);
      if (status.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
        confirmed = true;
        break;
      }
      if (status.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
        return NextResponse.json({ error: "Soroban transaction failed on-chain" }, { status: 400 });
      }
    }

    if (!confirmed) {
      return NextResponse.json(
        { error: "Transaction submitted but not confirmed within timeout" },
        { status: 202 }
      );
    }

    if (orderId) {
      try {
        await markOrderPaid(orderId, "USDC-CCTP", hash);
      } catch (e) {
        console.warn("/api/cctp/complete: markOrderPaid failed (may already be paid):", e);
      }
      try {
        await contractConfirmPayment(orderId, "USDC", hash);
      } catch (e) {
        console.warn("/api/cctp/complete: contractConfirmPayment failed:", e);
      }
    }

    return NextResponse.json({ success: true, hash, merchantAddress });
  } catch (err: any) {
    console.error("/api/cctp/complete error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
