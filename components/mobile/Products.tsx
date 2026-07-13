"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Fab } from "@/components/ui/Fab";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { EmptyState, BoxIcon } from "@/components/ui/EmptyState";
import { formatUsd } from "@/lib/format";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardProduct } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";

type SheetMode = "menu" | "edit" | "confirm-delete";

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] border border-ink/[.06] bg-white p-5">
      <div className="mb-3 h-5 w-1/2 rounded-md bg-ink/[.08]" />
      <div className="mb-1 h-3 w-full rounded bg-ink/[.06]" />
      <div className="mb-4 h-3 w-3/4 rounded bg-ink/[.06]" />
      <div className="flex items-center justify-between border-t border-ink/[.06] pt-3">
        <div className="h-5 w-14 rounded bg-ink/[.08]" />
        <div className="h-8 w-28 rounded-[10px] bg-ink/[.06]" />
      </div>
    </div>
  );
}

export function Products() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { products, loading, refresh } = useDashboard(address);
  const { t } = useLang();

  const [selected, setSelected] = useState<DashboardProduct | null>(null);
  const [mode, setMode] = useState<SheetMode>("menu");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [creatingQR, setCreatingQR] = useState<string | null>(null);

  function openMenu(p: DashboardProduct) {
    setSelected(p);
    setMode("menu");
    setSheetError("");
  }

  function openEdit() {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditDescription(selected.description);
    setEditPrice(selected.priceUSD.toFixed(2));
    setMode("edit");
  }

  function closeSheet() {
    setSelected(null);
    setSaving(false);
    setSheetError("");
  }

  async function handleGetQR(p: DashboardProduct) {
    if (!address) return;
    // Permanent products have a fixed link, no new order needed
    if (p.type === "permanent") {
      router.push(`/p/${p.id}`);
      return;
    }
    // One-time: create a fresh order on demand
    setCreatingQR(p.id);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantAddress: address, productId: p.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("products.errCreateQR"));
      router.push(`/p/${data.orderId}`);
    } catch {
      setCreatingQR(null);
    }
  }

  async function saveEdit() {
    if (!selected || !address || !editTitle.trim()) return;
    const price = parseFloat(editPrice);
    if (!price || price <= 0) return;
    setSaving(true);
    setSheetError("");
    try {
      const res = await fetch(`/api/products/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantAddress: address,
          title: editTitle.trim(),
          description: editDescription.trim(),
          priceUsdc: price,
        }),
      });
      if (!res.ok) throw new Error(t("common.errSave"));
      refresh();
      closeSheet();
    } catch (e: any) {
      setSheetError(e.message ?? t("common.errSave"));
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!selected || !address) return;
    setSaving(true);
    try {
      await fetch(`/api/products/${selected.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantAddress: address }),
      });
      refresh();
      closeSheet();
    } catch {
      setSheetError(t("common.errDelete"));
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <MobileHeader title="Products" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-[120px] pt-2">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={BoxIcon}
            title={t("products.emptyTitle")}
            body={t("products.emptyBody")}
            action={
              <button
                onClick={() => router.push("/create")}
                className="liquid-surface rounded-btn px-5 py-2.5 text-[14px] font-semibold text-white transition-transform active:scale-95"
              >
                {t("products.addProduct")}
              </button>
            }
          />
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={listContainer}
            initial="initial"
            animate="animate"
          >
            {products.map((p) => (
              <motion.div
                key={p.id}
                variants={listItem}
                className="relative rounded-[20px] border border-ink/[.07] bg-white shadow-[0_2px_12px_rgba(0,0,0,.06)]"
              >
                {/* ⋮ menu */}
                <button
                  onClick={() => openMenu(p)}
                  aria-label="More options"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-ink/[.06]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>

                <div className="p-5 pr-10">
                  {/* Title + badge */}
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-display text-[16px] font-bold leading-tight">
                      {p.title}
                    </span>
                    {p.type === "permanent" && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Permanent
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {p.description ? (
                    <p className="mb-4 line-clamp-2 text-[13px] leading-[1.5] text-muted">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mb-4 text-[13px] italic text-faint">{t("products.noDescription")}</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-ink/[.06] pt-3">
                    <div>
                      <div className="tnum font-display text-[18px] font-extrabold text-ink">
                        {formatUsd(p.priceUSD)}
                      </div>
                      {p.paidCount > 0 && (
                        <div className="text-[11px] text-faint">{p.paidCount}{t("products.soldSuffix")}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleGetQR(p)}
                      disabled={creatingQR === p.id}
                      className="flex items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(47,42,107,.25)] active:opacity-80 disabled:opacity-60"
                    >
                      {creatingQR === p.id ? (
                        <>
                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                          </svg>
                          {t("create.creating")}
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01"/>
                          </svg>
                          {t("products.generateQR")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-paper px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 shadow-[0_-8px_40px_rgba(0,0,0,.18)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />

              {mode === "menu" && (
                <>
                  <div className="mb-4 truncate font-display text-[17px] font-bold">{selected.title}</div>
                  <button
                    onClick={openEdit}
                    className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-left active:bg-ink/[.04]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                      </svg>
                    </span>
                    <span className="font-semibold">{t("products.editTitle")}</span>
                  </button>
                  <button
                    onClick={() => setMode("confirm-delete")}
                    className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-left active:bg-ink/[.04]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </span>
                    <span className="font-semibold text-red-500">{t("products.deleteProduct")}</span>
                  </button>
                </>
              )}

              {mode === "edit" && (
                <>
                  <div className="mb-4 font-display text-[17px] font-bold">{t("products.editTitle")}</div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">{t("products.name")}</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mb-3 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] outline-none focus:border-primary"
                    maxLength={60}
                    autoFocus
                  />
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">
                    {t("products.description")} <span className="font-normal text-faint">({t("products.optional")})</span>
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    maxLength={300}
                    className="mb-3 w-full resize-none rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] outline-none focus:border-primary"
                  />
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">{t("products.price")}</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="mb-5 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[15px] outline-none focus:border-primary"
                  />
                  {sheetError && <p className="mb-3 text-[13px] text-red-500">{sheetError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode("menu")}
                      className="flex-1 rounded-[14px] border border-ink/15 py-3.5 font-semibold text-muted active:bg-ink/[.04]"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editTitle.trim() || !parseFloat(editPrice)}
                      className="flex-1 rounded-[14px] bg-primary py-3.5 font-semibold text-white transition-transform active:scale-[.98] disabled:opacity-50"
                    >
                      {saving ? t("common.saving") : t("common.save")}
                    </button>
                  </div>
                </>
              )}

              {mode === "confirm-delete" && (
                <>
                  <div className="mb-2 font-display text-[17px] font-bold">{t("products.deleteTitle")}</div>
                  <p className="mb-5 text-[14px] text-muted">
                    <span className="font-semibold text-ink">{selected.title}</span> {t("products.deleteBody")}
                  </p>
                  {sheetError && <p className="mb-3 text-[13px] text-red-500">{sheetError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode("menu")}
                      className="flex-1 rounded-[14px] border border-ink/15 py-3.5 font-semibold text-muted active:bg-ink/[.04]"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={saving}
                      className="flex-1 rounded-[14px] bg-red-500 py-3.5 font-semibold text-white transition-transform active:scale-[.98] disabled:opacity-50"
                    >
                      {saving ? t("products.deleting") : t("products.delete")}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Fab onClick={() => router.push("/create")} label={t("nav.newProduct")} />
      <TabBar />
    </MobileShell>
  );
}
