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
import { EASE, listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { useEffect, useState, useRef } from "react";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}


export function Dashboard() {
  const router = useRouter();
  const { address, authStatus, isConnected, disconnect, userInitial } = useWalletContext();
  const { balanceUsdc, orders, loading } = useDashboard(address);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      authStatus !== "initializing" &&
      authStatus !== "in-progress" &&
      authStatus !== "logged-in" &&
      !isConnected
    ) {
      router.replace("/login");
    }
  }, [authStatus, isConnected, router]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await disconnect();
    // redirect handled by auth guard useEffect below (watches authStatus)
  };

  const idr = (balanceUsdc * 15_700).toLocaleString("id-ID");

  return (
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center justify-between px-6">
        <Wordmark />
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]"
          >
            {userInitial}
            {address && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 min-w-[140px] overflow-hidden rounded-[14px] border border-ink/[.08] bg-white shadow-[0_8px_30px_rgba(21,22,27,.12)]">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-[14px] font-medium text-red-500 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          )}
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
          {loading ? (
            <div className="relative mx-auto mt-2 h-14 w-36 animate-pulse rounded-xl bg-ink/10" />
          ) : (
            <>
              <div className="tnum relative font-display text-[58px] font-extrabold leading-[.95] tracking-[-.04em]">
                ${balanceUsdc.toFixed(2)}
              </div>
              <div className="relative mt-2.5 text-[15px] text-muted">
                ≈ Rp{idr}
              </div>
              {address && (
                <div className="relative mt-3 flex items-center justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px] text-muted">
                    {address.slice(0, 6)}…{address.slice(-4)}
                  </span>
                </div>
              )}
            </>
          )}
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
                    {o.title}
                  </div>
                  <div className="mt-[3px] text-xs text-faint">{timeAgo(o.createdAt)}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="tnum font-display text-[15px] font-semibold">
                    ${o.amountUsdc.toFixed(2)}
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
