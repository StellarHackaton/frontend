"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TabBar } from "./TabBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { orders, merchant } from "@/lib/mock";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useMockLoad } from "@/lib/useMockLoad";

export function Dashboard() {
  const router = useRouter();
  const loading = useMockLoad();

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0c0d12] text-white">
      {/* dark hero */}
      <div className="relative flex-none px-6 pb-7 pt-5">
        {/* ambient glow top-right */}
        <div
          className="pointer-events-none absolute -right-10 top-0 h-[260px] w-[260px] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side,rgba(31,157,120,.45),rgba(0,150,255,.18),transparent)",
          }}
        />
        {/* decorative card stack peeking from the right */}
        <div className="pointer-events-none absolute right-0 top-[96px] h-[150px] w-[120px]">
          {[
            { c: "#FFD23F", x: 30, r: 12 },
            { c: "#1F9D78", x: 16, r: 8 },
            { c: "#3B82F6", x: 0, r: 4 },
          ].map((card, i) => (
            <div
              key={i}
              className="absolute right-0 h-[150px] w-[96px] rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,.35)]"
              style={{
                background: card.c,
                transform: `translateX(${card.x}px) rotate(${card.r}deg)`,
                zIndex: 3 - i,
              }}
            />
          ))}
        </div>

        {/* top bar */}
        <div className="relative mb-7 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-display text-base font-bold text-white ring-1 ring-white/15 backdrop-blur-md">
            {merchant.initial}
          </div>
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/10 backdrop-blur-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* balance */}
        <div className="relative text-[15px] text-white/55">Total balance</div>
        <div className="tnum relative mt-1 font-display text-[52px] font-extrabold leading-none tracking-[-.04em]">
          $240<span className="text-white/45">.00</span>
        </div>

        {/* action pills */}
        <div className="relative mt-6 flex gap-2.5">
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-[15px] font-semibold text-ink shadow-[0_8px_20px_rgba(0,0,0,.25)] active:scale-95"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#15161B">
              <path d="M12 5v14M5 12h14" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            New
          </button>
          <button
            onClick={() => router.push("/products")}
            className="rounded-full bg-white/10 px-5 py-2.5 font-display text-[15px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md active:scale-95"
          >
            Share
          </button>
        </div>

        {/* stat strip */}
        <div className="relative mt-6 flex items-center justify-between rounded-[20px] bg-white/[.08] px-5 py-4 ring-1 ring-white/10 backdrop-blur-md">
          <div>
            <div className="text-[13px] text-white/50">Paid this month</div>
            <div className="tnum mt-0.5 font-display text-[22px] font-bold">$48.00</div>
          </div>
          <div className="flex -space-x-2">
            {["#FFD23F", "#1F9D78", "#3B82F6"].map((c, i) => (
              <span
                key={i}
                className="h-7 w-7 rounded-full ring-2 ring-[#15161b]"
                style={{ background: c }}
              />
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white ring-2 ring-[#15161b]">
              +2
            </span>
          </div>
        </div>
      </div>

      {/* white transactions sheet */}
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative z-[1] flex flex-1 flex-col rounded-t-[28px] bg-paper text-ink shadow-[0_-12px_40px_rgba(0,0,0,.25)]"
      >
        {/* grabber */}
        <div className="mx-auto mt-2.5 h-1 w-10 flex-none rounded-full bg-ink/15" />
        {/* sheet header */}
        <div className="flex flex-none items-center justify-between px-6 py-3.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15161B">
            <path d="M4 7h16M4 12h16M4 17h10" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="font-display text-[17px] font-bold">Orders</span>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#15161B">
            <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
            <path d="m20 20-3.2-3.2" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-[110px]">
          {loading ? (
            <div className="flex flex-col gap-1 px-2">
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
              variants={listContainer}
              initial="initial"
              animate="animate"
            >
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  variants={listItem}
                  className="flex items-center gap-3.5 rounded-[16px] px-3 py-3 active:bg-ink/[.03]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white">
                    {o.item[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[15px] font-semibold">
                      {o.item}
                    </div>
                    <div className="mt-0.5 text-xs text-faint">{o.time}</div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1">
                    <span
                      className={`tnum font-display text-[15px] font-bold ${
                        o.status === "paid" ? "text-success" : "text-ink"
                      }`}
                    >
                      {o.status === "paid" ? "+" : ""}
                      {o.amount}
                    </span>
                    <StatusPill status={o.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <TabBar />
    </div>
  );
}
