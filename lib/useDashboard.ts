"use client";

import { useEffect, useState } from "react";

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER ?? "";
const CIRCLE_USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export interface DashboardOrder {
  id: string;
  title: string;
  amountUsdc: number;
  status: "pending" | "paid" | "expired";
  createdAt: string;
}

export interface DashboardProduct {
  id: string;
  orderId: string;
  title: string;
  priceUSD: number;
  paidCount: number;
}

interface DashboardData {
  balanceUsdc: number;
  balanceCircleUsdc: number;
  orders: DashboardOrder[];
  products: DashboardProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

async function fetchBalances(address: string): Promise<{ usdc: number; circleUsdc: number }> {
  // C... = Soroban smart wallet (PasskeyKit)
  if (address.startsWith("C")) {
    const res = await fetch(`/api/passkey/balance?address=${encodeURIComponent(address)}`);
    if (!res.ok) return { usdc: 0, circleUsdc: 0 };
    const data = await res.json();
    return { usdc: data.balance ?? 0, circleUsdc: 0 };
  }

  // G... = classic Stellar account — query Horizon REST
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!res.ok) return { usdc: 0, circleUsdc: 0 };
  const data = await res.json();

  let usdc = 0;
  let circleUsdc = 0;
  for (const b of data.balances ?? []) {
    if (b.asset_type !== "credit_alphanum4" || b.asset_code !== "USDC") continue;
    if (b.asset_issuer === USDC_ISSUER) usdc = parseFloat(b.balance);
    if (b.asset_issuer === CIRCLE_USDC_ISSUER) circleUsdc = parseFloat(b.balance);
  }
  return { usdc, circleUsdc };
}

export function useDashboard(merchantAddress: string | null): DashboardData {
  const [balanceUsdc, setBalanceUsdc] = useState(0);
  const [balanceCircleUsdc, setBalanceCircleUsdc] = useState(0);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!merchantAddress) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchBalances(merchantAddress),
      fetch(`/api/orders?merchantAddress=${encodeURIComponent(merchantAddress)}`)
        .then((r) => r.json())
        .catch(() => ({ orders: [], products: [] })),
    ])
      .then(([balances, data]) => {
        if (cancelled) return;
        setBalanceUsdc(balances.usdc);
        setBalanceCircleUsdc(balances.circleUsdc);

        const rawOrders: any[] = data.orders ?? [];
        const rawProducts: any[] = data.products ?? [];

        const ords: DashboardOrder[] = rawOrders.map((o) => ({
          id: o.id,
          title: o.product_title ?? o.title ?? "Produk",
          amountUsdc: o.amount_stroops / 10_000_000,
          status: o.status,
          createdAt: o.created_at,
        }));
        setOrders(ords);

        const prods: DashboardProduct[] = rawProducts.map((p) => {
          const relatedOrder = rawOrders.find((o) => o.product_id === p.id);
          const paid = rawOrders.filter(
            (o) => o.product_id === p.id && o.status === "paid"
          ).length;
          return {
            id: p.id,
            orderId: relatedOrder?.id ?? p.id,
            title: p.title,
            priceUSD: p.price_stroops / 10_000_000,
            paidCount: paid,
          };
        });
        setProducts(prods);
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

  return { balanceUsdc, balanceCircleUsdc, orders, products, loading, error, refresh: () => setTick((t) => t + 1) };
}
