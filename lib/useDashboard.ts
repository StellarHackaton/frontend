"use client";

import { useEffect, useState } from "react";

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER ?? "";

export interface DashboardOrder {
  id: string;
  title: string;
  amountUsdc: number;
  status: "pending" | "paid" | "expired";
  createdAt: string;
}

interface DashboardData {
  balanceUsdc: number;
  orders: DashboardOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

async function fetchUsdcBalance(address: string): Promise<number> {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!res.ok) return 0;
  const data = await res.json();
  const b = (data.balances ?? []).find(
    (x: { asset_type: string; asset_code?: string; asset_issuer?: string }) =>
      x.asset_type === "credit_alphanum4" &&
      x.asset_code === "USDC" &&
      x.asset_issuer === USDC_ISSUER
  );
  return b ? parseFloat(b.balance) : 0;
}

export function useDashboard(merchantAddress: string | null): DashboardData {
  const [balanceUsdc, setBalanceUsdc] = useState(0);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!merchantAddress) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchUsdcBalance(merchantAddress),
      fetch(`/api/orders?merchantAddress=${encodeURIComponent(merchantAddress)}`)
        .then((r) => r.json())
        .then((data) =>
          (data.orders ?? []).map((o: {
            id: string;
            product_title?: string;
            title?: string;
            amount_stroops: number;
            status: "pending" | "paid" | "expired";
            created_at: string;
          }) => ({
            id: o.id,
            title: o.product_title ?? o.title ?? "Produk",
            amountUsdc: o.amount_stroops / 10_000_000,
            status: o.status,
            createdAt: o.created_at,
          }))
        )
        .catch(() => [] as DashboardOrder[]),
    ])
      .then(([balance, ords]) => {
        if (cancelled) return;
        setBalanceUsdc(balance);
        setOrders(ords);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Gagal memuat data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [merchantAddress, tick]);

  return { balanceUsdc, orders, loading, error, refresh: () => setTick((t) => t + 1) };
}
