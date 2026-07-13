"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { PaymentIcon } from "@/components/ui/PaymentIcon";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardOrder } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";
import { timeAgo, formatDT } from "@/lib/time";

const HORIZON_EXPLORER = "https://stellar.expert/explorer/testnet/tx/";

export function Orders() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { orders, loading } = useDashboard(address);
  const [detail, setDetail] = useState<DashboardOrder | null>(null);
  const { t, lang } = useLang();

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
            title={t("orders.emptyTitle")}
            body={t("orders.emptyBody")}
          />
        ) : (
          <motion.div className="liquid-glass overflow-hidden rounded-[20px]" variants={listContainer} initial="initial" animate="animate">
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                variants={listItem}
                onClick={() => setDetail(o)}
                className={`flex cursor-pointer items-center gap-3.5 px-4 py-3 active:bg-ink/[.04] ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
              >
                {/* avatar: payment icon if paid, receipt icon if pending */}
                {o.assetPaid ? (
                  <div className="flex-none overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,.15)]">
                    <PaymentIcon code={o.assetPaid} size={44} radius={22} />
                  </div>
                ) : (
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink/[.07]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[15px] font-semibold">{o.title}</div>
                  <div className="mt-0.5 text-xs text-faint">
                    {o.status === "paid" && o.paidAt
                      ? `${t("orders.paidPrefix")} · ${timeAgo(o.paidAt, lang)}`
                      : `${t("orders.createdPrefix")} · ${timeAgo(o.createdAt, lang)}`}
                  </div>
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

      {/* Order detail — centered modal */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
              className="fixed inset-0 z-40 flex items-center justify-center px-4 pb-[88px] pt-6 bg-black/40 backdrop-blur-[3px]"
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-full overflow-y-auto rounded-[24px] bg-paper px-5 pb-6 pt-5 shadow-[0_24px_60px_rgba(0,0,0,.28)]"
            >
              {/* close button */}
              <button
                onClick={() => setDetail(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-ink/[.06]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[18px] font-bold">{detail.title}</div>
                  <div className="mt-0.5 text-[13px] text-muted">{formatDT(detail.createdAt, lang)}</div>
                </div>
                <StatusPill status={detail.status} />
              </div>

              {/* Detail rows */}
              <div className="mb-4 space-y-0 overflow-hidden rounded-[16px] bg-ink/[.04]">
                <DetailRow label={t("orders.amount")}>
                  <span className={`tnum font-display text-[15px] font-bold ${detail.status === "paid" ? "text-success" : "text-ink"}`}>
                    {detail.status === "paid" ? "+" : ""}${detail.amountUsdc.toFixed(2)}
                  </span>
                </DetailRow>
                {detail.assetPaid && (
                  <DetailRow label={t("orders.paidWith")}>
                    <div className="flex items-center gap-1.5">
                      <div className="overflow-hidden rounded-[5px]">
                        <PaymentIcon code={detail.assetPaid} size={18} radius={5} />
                      </div>
                      <span className="font-display text-[14px] font-semibold">{detail.assetPaid}</span>
                    </div>
                  </DetailRow>
                )}
                {detail.paidAt && (
                  <DetailRow label={t("orders.paidAt")}>
                    <span className="text-[13px]">{formatDT(detail.paidAt, lang)}</span>
                  </DetailRow>
                )}
              </div>

              {/* TX Hash */}
              {detail.txHash && (
                <a
                  href={`${HORIZON_EXPLORER}${detail.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center justify-between rounded-[14px] border border-ink/10 bg-white px-4 py-3 active:bg-ink/[.04]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold uppercase tracking-[.06em] text-muted">TX Hash</div>
                    <div className="mt-0.5 truncate font-mono text-[12px] text-ink">{detail.txHash}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-3 flex-none text-faint">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}

              {detail.status === "pending" && (
                <button
                  onClick={() => { setDetail(null); router.push(`/p/${detail.id}`); }}
                  className="w-full rounded-[14px] bg-primary py-3.5 font-semibold text-white active:opacity-80"
                >
                  Lihat QR →
                </button>
              )}
            </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TabBar />
    </MobileShell>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/[.06] px-4 py-3 last:border-b-0">
      <span className="text-[13px] text-muted">{label}</span>
      {children}
    </div>
  );
}
