"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WebShell } from "./WebShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, BoxIcon } from "@/components/ui/EmptyState";
import { formatUsd } from "@/lib/format";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardProduct } from "@/lib/useDashboard";
import { useLang } from "@/lib/i18n";

type Modal = { type: "edit"; product: DashboardProduct } | { type: "delete"; product: DashboardProduct } | null;

export function Products() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { products, loading, refresh } = useDashboard(address);
  const { t } = useLang();

  const [modal, setModal] = useState<Modal>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openEdit(p: DashboardProduct) {
    setEditTitle(p.title);
    setEditDescription(p.description);
    setEditPrice(p.priceUSD.toFixed(2));
    setModalError("");
    setModal({ type: "edit", product: p });
    setOpenMenuId(null);
  }

  function openDelete(p: DashboardProduct) {
    setModalError("");
    setModal({ type: "delete", product: p });
    setOpenMenuId(null);
  }

  async function handleGetQR(p: DashboardProduct) {
    if (!address) return;
    if (p.type === "permanent") {
      router.push(`/p/${p.id}`);
      return;
    }
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
    if (modal?.type !== "edit" || !address) return;
    const price = parseFloat(editPrice);
    if (!editTitle.trim() || !price || price <= 0) return;
    setSaving(true);
    setModalError("");
    try {
      const res = await fetch(`/api/products/${modal.product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantAddress: address, title: editTitle.trim(), description: editDescription.trim(), priceUsdc: price }),
      });
      if (!res.ok) throw new Error(t("common.errSave"));
      refresh();
      setModal(null);
    } catch (e: any) {
      setModalError(e.message ?? t("common.errSave"));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (modal?.type !== "delete" || !address) return;
    setSaving(true);
    try {
      await fetch(`/api/products/${modal.product.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantAddress: address }),
      });
      refresh();
      setModal(null);
    } catch {
      setModalError(t("common.errDelete"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <WebShell
      title="Products"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          {t("nav.newProduct")}
        </MetalButton>
      }
    >
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-ink/[.08] bg-white p-6">
              <Skeleton className="mb-2 h-5 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
              <div className="mt-6 flex items-center justify-between border-t border-ink/[.06] pt-4">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-8 w-24 rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={BoxIcon}
          title={t("products.emptyTitle")}
          body={t("products.emptyBody")}
          action={
            <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
              {t("nav.newProduct")}
            </MetalButton>
          }
        />
      ) : (
        <motion.div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          variants={listContainer}
          initial="initial"
          animate="animate"
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              variants={listItem}
              className="liquid-glass relative rounded-[20px] p-6"
            >
              {/* ⋯ menu */}
              <div className="absolute right-4 top-4" ref={openMenuId === p.id ? menuRef : undefined}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                  aria-label="More options"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-ink/[.06]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openMenuId === p.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-[14px] bg-white shadow-[0_8px_32px_rgba(0,0,0,.14)] ring-1 ring-black/5"
                    >
                      <button
                        onClick={() => openEdit(p)}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold hover:bg-ink/[.04]"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                        </svg>
                        {t("products.edit")}
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {t("products.delete")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card content */}
              <div className="pr-8">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <div className="font-display text-[17px] font-semibold leading-tight">{p.title}</div>
                  {p.type === "permanent" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Permanent
                    </span>
                  )}
                </div>
                {p.description ? (
                  <p className="line-clamp-2 text-[13px] leading-[1.5] text-muted">{p.description}</p>
                ) : (
                  <p className="text-[13px] italic text-faint">{t("products.noDescription")}</p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-ink/[.06] pt-4">
                <div>
                  <div className="tnum font-display text-[17px] font-bold">{formatUsd(p.priceUSD)}</div>
                  {p.paidCount > 0 && (
                    <div className="text-[12px] text-faint">{p.paidCount}{t("products.soldSuffix")}</div>
                  )}
                </div>
                <button
                  onClick={() => handleGetQR(p)}
                  disabled={creatingQR === p.id}
                  className="flex items-center gap-1.5 rounded-[11px] bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(47,42,107,.2)] hover:bg-primary/90 disabled:opacity-60"
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
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal overlay */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-paper p-7 shadow-[0_24px_60px_rgba(0,0,0,.22)]"
            >
              {modal.type === "edit" && (
                <>
                  <h2 className="mb-5 font-display text-[20px] font-bold">{t("products.editTitle")}</h2>
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">{t("products.name")}</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mb-3 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                    className="mb-3 w-full resize-none rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">{t("products.price")}</label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="mb-5 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[15px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  {modalError && <p className="mb-3 text-[13px] text-red-500">{modalError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 rounded-[12px] border border-ink/15 py-3 font-semibold text-muted hover:bg-ink/[.04]"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editTitle.trim() || !parseFloat(editPrice)}
                      className="flex-1 rounded-[12px] bg-primary py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? t("common.saving") : t("common.save")}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "delete" && (
                <>
                  <h2 className="mb-2 font-display text-[20px] font-bold">{t("products.deleteTitle")}</h2>
                  <p className="mb-6 text-[15px] text-muted">
                    <span className="font-semibold text-ink">{modal.product.title}</span> {t("products.deleteBody")}
                  </p>
                  {modalError && <p className="mb-3 text-[13px] text-red-500">{modalError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 rounded-[12px] border border-ink/15 py-3 font-semibold text-muted hover:bg-ink/[.04]"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={saving}
                      className="flex-1 rounded-[12px] bg-red-500 py-3 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
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
    </WebShell>
  );
}
