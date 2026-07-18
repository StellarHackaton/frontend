"use client";

import { useEffect, useRef, useState } from "react";
import { useWalletContext } from "./wallet-context";
import { formatUsd } from "./format";
import { useLang } from "./i18n";

export interface CheckoutOption {
  key: string;
  label: string;
  emoji: string;
  approx: string;
  sourceAmount: string;
  assetCode: string;
  assetIssuer: string | null;
  path: Array<{ assetCode: string; assetIssuer: string | null }>;
  enabled: boolean;
  helper?: string;
}

export interface CheckoutOrder {
  id: string;
  merchant_address: string;
  amount_stroops: number;
  status: string;
  product_title: string;
  merchant_name: string | null;
  merchant_verified: boolean;
}

export type CheckoutScreen = "checkout" | "processing" | "success" | "edge";
export type EdgeKind = "nobalance" | "expired" | "paid" | null;

const EMOJI: Record<string, string> = {
  USDC: "💵",
  EURC: "💶",
  PYUSD: "💳",
  XLM: "🪙",
};

export function useCheckout(orderId: string) {
  const { address, walletType, signXdr } = useWalletContext();
  const { t } = useLang();

  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [options, setOptions] = useState<CheckoutOption[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [screen, setScreen] = useState<CheckoutScreen>("checkout");
  const [edge, setEdge] = useState<EdgeKind>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const payingRef = useRef(false);

  // Fetch order on mount
  useEffect(() => {
    let cancelled = false;
    setOrderLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then(({ order: o }) => {
        if (cancelled) return;
        if (!o) { setEdge("expired"); setScreen("edge"); return; }
        if (o.status === "paid") { setEdge("paid"); setScreen("edge"); return; }
        if (o.status === "expired") { setEdge("expired"); setScreen("edge"); return; }
        setOrder(o);
      })
      .catch(() => { if (!cancelled) { setEdge("expired"); setScreen("edge"); } })
      .finally(() => { if (!cancelled) setOrderLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  // Fetch quote when order + wallet both ready
  useEffect(() => {
    if (!order || !address) { setOptions([]); return; }
    if (walletType === "passkey") {
      // Soroban contract accounts can't pathPay — show USDC-only option
      setOptions([{
        key: "USDC-direct",
        label: "Dollar (USDC)",
        emoji: "💵",
        approx: formatUsd(order.amount_stroops / 10_000_000),
        sourceAmount: (order.amount_stroops / 10_000_000).toFixed(7),
        assetCode: "USDC",
        assetIssuer: process.env.NEXT_PUBLIC_USDC_ISSUER ?? "",
        path: [],
        enabled: true,
      }]);
      setSelectedKey("USDC-direct");
      return;
    }
    let cancelled = false;
    setQuotesLoading(true);
    fetch(`/api/quote?orderId=${orderId}&buyerAddress=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then(({ options: opts }) => {
        if (cancelled) return;
        const mapped: CheckoutOption[] = (opts ?? []).map((o: any) => ({
          key: `${o.assetCode}-${o.assetIssuer ?? "native"}`,
          label: o.label,
          emoji: EMOJI[o.assetCode] ?? "💰",
          approx: `≈ ${parseFloat(o.sourceAmount).toFixed(4)} ${o.assetCode}`,
          sourceAmount: o.sourceAmount,
          assetCode: o.assetCode,
          assetIssuer: o.assetIssuer,
          path: o.path ?? [],
          enabled: true,
        }));
        setOptions(mapped);
        if (mapped.length > 0) setSelectedKey((k) => k || mapped[0].key);
        else setEdge("nobalance");
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setQuotesLoading(false); });
    return () => { cancelled = true; };
  }, [order?.id, address, walletType]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  function startPoll() {
    stopPoll();
    const start = Date.now();
    pollRef.current = setInterval(async () => {
      // Give up after 10 minutes
      if (Date.now() - start > 10 * 60 * 1000) { stopPoll(); setEdge("expired"); setScreen("edge"); return; }
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const { order: o } = await res.json();
        if (!o) return;
        if (o.status === "paid") {
          stopPoll();
          esRef.current?.close();
          setTxHash(o.tx_hash ?? null);
          setScreen("success");
        } else if (o.status === "expired") {
          stopPoll();
          esRef.current?.close();
          setEdge("expired");
          setScreen("edge");
        }
      } catch {}
    }, 3_000);
  }

  function openSSE() {
    esRef.current?.close();
    const es = new EventSource(`/api/stream/${orderId}`);
    esRef.current = es;
    es.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === "paid") {
        stopPoll();
        setTxHash(msg.txHash);
        setScreen("success");
        es.close();
      } else if (msg.type === "timeout") {
        stopPoll();
        setEdge("expired");
        setScreen("edge");
        es.close();
      }
    };
    // SSE died (Vercel timeout) — polling takes over
    es.onerror = () => es.close();
    // Always start polling as a fallback
    startPoll();
  }

  useEffect(() => () => { esRef.current?.close(); stopPoll(); }, []);

  async function pay() {
    if (payingRef.current) return;
    const option = options.find((o) => o.key === selectedKey);
    if (!option || !address || !order) return;
    payingRef.current = true;
    setPayError(null);
    setScreen("processing");
    try {
      // Build unsigned XDR server-side
      const txRes = await fetch("/api/tx/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          buyerAddress: address,
          sendAssetCode: option.assetCode,
          sendAssetIssuer: option.assetIssuer,
          sendMax: (parseFloat(option.sourceAmount) * 1.02).toFixed(7), // 2% slippage
          path: option.path,
        }),
      });
      const { xdr, error: txErr } = await txRes.json();
      if (!xdr) throw new Error(txErr ?? t("checkout.errBuildTx"));

      // Sign (passkey: signs+submits via /api/passkey/send; classic: signs only)
      const result = await signXdr(xdr);

      let txHash: string | null = null;

      if (walletType === "passkey") {
        // result is the tx hash returned by /api/passkey/send
        txHash = result;
      } else {
        // For classic wallets: submit signed XDR to Horizon
        const submitRes = await fetch("https://horizon-testnet.stellar.org/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `tx=${encodeURIComponent(result)}`,
        });
        if (!submitRes.ok) {
          const err = await submitRes.json().catch(() => ({}));
          console.error("Horizon 400:", JSON.stringify(err?.extras?.result_codes));
          const opCode = err?.extras?.result_codes?.operations?.[0];
          const txCode = err?.extras?.result_codes?.transaction;
          const code = opCode ?? txCode ?? "submission_failed";
          const friendly: Record<string, string> = {
            op_over_source_max: t("checkout.errRateChanged"),
            op_no_path: t("checkout.errNoPath"),
            op_underfunded: t("checkout.notEnoughBalance"),
            op_no_trust: t("checkout.errNoTrust"),
            tx_bad_seq: t("checkout.errBadSeq"),
            tx_insufficient_fee: t("checkout.errInsufficientFee"),
          };
          throw new Error(friendly[code] ?? code);
        }
        const submitJson = await submitRes.json().catch(() => ({}));
        txHash = submitJson.hash ?? null;
      }

      // Store hash in state immediately so Success screen has it from the start
      if (txHash) {
        setTxHash(txHash);
        fetch(`/api/orders/${orderId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash, assetCode: option.assetCode }),
        }).catch(() => {});
      }

      // Open SSE + polling as backup
      openSSE();
    } catch (err: any) {
      // If tx was already submitted (txHash exists), don't go back to checkout
      // — stay on processing and let SSE/poll detect confirmation
      if (!txHash) {
        payingRef.current = false;
        setPayError(err?.message ?? t("checkout.errPaymentFailed"));
        setScreen("checkout");
      }
    }
  }

  return {
    order,
    orderLoading,
    priceUSD: order ? order.amount_stroops / 10_000_000 : 0,
    options,
    quotesLoading,
    screen,
    edge,
    selectedKey,
    setSelectedKey,
    selected: options.find((o) => o.key === selectedKey) ?? null,
    pay,
    openSSE,
    payError,
    setPayError,
    txHash,
  };
}
