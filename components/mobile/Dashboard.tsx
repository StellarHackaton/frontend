"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TabBar } from "./TabBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { useEscClose } from "@/lib/useEscClose";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export function Dashboard() {
  const router = useRouter();
  const { address, userInitial, authStatus, isConnected, storeName } = useWalletContext();
  const { balanceUsdc, balanceCircleUsdc, orders, loading } = useDashboard(address);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const [monthlyTarget, setMonthlyTarget] = useState(200);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  useEscClose(notifOpen, () => setNotifOpen(false));

  useEffect(() => {
    setLastSeen(parseInt(localStorage.getItem("lunas_notif_seen") ?? "0", 10));
  }, []);

  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`lunas_target_${address}`);
    if (saved) setMonthlyTarget(parseFloat(saved));
  }, [address]);

  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isConnected) { router.replace("/login"); return; }
    if (storeName === undefined) return; // masih fetching, tunggu dulu
    if (storeName === null) { router.replace("/onboarding"); return; }
  }, [authStatus, isConnected, storeName, router]);

  const totalUsdc = balanceUsdc + balanceCircleUsdc;
  const idr = (totalUsdc * 15_700).toLocaleString("id-ID");
  const [whole, cents] = totalUsdc.toFixed(2).split(".");

  const paid = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status === "pending");
  const paidSum = paid.reduce((s, o) => s + o.amountUsdc, 0);
  const pendingSum = pending.reduce((s, o) => s + o.amountUsdc, 0);

  // Real notifications from orders (newest first, max 10)
  const notifs = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      title: o.title,
      meta: `$${o.amountUsdc.toFixed(2)} · ${timeAgo(o.createdAt)}`,
      paid: o.status === "paid",
    }));
  const newCount = orders.filter((o) => new Date(o.createdAt).getTime() > lastSeen).length;

  // Monthly target (current month only)
  const nowDate = new Date();
  const thisMonthPaid = paid.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear();
  });
  const thisMonthSum = thisMonthPaid.reduce((s, o) => s + o.amountUsdc, 0);
  const targetPct = monthlyTarget > 0 ? Math.min(100, (thisMonthSum / monthlyTarget) * 100) : 0;

  function openNotif() {
    setNotifOpen((v) => !v);
    const now = Date.now();
    setLastSeen(now);
    localStorage.setItem("lunas_notif_seen", String(now));
  }

  function saveTarget() {
    const v = parseFloat(targetInput);
    if (!v || v <= 0 || !address) return;
    setMonthlyTarget(v);
    localStorage.setItem(`lunas_target_${address}`, String(v));
    setEditingTarget(false);
  }

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
        <div className="relative z-20 mb-7 flex items-center justify-between">
          <button
            onClick={() => router.push("/settings")}
            aria-label="Account"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-display text-base font-bold text-white ring-1 ring-white/15 backdrop-blur-md active:scale-90"
          >
            {userInitial}
            {address && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#0c0d12] bg-emerald-500" />
            )}
          </button>
          <button
            onClick={openNotif}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            {newCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF5A5A] ring-2 ring-[#0c0d12]" />}
          </button>
        </div>

        {/* notifications popover */}
        <AnimatePresence>
          {notifOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotifOpen(false)}
                className="fixed inset-0 z-30"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="absolute right-6 top-[58px] z-40 w-[280px] origin-top-right overflow-hidden rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(0,0,0,.45)] ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-display text-[15px] font-bold">Notifications</span>
                  {newCount > 0 && (
                    <span className="rounded-full bg-success/[.14] px-2 py-0.5 text-[11px] font-semibold text-success">
                      {newCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-[260px] overflow-y-auto">
                  {notifs.length === 0 && (
                    <p className="px-4 py-4 text-[13px] text-faint">Belum ada transaksi.</p>
                  )}
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNotifOpen(false);
                        router.push("/orders");
                      }}
                      className="flex w-full items-center gap-3 border-t border-ink/[.06] px-4 py-3 text-left active:bg-ink/[.03]"
                    >
                      <span
                        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
                          n.paid ? "bg-success/[.14] text-success" : "bg-ink/[.06] text-muted"
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {n.paid ? (
                            <path d="M20 6 9 17l-5-5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <>
                              <circle cx="12" cy="12" r="8" strokeWidth="2" />
                              <path d="M12 8v4l3 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          )}
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{n.title}</span>
                        <span className="mt-0.5 block text-xs text-faint">{n.meta}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    router.push("/orders");
                  }}
                  className="block w-full border-t border-ink/[.06] py-3 text-center font-display text-[14px] font-semibold text-primary active:bg-ink/[.03]"
                >
                  See all
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* balance */}
        <div className="relative text-[15px] text-white/55">Total balance</div>
        {loading ? (
          <div className="relative mt-2 h-12 w-40 animate-pulse rounded-xl bg-white/10" />
        ) : (
          <>
            <div className="tnum relative mt-1 font-display text-[52px] font-extrabold leading-none tracking-[-.04em]">
              ${whole}
              <span className="text-white/45">.{cents}</span>
            </div>
            <div className="relative mt-1.5 text-[13px] text-white/45">≈ Rp{idr}</div>
            {balanceCircleUsdc > 0 && (
              <div className="relative mt-2">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold text-indigo-300">
                  ${balanceCircleUsdc.toFixed(2)} Circle USDC (cross-chain)
                </span>
              </div>
            )}
          </>
        )}

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

        {/* summary cards */}
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <SummaryCard
            label="Awaiting"
            value={`$${pendingSum.toFixed(2)}`}
            sub={`${pending.length} pending`}
            tone="muted"
          />
          <SummaryCard
            label="Paid this month"
            value={`$${paidSum.toFixed(2)}`}
            sub={`${paid.length} paid`}
            tone="success"
          />
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
        <div className="flex-1 overflow-y-auto px-4 pb-[110px]">
          {/* monthly target progress */}
          <div className="liquid-glass mt-1 rounded-[20px] p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-[15px] font-bold">Monthly target</span>
              {editingTarget ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-muted">$</span>
                  <input
                    autoFocus
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveTarget(); if (e.key === "Escape") setEditingTarget(false); }}
                    className="w-20 rounded-[8px] border border-ink/20 bg-white px-2 py-1 font-mono text-[13px] text-ink outline-none focus:border-primary"
                    type="number" min="1" step="1"
                    placeholder={String(monthlyTarget)}
                  />
                  <button onClick={saveTarget} className="text-[12px] font-bold text-primary">OK</button>
                </div>
              ) : (
                <button
                  onClick={() => { setTargetInput(String(monthlyTarget)); setEditingTarget(true); }}
                  className="flex items-center gap-1 text-[13px] font-semibold text-primary"
                >
                  Set target
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F2A6B">
                    <path d="M9 6l6 6-6 6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-ink/[.08]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${targetPct}%` }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-muted">This month</span>
              <span className="tnum font-semibold text-ink">
                ${thisMonthSum.toFixed(2)} <span className="text-faint">/ ${monthlyTarget.toFixed(0)}</span>
              </span>
            </div>
          </div>

          {/* transactions */}
          <div className="mb-1 mt-5 px-2 font-display text-[15px] font-bold">
            Transactions
          </div>
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
            <motion.div variants={listContainer} initial="initial" animate="animate">
              {orders.map((o) => (
                <motion.button
                  key={o.id}
                  variants={listItem}
                  onClick={() =>
                    o.status === "pending"
                      ? router.push(`/p/${o.id}`)
                      : router.push("/orders")
                  }
                  className="flex w-full items-center gap-3.5 rounded-[16px] px-3 py-3 text-left active:bg-ink/[.05]"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white">
                    {o.title[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[15px] font-semibold">
                      {o.title}
                    </div>
                    <div className="mt-0.5 text-xs text-faint">
                      {o.status === "pending" ? "Tap to see QR · " : ""}{timeAgo(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1">
                    <span
                      className={`tnum font-display text-[15px] font-bold ${
                        o.status === "paid" ? "text-success" : "text-ink"
                      }`}
                    >
                      {o.status === "paid" ? "+" : ""}${o.amountUsdc.toFixed(2)}
                    </span>
                    <StatusPill status={o.status} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <TabBar />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "success" | "muted";
}) {
  return (
    <div className="rounded-[20px] bg-white/[.08] p-4 ring-1 ring-white/10 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[13px] text-white/55">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tone === "success" ? "#3DDc97" : "#FFB020" }}
        />
        {label}
      </div>
      <div className="tnum mt-1.5 font-display text-[22px] font-bold">{value}</div>
      <div className="mt-0.5 text-xs text-white/40">{sub}</div>
    </div>
  );
}
