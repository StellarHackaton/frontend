"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WebShell } from "./WebShell";
import { StatusPill } from "@/components/ui/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, ReceiptIcon } from "@/components/ui/EmptyState";
import { PaymentIcon } from "@/components/ui/PaymentIcon";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardOrder } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";
import { timeAgo, formatDT } from "@/lib/time";
import { useEscClose } from "@/lib/useEscClose";

const HORIZON_EXPLORER = "https://stellar.expert/explorer/testnet/tx/";

export function Orders() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { orders, loading } = useDashboard(address);
  const [detail, setDetail] = useState<DashboardOrder | null>(null);
  const { t, lang } = useLang();
  useEscClose(!!detail, () => setDetail(null));

  return (
    <WebShell
      title="Orders"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          {t("nav.newProduct")}
        </MetalButton>
      }
    >
      <div className="liquid-glass overflow-hidden rounded-[20px]">
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
        ) : orders.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title={t("orders.emptyTitle")} body={t("orders.emptyBody")} />
        ) : (
          <motion.div variants={listContainer} initial="initial" animate="animate">
            {orders.map((o) => (
              <motion.div
                key={o.id}
                variants={listItem}
                onClick={() => setDetail(o)}
                className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-ink/[.05] px-6 py-[18px] last:border-b-0 transition-colors hover:bg-ink/[.02] active:bg-ink/[.04]"
              >
                <div className="flex items-center gap-3">
                  {o.assetPaid ? (
                    <div className="flex-none overflow-hidden rounded-full shadow-[0_1px_6px_rgba(0,0,0,.12)]">
                      <PaymentIcon code={o.assetPaid} size={36} radius={18} />
                    </div>
                  ) : (
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink/[.06]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </span>
                  )}
                  <span className="font-display text-[15px] font-semibold">{o.title}</span>
                </div>
                <span className="text-sm text-muted">
                  {o.status === "paid" && o.paidAt ? timeAgo(o.paidAt, lang) : timeAgo(o.createdAt, lang)}
                </span>
                <span className={`tnum text-right font-display text-[15px] font-semibold ${o.status === "paid" ? "text-success" : ""}`}>
                  {o.status === "paid" ? "+" : ""}${o.amountUsdc.toFixed(2)}
                </span>
                <span className="text-right"><StatusPill status={o.status} /></span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setDetail(null)}
          >
            <div className="absolute inset-0 bg-ink/30 backdrop-blur-[4px]" />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[440px] rounded-[24px] bg-paper p-6 shadow-[0_24px_60px_rgba(0,0,0,.22)]"
            >
              <button
                onClick={() => setDetail(null)}
                aria-label={t("settings.close")}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-ink/[.06]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>

              <div className="mb-5 pr-8">
                <div className="font-display text-[20px] font-bold">{detail.title}</div>
                <div className="mt-1 text-sm text-muted">{formatDT(detail.createdAt, lang)}</div>
              </div>

              <div className="mb-4 overflow-hidden rounded-[14px] border border-ink/[.08] bg-white">
                <ModalRow label={t("orders.amount")}>
                  <span className={`tnum font-display text-[15px] font-bold ${detail.status === "paid" ? "text-success" : "text-ink"}`}>
                    {detail.status === "paid" ? "+" : ""}${detail.amountUsdc.toFixed(2)}
                  </span>
                </ModalRow>
                <ModalRow label={t("orders.status")}>
                  <StatusPill status={detail.status} />
                </ModalRow>
                {detail.assetPaid && (
                  <ModalRow label={t("orders.paidWith")}>
                    <div className="flex items-center gap-1.5">
                      <div className="overflow-hidden rounded-[5px]">
                        <PaymentIcon code={detail.assetPaid} size={18} radius={5} />
                      </div>
                      <span className="font-display text-sm font-semibold">{detail.assetPaid}</span>
                    </div>
                  </ModalRow>
                )}
                {detail.paidAt && (
                  <ModalRow label={t("orders.paidAt")}>
                    <span className="text-sm">{formatDT(detail.paidAt, lang)}</span>
                  </ModalRow>
                )}
              </div>

              {detail.txHash && (
                <a
                  href={`${HORIZON_EXPLORER}${detail.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[12px] border border-ink/[.08] bg-white px-4 py-3 hover:bg-ink/[.02]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[.07em] text-faint">TX Hash</div>
                    <div className="mt-0.5 truncate font-mono text-[12px] text-ink">{detail.txHash}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-3 flex-none text-faint">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WebShell>
  );
}

function ModalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/[.06] px-4 py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}
