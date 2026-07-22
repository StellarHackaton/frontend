"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { EASE } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";
import { timeAgo } from "@/lib/time";

export function Insights() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { orders, loading } = useDashboard(address);
  const { t, lang } = useLang();
  const [monthlyTarget, setMonthlyTarget] = useState(200);

  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`lunas_target_${address}`);
    if (saved) setMonthlyTarget(parseFloat(saved));
  }, [address]);

  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  const thisMonthSum = paid
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + o.amountUsdc, 0);
  const targetPct = monthlyTarget > 0 ? Math.min(100, (thisMonthSum / monthlyTarget) * 100) : 0;
  const donutR = 15.5;
  const donutC = 2 * Math.PI * donutR;

  // last 6 calendar months of paid revenue, from real orders
  const monthly = useMemo(() => {
    const bars: { label: string; value: number }[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const sum = orders
        .filter((o) => o.status === "paid" && o.paidAt)
        .filter((o) => {
          const p = new Date(o.paidAt!);
          return p.getFullYear() === m.getFullYear() && p.getMonth() === m.getMonth();
        })
        .reduce((s, o) => s + o.amountUsdc, 0);
      bars.push({ label: m.toLocaleDateString("en-US", { month: "short" }), value: sum });
    }
    return bars;
  }, [orders]);
  const monthlyMax = Math.max(1, ...monthly.map((m) => m.value));
  const selectedMonthIdx = monthly.length - 1;

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  // last 5 days, order activity per day
  const activityDays = useMemo(() => {
    const out: { label: string; date: number; count: number; isToday: boolean }[] = [];
    const d = new Date();
    for (let i = 4; i >= 0; i--) {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
      const count = orders.filter((o) => {
        const c = new Date(o.createdAt);
        return c.getFullYear() === day.getFullYear() && c.getMonth() === day.getMonth() && c.getDate() === day.getDate();
      }).length;
      out.push({
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        date: day.getDate(),
        count,
        isToday: i === 0,
      });
    }
    return out;
  }, [orders]);

  return (
    <MobileShell>
      <MobileHeader title="Insights" />

      <div className="flex-1 overflow-y-auto px-4 pb-[110px] pt-1">
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="liquid-glass rounded-[20px] p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-5 h-[130px] w-full" rounded="rounded-[14px]" />
            </div>
            <div className="liquid-glass rounded-[20px] p-5">
              <Skeleton className="h-4 w-24" />
              <div className="mt-4 flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8" rounded="rounded-full" />
                ))}
              </div>
            </div>
            <div className="liquid-glass flex items-center justify-between gap-3 rounded-[20px] p-5">
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
              <Skeleton className="h-16 w-16" rounded="rounded-full" />
            </div>
          </div>
        ) : (
        <>
        {/* revenue chart */}
        <div className="liquid-glass rounded-[20px] p-5">
          <div className="font-display text-[15px] font-bold">Revenue, last 6 months</div>
          <div className="mt-4 flex gap-2.5">
            <div className="flex h-[150px] flex-col justify-between pb-5 text-[10px] text-faint">
              <span>${monthlyMax.toFixed(0)}</span>
              <span>${(monthlyMax / 2).toFixed(0)}</span>
              <span>$0</span>
            </div>
            <div className="flex h-[150px] flex-1 items-end justify-between gap-2 border-l border-ink/[.08] pl-3">
              {monthly.map((m, i) => (
                <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (m.value / monthlyMax) * 100)}%` }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                    className={`w-full max-w-[22px] rounded-[6px] ${
                      i === selectedMonthIdx
                        ? "bg-gradient-to-t from-primary to-[#8B7FFF] shadow-[0_3px_10px_rgba(47,42,107,.35)]"
                        : "bg-ink/[.10]"
                    }`}
                  />
                  <span className={`text-[10px] ${i === selectedMonthIdx ? "font-semibold text-ink" : "text-faint"}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* this week activity */}
        <div className="liquid-glass mt-4 rounded-[20px] p-5">
          <div className="font-display text-[15px] font-bold">This week</div>
          <div className="mt-4 flex justify-between">
            {activityDays.map((d) => (
              <div key={d.label + d.date} className="flex flex-col items-center gap-2">
                <span className="text-[11px] text-faint">{d.label}</span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium ${
                    d.isToday ? "bg-ink font-bold text-white" : d.count > 0 ? "bg-primary/10 font-semibold text-primary" : "text-ink"
                  }`}
                >
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* monthly target donut */}
        <div className="liquid-glass mt-4 flex items-center justify-between gap-3 rounded-[20px] p-5">
          <div className="min-w-0">
            <div className="font-display text-[15px] font-bold">Monthly target</div>
            <div className="tnum mt-1.5 text-[13px] text-muted">
              ${thisMonthSum.toFixed(0)} <span className="text-faint">/ ${monthlyTarget.toFixed(0)}</span>
            </div>
          </div>
          <div className="relative h-16 w-16 flex-none">
            <svg width="64" height="64" viewBox="0 0 36 36" className="-rotate-90">
              <defs>
                <linearGradient id="mobileTargetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2F2A6B" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r={donutR} fill="none" stroke="rgba(21,22,27,.08)" strokeWidth="3.5" />
              <motion.circle
                cx="18" cy="18" r={donutR} fill="none" stroke="url(#mobileTargetGradient)" strokeWidth="3.5" strokeLinecap="round"
                strokeDasharray={donutC}
                initial={{ strokeDashoffset: donutC }}
                animate={{ strokeDashoffset: donutC - (donutC * targetPct) / 100 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-bold">
              {targetPct.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* recent activity */}
        {recentOrders.length === 0 ? (
          <div className="liquid-glass mt-4 rounded-[20px] p-2">
            <EmptyState
              icon={ReceiptIcon}
              title={t("orders.emptyTitle")}
              body={t("orders.emptyBody")}
            />
          </div>
        ) : (
          <div className="liquid-glass mt-4 overflow-hidden rounded-[20px]">
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="font-display text-[15px] font-bold">Recent activity</div>
              <button onClick={() => router.push("/orders")} className="text-[12.5px] font-semibold text-primary">
                See all
              </button>
            </div>
            <div className="mt-1">
              {recentOrders.map((o, i) => (
                <button
                  key={o.id}
                  onClick={() => (o.status === "pending" ? router.push(`/p/${o.id}`) : router.push("/orders"))}
                  className={`flex w-full items-center gap-3 px-5 py-3 text-left active:bg-ink/[.03] ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink font-display text-[13px] font-bold text-white">
                    {o.title[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[14px] font-semibold">{o.title}</span>
                    <span className="block text-[11.5px] text-faint">{timeAgo(o.createdAt, lang)}</span>
                  </span>
                  <span className="flex flex-none flex-col items-end gap-1">
                    <span className={`tnum font-display text-[14px] font-bold ${o.status === "paid" ? "text-success" : "text-ink"}`}>
                      {o.status === "paid" ? "+" : ""}${o.amountUsdc.toFixed(2)}
                    </span>
                    <StatusPill status={o.status} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </MobileShell>
  );
}
