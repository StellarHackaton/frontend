"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { StatusPill } from "@/components/ui/StatusPill";
import { TabBar } from "./TabBar";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { orders } from "@/lib/mock";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useMockLoad } from "@/lib/useMockLoad";

export function Dashboard() {
  const router = useRouter();
  const loading = useMockLoad();
  return (
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center justify-between px-6">
        <Wordmark />
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
          A
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <motion.div
          className="glass-strong relative my-2 mb-[26px] overflow-hidden rounded-[30px] px-6 pb-[26px] pt-6 text-center"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div
            className="pointer-events-none absolute -left-[30px] -top-[60px] h-[200px] w-[200px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side,rgba(255,255,255,.7),rgba(255,255,255,0))",
            }}
          />
          <div className="relative mb-2.5 text-[13px] uppercase tracking-[.1em] text-muted">
            Balance
          </div>
          <div className="tnum relative font-display text-[58px] font-extrabold leading-[.95] tracking-[-.04em]">
            $240.00
          </div>
          <div className="relative mt-2.5 text-[15px] text-muted">
            ≈ Rp3,768,000
          </div>
        </motion.div>

        <div className="mx-0.5 mb-3 font-display text-base font-semibold">
          Orders
        </div>
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
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

      <div className="flex-none px-[22px] pb-3 pt-3.5">
        <Button onClick={() => router.push("/create")}>
          New product
        </Button>
      </div>
      <TabBar />
    </MobileShell>
  );
}
