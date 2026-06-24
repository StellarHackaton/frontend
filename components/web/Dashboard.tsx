"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WebShell } from "./WebShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { orders } from "@/lib/mock";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useMockLoad } from "@/lib/useMockLoad";

export function Dashboard() {
  const router = useRouter();
  const loading = useMockLoad();
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
        <div className="tnum font-display text-[64px] font-extrabold leading-[.95] tracking-[-.04em]">
          $240.00
        </div>
        <div className="mt-2.5 text-[15px] text-muted">≈ Rp3,768,000</div>
      </motion.div>

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
            <span className="font-display text-[15px] font-semibold">
              {o.item}
            </span>
            <span className="text-sm text-muted">{o.time}</span>
            <span className="tnum text-right font-display text-[15px] font-semibold">
              {o.amount}
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
