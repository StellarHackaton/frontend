"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/lib/wallet-context";

export function OnboardingFlow() {
  const router = useRouter();
  const { address, storeName, setStoreName } = useWalletContext();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Nama toko tidak boleh kosong"); return; }
    if (trimmed.length < 2) { setError("Minimal 2 karakter"); return; }
    if (!address) { setError("Wallet belum terkoneksi"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/merchant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, storeName: trimmed }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setStoreName(trimmed);
      router.replace("/dashboard");
    } catch {
      setError("Gagal menyimpan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  // Already has store name — redirect
  if (storeName) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f5f4f0] px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center font-display text-[22px] font-extrabold tracking-[-0.03em] text-primary">
          lunas
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_8px_40px_rgba(21,22,27,.10)]">
          <h1 className="mb-1 font-display text-[22px] font-bold">Beri nama tokomu</h1>
          <p className="mb-6 text-[14px] text-muted">
            Nama ini akan tampil ke buyer saat mereka melakukan pembayaran.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                Nama toko
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Warung Kopi Maju"
                maxLength={40}
                className="w-full rounded-[14px] border border-ink/[.12] bg-paper px-4 py-3 font-display text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {error && (
                <p className="mt-1.5 text-[12px] text-danger">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="mt-1 w-full rounded-[14px] bg-primary py-3.5 font-display text-[16px] font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Menyimpan…" : "Lanjutkan →"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-faint">
          Nama bisa diubah kapan saja di Settings
        </p>
      </div>
    </div>
  );
}
