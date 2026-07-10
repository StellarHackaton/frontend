"use client";

import { motion } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export function Orders() {
  const { address } = useWalletContext();
  const { orders, loading } = useDashboard(address);

  return (
    <MobileShell>
      <MobileHeader title="Orders" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-[100px] pt-2">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No orders yet"
            body="Share a payment link and your first order lands here."
          />
        ) : (
          <motion.div className="liquid-glass overflow-hidden rounded-[20px]" variants={listContainer} initial="initial" animate="animate">
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                variants={listItem}
                className={`flex items-center gap-3.5 px-4 py-3 ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white">
                  {o.title[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[15px] font-semibold">{o.title}</div>
                  <div className="mt-0.5 text-xs text-faint">{timeAgo(o.createdAt)}</div>
                </div>
                <div className="flex flex-none flex-col items-end gap-1">
                  <span className={`tnum font-display text-[15px] font-bold ${o.status === "paid" ? "text-success" : "text-ink"}`}>
                    {o.status === "paid" ? "+" : ""}${o.amountUsdc.toFixed(2)}
                  </span>
                  <StatusPill status={o.status} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <TabBar />
    </MobileShell>
  );
}
