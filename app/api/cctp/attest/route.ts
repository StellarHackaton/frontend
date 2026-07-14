/**
 * GET /api/cctp/attest?txHash=0x...&sourceDomain=6
 *
 * Polls Circle's Iris attestation API for a given EVM burn transaction.
 * Returns { status, message, attestation } when ready.
 */
import { NextRequest, NextResponse } from "next/server";
import { ATTESTATION_API } from "@/lib/cctp";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const txHash = req.nextUrl.searchParams.get("txHash");
  const sourceDomain = req.nextUrl.searchParams.get("sourceDomain") ?? "6";

  if (!txHash) {
    return NextResponse.json({ error: "Missing txHash" }, { status: 400 });
  }

  try {
    const url = `${ATTESTATION_API}/v2/messages/${sourceDomain}?transactionHash=${txHash}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // No caching — we want fresh status each poll
      cache: "no-store",
    });

    if (!res.ok) {
      // 404 means Circle hasn't indexed the tx yet (too early)
      if (res.status === 404) {
        return NextResponse.json({ status: "pending" });
      }
      return NextResponse.json({ error: `Attestation API error: ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return NextResponse.json({ status: "pending" });
    }
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ status: "pending" });
    }
    const msg = data?.messages?.[0];

    if (!msg) {
      return NextResponse.json({ status: "pending" });
    }

    const { status, message, attestation } = msg;

    if (status !== "complete" || !attestation || attestation === "PENDING") {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({ status: "complete", message, attestation });
  } catch (err: any) {
    console.error("/api/cctp/attest error:", err.message);
    return NextResponse.json({ error: "Failed to fetch attestation" }, { status: 500 });
  }
}
