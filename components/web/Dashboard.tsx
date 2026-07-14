"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { WebShell } from "./WebShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardOrder } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";
import { timeAgo } from "@/lib/time";
import { useEscClose } from "@/lib/useEscClose";
import { Tour } from "@/components/ui/Tour";
import { WEB_TOUR_KEY, WEB_TOUR_STEPS } from "@/lib/tourSteps";

type Period = "day" | "week" | "month" | "year";
const PERIODS: Period[] = ["day", "week", "month", "year"];
const PERIOD_LABEL: Record<Period, string> = { day: "Day", week: "Week", month: "Month", year: "Year" };
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function periodBounds(period: Period, now: number) {
  const d = new Date(now);
  let start: number, prevStart: number, prevEnd: number;
  if (period === "day") {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    prevEnd = start;
    prevStart = start - 24 * 3600 * 1000;
  } else if (period === "week") {
    start = now - 7 * 24 * 3600 * 1000;
    prevEnd = start;
    prevStart = start - 7 * 24 * 3600 * 1000;
  } else if (period === "month") {
    start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    prevEnd = start;
  } else {
    start = new Date(d.getFullYear(), 0, 1).getTime();
    prevStart = new Date(d.getFullYear() - 1, 0, 1).getTime();
    prevEnd = start;
  }
  return { start, end: now, prevStart, prevEnd };
}

function pctChange(current: number, prev: number): number | null {
  if (prev <= 0) return current > 0 ? 100 : null;
  return ((current - prev) / prev) * 100;
}

export function Dashboard() {
  const router = useRouter();
  const { address, authStatus, isConnected, storeName } = useWalletContext();
  const { t, lang } = useLang();
  const { balanceUsdc, balanceCircleUsdc, orders, loading, error } = useDashboard(address);

  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isConnected) { router.replace("/login"); return; }
    if (storeName === undefined) return;
    if (storeName === null) { router.replace("/onboarding"); return; }
  }, [authStatus, isConnected, storeName, router]);

  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState(200);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  useEscClose(notifOpen, () => setNotifOpen(false));

  const totalUsdc = balanceUsdc + balanceCircleUsdc;
  const idr = (totalUsdc * 15_700).toLocaleString("id-ID");
  const now = Date.now();
  const { start, prevStart, prevEnd } = periodBounds(period, now);

  const inRange = (iso: string, from: number, to: number) => {
    const t = new Date(iso).getTime();
    return t >= from && t < to;
  };

  const thisOrders = orders.filter((o) => inRange(o.createdAt, start, now + 1));
  const prevOrders = orders.filter((o) => inRange(o.createdAt, prevStart, prevEnd));
  const thisPaid = thisOrders.filter((o) => o.status === "paid");
  const prevPaid = prevOrders.filter((o) => o.status === "paid");
  const thisPaidSum = thisPaid.reduce((s, o) => s + o.amountUsdc, 0);
  const prevPaidSum = prevPaid.reduce((s, o) => s + o.amountUsdc, 0);
  const awaiting = orders.filter((o) => o.status === "pending");
  const awaitingSum = awaiting.reduce((s, o) => s + o.amountUsdc, 0);

  const paidChangePct = pctChange(thisPaidSum, prevPaidSum);
  const orderChangePct = pctChange(thisOrders.length, prevOrders.length);

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
      bars.push({ label: MONTH_LABELS[m.getMonth()], value: sum });
    }
    return bars;
  }, [orders]);
  const monthlyMax = Math.max(1, ...monthly.map((m) => m.value));
  const selectedMonthIdx = monthly.length - 1; // current month, right-most bar

  // last 5 days, order activity per day
  const days = useMemo(() => {
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

  const paidCount = orders.filter((o) => o.status === "paid").length;
  const targetPct = monthlyTarget > 0 ? Math.min(100, (thisPaidSum / monthlyTarget) * 100) : 0;
  const donutR = 15.5;
  const donutC = 2 * Math.PI * donutR;

  function saveTarget() {
    const v = parseFloat(targetInput);
    if (!v || v <= 0) return;
    setMonthlyTarget(v);
    setEditingTarget(false);
  }

  const isSearching = search.trim().length > 0;
  const filteredOrders = (isSearching ? orders : thisOrders)
    .filter((o) => o.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const notifs = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const dateRangeLabel = new Date(start).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    + " – " + new Date(now).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <WebShell
      title="Home"
      action={
        <div className="flex items-center gap-3">
          <div className="liquid-glass flex items-center gap-2 rounded-btn px-4 py-2.5 text-[13.5px] text-muted transition-shadow focus-within:shadow-[0_0_0_2px_rgba(47,42,107,.28)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-none">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-[170px] bg-transparent text-ink outline-none placeholder:text-muted"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-ink/10 text-ink/60 hover:bg-ink/20"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              className="liquid-glass relative flex h-10 w-10 items-center justify-center rounded-full text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              {notifs.some((n) => n.status === "pending") && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    className="absolute right-0 top-12 z-40 w-[280px] origin-top-right overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,.18)] ring-1 ring-black/5"
                  >
                    <div className="border-b border-ink/[.06] px-4 py-3 font-display text-[14px] font-bold">
                      Notifications
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {notifs.length === 0 && (
                        <p className="px-4 py-4 text-[13px] text-faint">{t("orders.noTransactions")}</p>
                      )}
                      {notifs.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { setNotifOpen(false); router.push("/orders"); }}
                          className="flex w-full items-center gap-3 border-t border-ink/[.06] px-4 py-3 text-left first:border-t-0 hover:bg-ink/[.02]"
                        >
                          <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${n.status === "paid" ? "bg-success/[.14] text-success" : "bg-ink/[.06] text-muted"}`}>
                            {n.status === "paid" ? "✓" : "…"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold">{n.title}</span>
                            <span className="block text-[11px] text-faint">${n.amountUsdc.toFixed(2)} · {timeAgo(n.createdAt, lang)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { setNotifOpen(false); router.push("/orders"); }}
                      className="block w-full border-t border-ink/[.06] py-2.5 text-center font-display text-[13px] font-semibold text-primary hover:bg-ink/[.02]"
                    >
                      See all
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <span data-tour="web-new-product" className="inline-flex">
            <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
              {t("nav.newProduct")}
            </MetalButton>
          </span>
        </div>
      }
    >
      {/* filter row */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="liquid-glass relative flex gap-1 rounded-btn p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`relative rounded-btn px-4 py-2 text-[13px] font-semibold transition-colors ${
                period === p ? "text-white" : "text-muted"
              }`}
            >
              {period === p && (
                <motion.span
                  layoutId="period-pill"
                  className="absolute inset-0 rounded-btn bg-ink"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{PERIOD_LABEL[p]}</span>
            </button>
          ))}
        </div>
        <div className="liquid-glass flex items-center gap-2 rounded-btn px-4 py-2.5 text-[13px] font-medium text-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3.5 10h17" />
          </svg>
          {dateRangeLabel}
        </div>
      </div>

      {/* stats grid */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div data-tour="web-balance" className="liquid-surface flex flex-col rounded-[20px] p-6 text-white">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[13px] text-white/55">Total balance</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2.5" y="6" width="19" height="13" rx="3" />
                <path d="M2.5 10h19M6.5 15h4" />
              </svg>
            </span>
          </div>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-white/15" />
          ) : (
            <div className="tnum font-display text-[26px] font-bold tracking-[-.02em]">${totalUsdc.toFixed(2)}</div>
          )}
          <div className="mt-2.5 text-[12px] text-white/40">≈ Rp{idr}</div>
        </div>

        <StatTile
          label={`Paid this ${period}`}
          value={`$${thisPaidSum.toFixed(2)}`}
          changePct={paidChangePct}
          loading={loading}
          tint="emerald"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
        />
        <StatTile
          label="Awaiting payment"
          value={`$${awaitingSum.toFixed(2)}`}
          sub={`${awaiting.length} pending`}
          loading={loading}
          tint="amber"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
          }
        />
        <StatTile
          label={`Orders this ${period}`}
          value={String(thisOrders.length)}
          changePct={orderChangePct}
          sub={`${paidCount} paid all-time`}
          loading={loading}
          tint="violet"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 3h9l3 3v15H6z" />
              <path d="M9 10h6M9 14h6" />
            </svg>
          }
        />
      </div>

      {/* content grid: chart + target */}
      <motion.div
        className="mb-5 grid gap-5 lg:grid-cols-[1.65fr_1fr]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* revenue chart */}
        <div className="liquid-glass rounded-[24px] p-6">
          <div className="mb-5 font-display text-[16px] font-semibold">Revenue, last 6 months</div>
          <div className="flex gap-3">
            <div className="flex h-[190px] flex-col justify-between pb-6 text-[11px] text-faint">
              <span>${monthlyMax.toFixed(0)}</span>
              <span>${(monthlyMax / 2).toFixed(0)}</span>
              <span>$0</span>
            </div>
            <div className="flex h-[190px] flex-1 items-end justify-between gap-3 border-l border-ink/[.08] pl-4">
              {monthly.map((m, i) => (
                <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (m.value / monthlyMax) * 100)}%` }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                    className={`w-full max-w-[30px] rounded-[8px] ${
                      i === selectedMonthIdx
                        ? "bg-gradient-to-t from-primary to-[#8B7FFF] shadow-[0_4px_14px_rgba(47,42,107,.35)]"
                        : "bg-ink/[.10]"
                    }`}
                  />
                  <span className={`text-[11.5px] ${i === selectedMonthIdx ? "font-semibold text-ink" : "text-faint"}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* monthly target + activity */}
        <div className="liquid-glass flex flex-col rounded-[24px] p-6">
          <div className="mb-4 font-display text-[16px] font-semibold">This week</div>
          <div className="mb-5 flex justify-between">
            {days.map((d) => (
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

          <div className="mt-auto flex items-center justify-between gap-3 rounded-[16px] border border-ink/[.07] p-4">
            <div className="min-w-0">
              <div className="mb-1.5 font-display text-[14px] font-semibold">Monthly target</div>
              {editingTarget ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-muted">$</span>
                  <input
                    autoFocus
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveTarget(); if (e.key === "Escape") setEditingTarget(false); }}
                    type="number" min="1" step="1"
                    className="w-16 rounded-[6px] border border-ink/20 bg-white px-1.5 py-0.5 font-mono text-[12px] outline-none focus:border-primary"
                  />
                  <button onClick={saveTarget} className="text-[11px] font-bold text-primary">OK</button>
                </div>
              ) : (
                <button
                  onClick={() => { setTargetInput(String(monthlyTarget)); setEditingTarget(true); }}
                  className="text-[12px] font-semibold text-primary"
                >
                  ${thisPaidSum.toFixed(0)} / ${monthlyTarget.toFixed(0)}
                </button>
              )}
            </div>
            <div className="relative h-14 w-14 flex-none">
              <svg width="56" height="56" viewBox="0 0 36 36" className="-rotate-90">
                <defs>
                  <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2F2A6B" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" r={donutR} fill="none" stroke="rgba(21,22,27,.08)" strokeWidth="3.5" />
                <motion.circle
                  cx="18" cy="18" r={donutR} fill="none" stroke="url(#targetGradient)" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={donutC}
                  initial={{ strokeDashoffset: donutC }}
                  animate={{ strokeDashoffset: donutC - (donutC * targetPct) / 100 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-[12px] font-bold">
                {targetPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* orders table */}
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">
          {isSearching ? `Results for "${search.trim()}"` : "Orders"}
        </div>
        {isSearching && (
          <span className="text-[13px] text-faint">{filteredOrders.length} found</span>
        )}
      </div>
      <div data-tour="web-orders-table" className="liquid-glass overflow-hidden rounded-[20px]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-ink/[.06] px-6 py-4 text-xs font-semibold uppercase tracking-[.06em] text-faint">
          <span>{t("orders.item")}</span>
          <span>{t("orders.time")}</span>
          <span className="text-right">{t("orders.amount")}</span>
          <span className="text-right">{t("orders.status")}</span>
        </div>
        {loading ? (
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 border-b border-ink/[.05] px-6 py-[18px] last:border-b-0">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-14 justify-self-end" />
                <Skeleton className="h-6 w-16 justify-self-end" rounded="rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          isSearching ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
              <p className="font-display text-[15px] font-semibold">No orders match &quot;{search.trim()}&quot;</p>
              <p className="text-[13px] text-faint">Try a different name.</p>
            </div>
          ) : (
            <EmptyState icon={ReceiptIcon} title={t("orders.emptyTitle")} body={t("orders.emptyBody")} />
          )
        ) : (
          <motion.div variants={listContainer} initial="initial" animate="animate">
            {filteredOrders.map((o) => (
              <OrderRow key={o.id} o={o} lang={lang} t={t} onClick={() =>
                o.status === "pending" ? router.push(`/p/${o.id}`) : router.push("/orders")
              } />
            ))}
          </motion.div>
        )}
      </div>

      <Tour steps={WEB_TOUR_STEPS} storageKey={WEB_TOUR_KEY} />
    </WebShell>
  );
}

const TINT_BADGE: Record<string, string> = {
  emerald: "bg-success/[.16] text-success",
  amber: "bg-[#FFAA28]/[.18] text-[#C97A00]",
  violet: "bg-primary/[.14] text-primary",
  blue: "bg-[#0096FF]/[.16] text-[#0077CC]",
};

function StatTile({
  label, value, sub, changePct, loading, tint, icon,
}: {
  label: string;
  value: string;
  sub?: string;
  changePct?: number | null;
  loading?: boolean;
  tint?: "emerald" | "amber" | "violet" | "blue";
  icon?: React.ReactNode;
}) {
  const up = (changePct ?? 0) >= 0;
  return (
    <div className={`liquid-glass flex flex-col rounded-[20px] p-6 ${tint ? `tint-${tint}` : ""}`}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[13px] text-muted">{label}</span>
        {icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${tint ? TINT_BADGE[tint] : "bg-ink/[.06] text-muted"}`}>
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="tnum font-display text-[26px] font-bold tracking-[-.02em]">{value}</div>
      )}
      <div className="mt-2.5 text-[12px] text-faint">
        {changePct != null ? (
          <span className="inline-flex items-center gap-1.5">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full ${up ? "bg-success/[.14]" : "bg-danger/[.14]"}`}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={up ? "#1F9D78" : "#D14343"} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                {up ? <path d="m6 18 12-12M9 6h9v9" /> : <path d="M6 6l12 12M15 18H6V9" />}
              </svg>
            </span>
            <b className={up ? "text-success" : "text-danger"}>{Math.abs(changePct).toFixed(1)}%</b> vs last period
          </span>
        ) : (
          sub
        )}
      </div>
    </div>
  );
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#2F2A6B,#7C6FEF)",
  "linear-gradient(135deg,#15161B,#3A3550)",
  "linear-gradient(135deg,#1F9D78,#3ED9A6)",
  "linear-gradient(135deg,#C97A00,#FFAA28)",
  "linear-gradient(135deg,#0077CC,#38B6FF)",
  "linear-gradient(135deg,#A855F7,#E879F9)",
];
function avatarGradient(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function OrderRow({
  o, lang, t, onClick,
}: {
  o: DashboardOrder;
  lang: "en" | "id";
  t: (k: any) => string;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={listItem}
      onClick={onClick}
      className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-ink/[.05] px-6 py-[15px] last:border-b-0 transition-colors hover:bg-ink/[.02] active:bg-ink/[.04]"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] font-display text-[13px] font-bold text-white shadow-[0_3px_10px_rgba(21,22,27,.18)]"
          style={{ background: avatarGradient(o.id) }}
        >
          {o.title[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="truncate font-display text-[14.5px] font-semibold">{o.title}</div>
          {o.status === "pending" && (
            <div className="text-[11px] font-semibold text-primary opacity-70">{t("orders.viewQr")}</div>
          )}
        </div>
      </div>
      <span className="text-sm text-muted">{timeAgo(o.createdAt, lang)}</span>
      <span className="tnum text-right font-display text-[14.5px] font-semibold">${o.amountUsdc.toFixed(2)}</span>
      <span className="text-right"><StatusPill status={o.status} /></span>
    </motion.div>
  );
}
