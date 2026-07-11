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

type Modal = { type: "edit"; product: DashboardProduct } | { type: "delete"; product: DashboardProduct } | null;

export function Products() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { products, loading, refresh } = useDashboard(address);

  const [modal, setModal] = useState<Modal>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
        body: JSON.stringify({ merchantAddress: address, title: editTitle.trim(), priceUsdc: price }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      refresh();
      setModal(null);
    } catch (e: any) {
      setModalError(e.message ?? "Gagal menyimpan");
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
      setModalError("Gagal menghapus");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WebShell
      title="Products"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          New product
        </MetalButton>
      }
    >
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-ink/[.08] bg-white p-6">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="mt-6 h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={BoxIcon}
          title="No products yet"
          body="Create your first product to get a payment link."
          action={
            <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
              New product
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
              whileHover={{ y: -3 }}
              className="liquid-glass relative rounded-[20px] p-6"
            >
              {/* ⋯ menu */}
              <div className="absolute right-4 top-4" ref={openMenuId === p.id ? menuRef : undefined}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
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
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Hapus
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => router.push(`/p/${p.orderId}`)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between pr-8">
                  <div className="font-display text-[17px] font-semibold">{p.title}</div>
                  <div className="tnum font-display text-[17px] font-bold">{formatUsd(p.priceUSD)}</div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[13px] text-muted">{p.paidCount} paid so far</span>
                  <span className="text-[13px] font-semibold text-primary">View link →</span>
                </div>
              </button>
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
                  <h2 className="mb-5 font-display text-[20px] font-bold">Edit produk</h2>
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nama produk</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mb-4 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    maxLength={60}
                    autoFocus
                  />
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">Harga (USD)</label>
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
                      Batal
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editTitle.trim() || !parseFloat(editPrice)}
                      className="flex-1 rounded-[12px] bg-primary py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? "Menyimpan…" : "Simpan"}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "delete" && (
                <>
                  <h2 className="mb-2 font-display text-[20px] font-bold">Hapus produk?</h2>
                  <p className="mb-6 text-[15px] text-muted">
                    <span className="font-semibold text-ink">{modal.product.title}</span> akan dihapus permanen. Pesanan yang sudah ada tidak terpengaruh.
                  </p>
                  {modalError && <p className="mb-3 text-[13px] text-red-500">{modalError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal(null)}
                      className="flex-1 rounded-[12px] border border-ink/15 py-3 font-semibold text-muted hover:bg-ink/[.04]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={saving}
                      className="flex-1 rounded-[12px] bg-red-500 py-3 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {saving ? "Menghapus…" : "Hapus"}
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
