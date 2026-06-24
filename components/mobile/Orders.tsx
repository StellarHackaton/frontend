"use client";

import { motion } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Wordmark } from "@/components/ui/Wordmark";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { orders } from "@/lib/mock";
import { listContainer, listItem } from "@/lib/motion";
import { useMockLoad } from "@/lib/useMockLoad";

export function Orders() {
  const loading = useMockLoad();
  return (
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center justify-between px-6">
        <Wordmark />
        <span className="font-display text-base font-semibold">Orders</span>
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No orders yet"
            body="Share a payment link and your first order lands here."
          />
        ) : (
        <motion.div
          className="flex flex-col gap-2.5"
          variants={listContainer}
          initial="initial"
          animate="animate"
        >
          {orders.map((o) => (
            <motion.div
              key={o.id}
              variants={listItem}
              className="flex items-center justify-between rounded-[18px] border border-white/65 bg-white/55 p-3.5 shadow-[0_6px_18px_rgba(21,22,27,.06),inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-[16px]"
            >
              <div>
                <div className="font-display text-[15px] font-semibold">
                  {o.item}
                </div>
                <div className="mt-[3px] text-xs text-faint">{o.time}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="tnum font-display text-[15px] font-semibold">
                  {o.amount}
                </div>
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
