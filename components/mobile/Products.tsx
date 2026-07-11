"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Fab } from "@/components/ui/Fab";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, BoxIcon } from "@/components/ui/EmptyState";
import { formatUsd } from "@/lib/format";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard, type DashboardProduct } from "@/lib/useDashboard";

type SheetMode = "menu" | "edit" | "confirm-delete";

export function Products() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { products, loading, refresh } = useDashboard(address);

  const [selected, setSelected] = useState<DashboardProduct | null>(null);
  const [mode, setMode] = useState<SheetMode>("menu");
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState("");

  function openMenu(p: DashboardProduct) {
    setSelected(p);
    setMode("menu");
    setSheetError("");
  }

  function openEdit() {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditPrice(selected.priceUSD.toFixed(2));
    setMode("edit");
  }

  function closeSheet() {
    setSelected(null);
    setSaving(false);
    setSheetError("");
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
        body: JSON.stringify({ merchantAddress: address, title: editTitle.trim(), priceUsdc: price }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      refresh();
      closeSheet();
    } catch (e: any) {
      setSheetError(e.message ?? "Gagal menyimpan");
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
      setSheetError("Gagal menghapus");
      setSaving(false);
    }
  }

  return (
    <MobileShell>
      <MobileHeader title="Products" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-[120px] pt-2">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
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
            className="liquid-glass overflow-hidden rounded-[20px]"
            variants={listContainer}
            initial="initial"
            animate="animate"
          >
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                variants={listItem}
                className={`flex items-center gap-2 px-4 py-3 ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
              >
                <button
                  className="flex flex-1 items-center gap-3.5 text-left"
                  onClick={() => router.push(`/p/${p.orderId}`)}
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white">
                    {p.title[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[15px] font-semibold">{p.title}</div>
                    <div className="mt-0.5 text-xs text-faint">{p.paidCount} paid so far</div>
                  </div>
                  <div className="tnum flex-none font-display text-[15px] font-bold">{formatUsd(p.priceUSD)}</div>
                </button>
                <button
                  onClick={() => openMenu(p)}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted active:bg-ink/[.06]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>
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
                  <div className="mb-4 font-display text-[17px] font-bold truncate">{selected.title}</div>
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
                    <span className="font-semibold">Edit produk</span>
                  </button>
                  <button
                    onClick={() => setMode("confirm-delete")}
                    className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-left active:bg-ink/[.04]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </span>
                    <span className="font-semibold text-red-500">Hapus produk</span>
                  </button>
                </>
              )}

              {mode === "edit" && (
                <>
                  <div className="mb-4 font-display text-[17px] font-bold">Edit produk</div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nama produk</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mb-4 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-primary"
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
                    className="mb-5 w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[15px] text-ink outline-none focus:border-primary"
                  />
                  {sheetError && <p className="mb-3 text-[13px] text-red-500">{sheetError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode("menu")}
                      className="flex-1 rounded-[14px] border border-ink/15 py-3.5 font-semibold text-muted active:bg-ink/[.04]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editTitle.trim() || !parseFloat(editPrice)}
                      className="flex-1 rounded-[14px] bg-primary py-3.5 font-semibold text-white disabled:opacity-50"
                    >
                      {saving ? "Menyimpan…" : "Simpan"}
                    </button>
                  </div>
                </>
              )}

              {mode === "confirm-delete" && (
                <>
                  <div className="mb-2 font-display text-[17px] font-bold">Hapus produk?</div>
                  <p className="mb-5 text-[14px] text-muted">
                    <span className="font-semibold text-ink">{selected.title}</span> akan dihapus permanen. Pesanan yang sudah ada tidak terpengaruh.
                  </p>
                  {sheetError && <p className="mb-3 text-[13px] text-red-500">{sheetError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode("menu")}
                      className="flex-1 rounded-[14px] border border-ink/15 py-3.5 font-semibold text-muted active:bg-ink/[.04]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={saving}
                      className="flex-1 rounded-[14px] bg-red-500 py-3.5 font-semibold text-white disabled:opacity-50"
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

      <Fab onClick={() => router.push("/create")} label="New product" />
      <TabBar />
    </MobileShell>
  );
}
