"use client";

import { useRouter } from "next/navigation";
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
  const { address } = useWalletContext();
  const { balanceUsdc, orders, loading, error } = useDashboard(address);

  const idr = (balanceUsdc * 15_700).toLocaleString("id-ID");

  return (
    <WebShell
      title="Home"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          New product
        </MetalButton>
      }
    >
      {/* balance card */}
      <motion.div
        className="liquid-glass mb-[30px] max-w-[520px] rounded-[28px] p-10"
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="mb-3 text-[13px] uppercase tracking-[.1em] text-muted">
          Balance
        </div>
        {loading ? (
          <Skeleton className="h-16 w-48" />
        ) : (
          <>
            <div className="tnum font-display text-[64px] font-extrabold leading-[.95] tracking-[-.04em]">
              ${balanceUsdc.toFixed(2)}
            </div>
            <div className="mt-2.5 text-[15px] text-muted">≈ Rp{idr}</div>
            {address && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[12px] text-muted">
                  {address.slice(0, 8)}…{address.slice(-6)}
                </span>
              </div>
            )}
          </>
        )}
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
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-ink/[.05] px-6 py-[18px] last:border-b-0"
              >
                <span className="font-display text-[15px] font-semibold">{o.title}</span>
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
