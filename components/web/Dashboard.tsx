"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { WebShell } from "./WebShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Dashboard() {
  const router = useRouter();
  const { address, authStatus, isConnected, storeName } = useWalletContext();
  const { balanceUsdc, balanceCircleUsdc, orders, loading, error } = useDashboard(address);

  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isConnected) { router.replace("/login"); return; }
    if (storeName === undefined) return; // masih fetching, tunggu dulu
    if (storeName === null) { router.replace("/onboarding"); return; }
  }, [authStatus, isConnected, storeName, router]);

  const totalUsdc = balanceUsdc + balanceCircleUsdc;
  const idr = (totalUsdc * 15_700).toLocaleString("id-ID");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const paidCount = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const paidThisMonth = orders
    .filter((o) => o.status === "paid" && o.paidAt && new Date(o.paidAt).getTime() >= startOfMonth)
    .reduce((sum, o) => sum + o.amountUsdc, 0);

  const awaitingAmount = orders
    .filter((o) => o.status === "pending")
    .reduce((sum, o) => sum + o.amountUsdc, 0);

  return (
    <WebShell
      title="Home"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          New product
        </MetalButton>
      }
    >
      {/* balance + stats */}
      <motion.div
        className="mb-[30px] grid max-w-[920px] gap-5 lg:grid-cols-[1.5fr_1fr]"
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* balance */}
        <div className="liquid-glass flex flex-col rounded-[28px] p-9">
          <div className="flex items-center justify-between">
            <div className="text-[13px] uppercase tracking-[.1em] text-muted">
              Balance
            </div>
            {paidThisMonth > 0 && (
              <span className="rounded-full bg-success/[.14] px-3 py-1 text-[13px] font-semibold text-success">
                ↑ +${paidThisMonth.toFixed(2)} this month
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-16 w-48" />
          ) : (
            <>
              <div className="tnum mt-4 font-display text-[64px] font-extrabold leading-[.95] tracking-[-.04em]">
                ${totalUsdc.toFixed(2)}
              </div>
              <div className="mt-2.5 text-[15px] text-muted">≈ Rp{idr}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {balanceUsdc > 0 && (
                  <span className="rounded-full bg-ink/[.06] px-2.5 py-1 font-mono text-[11px] text-muted">
                    ${balanceUsdc.toFixed(2)} Stellar USDC
                  </span>
                )}
                {balanceCircleUsdc > 0 && (
                  <span className="rounded-full bg-indigo-500/[.12] px-2.5 py-1 font-mono text-[11px] font-semibold text-indigo-500">
                    ${balanceCircleUsdc.toFixed(2)} Circle USDC (cross-chain)
                  </span>
                )}
              </div>
              {address && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[12px] text-muted">
                    {address.slice(0, 8)}…{address.slice(-6)}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="mt-auto flex items-center gap-2 pt-7 text-[13px] text-muted">
            <span className="font-semibold text-ink">{orders.length} orders</span>
            <span className="text-faint">·</span>
            <span>{paidCount} paid</span>
            <span className="text-faint">·</span>
            <span>{pendingCount} pending</span>
          </div>
        </div>

        {/* stat tiles */}
        <div className="grid gap-5">
          <Stat
            label="Paid this month"
            value={`$${paidThisMonth.toFixed(2)}`}
            tone="success"
            icon={<path d="M20 6 9 17l-5-5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
          />
          <Stat
            label="Awaiting payment"
            value={`$${awaitingAmount.toFixed(2)}`}
            tone="muted"
            icon={<><circle cx="12" cy="12" r="8" strokeWidth="1.8" /><path d="M12 8v4l3 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>}
          />
        </div>
      </motion.div>

      {error && (
        <p className="mb-4 text-sm text-red-500">{error}</p>
      )}

      {/* orders table */}
      <div className="mb-4 font-display text-lg font-semibold">Orders</div>
      <div className="liquid-glass overflow-hidden rounded-[20px]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-ink/[.06] px-6 py-4 text-xs font-semibold uppercase tracking-[.06em] text-faint">
          <span>Item</span>
          <span>Time</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>
        {loading ? (
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-ink/[.05] px-6 py-[18px] last:border-b-0"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-14 justify-self-end" />
                <Skeleton className="h-6 w-16 justify-self-end" rounded="rounded-full" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No orders yet"
            body="Share a payment link and your first order lands here."
          />
        ) : (
          <motion.div variants={listContainer} initial="initial" animate="animate">
            {orders.map((o) => (
              <motion.div
                key={o.id}
                variants={listItem}
                onClick={() =>
                  o.status === "pending"
                    ? router.push(`/p/${o.id}`)
                    : router.push("/orders")
                }
                className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-ink/[.05] px-6 py-[18px] last:border-b-0 transition-colors hover:bg-ink/[.02] active:bg-ink/[.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px] font-semibold">{o.title}</span>
                  {o.status === "pending" && (
                    <span className="text-[11px] font-semibold text-primary opacity-60">Click to see QR</span>
                  )}
                </div>
                <span className="text-sm text-muted">{timeAgo(o.createdAt)}</span>
                <span className="tnum text-right font-display text-[15px] font-semibold">
                  ${o.amountUsdc.toFixed(2)}
                </span>
                <span className="text-right">
                  <StatusPill status={o.status} />
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </WebShell>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "success" | "muted";
  icon: React.ReactNode;
}) {
  const color = tone === "success" ? "#1F9D78" : "#6B6A73";
  return (
    <div className="liquid-glass flex items-center gap-4 rounded-[24px] p-6">
      <div
        className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px]"
        style={{ background: tone === "success" ? "rgba(31,157,120,.14)" : "rgba(21,22,27,.06)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}>
          {icon}
        </svg>
      </div>
      <div>
        <div className="text-[13px] text-muted">{label}</div>
        <div className="tnum mt-0.5 font-display text-[26px] font-bold tracking-[-.02em]">
          {value}
        </div>
      </div>
    </div>
  );
}
