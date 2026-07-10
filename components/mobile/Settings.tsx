"use client";

import { useState, useEffect } from "react";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Button } from "@/components/ui/Button";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { startSep24Withdrawal, KNOWN_ANCHORS } from "@/lib/sep24";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";

export function Settings() {
  const { address, userInitial, disconnect, storeName, setStoreName, walletType, signXdr } = useWalletContext();
  const { balanceUsdc } = useDashboard(address);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(storeName ?? "");
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [txHashInput, setTxHashInput] = useState("");
  const [staking, setStaking] = useState(false);
  const [stakeError, setStakeError] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAnchor, setWithdrawAnchor] = useState(KNOWN_ANCHORS[0].domain);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    if (!address) return;
    fetch(`/api/merchant/profile?address=${address}`)
      .then((r) => r.json())
      .then(({ merchant }) => { if (merchant) setVerified(!!merchant.verified); })
      .catch(() => {});
  }, [address]);

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const shortAddress = address
    ? `${address.slice(0, 8)}…${address.slice(-6)}`
    : "—";

  return (
    <MobileShell>
      <MobileHeader title="Settings" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <div className="glass-strong relative mb-5 flex items-center gap-4 overflow-hidden rounded-[24px] p-5">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-bold">Merchant</div>
            <div className="truncate font-mono text-[12px] text-muted">{shortAddress}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
          <div className="flex items-center justify-between px-5 py-[15px]">
            <span className="text-sm text-muted">Nama toko</span>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-[8px] border border-ink/[.12] bg-white px-2 py-1 text-[13px] text-ink outline-none"
                  maxLength={40}
                  autoFocus
                />
                <button
                  disabled={saving}
                  onClick={async () => {
                    if (!address || !nameInput.trim()) return;
                    setSaving(true);
                    await fetch("/api/merchant/profile", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ address, storeName: nameInput.trim() }),
                    });
                    setStoreName(nameInput.trim());
                    setEditing(false);
                    setSaving(false);
                  }}
                  className="text-[13px] font-semibold text-primary"
                >
                  {saving ? "…" : "Simpan"}
                </button>
              </div>
            ) : (
              <button onClick={() => { setNameInput(storeName ?? ""); setEditing(true); }}
                className="text-sm font-semibold text-ink underline-offset-2 hover:underline">
                {storeName || "—"}
              </button>
            )}
          </div>
          <Row label="Wallet" value={shortAddress} mono top />
          <Row label="Member since" value={joined} top />
          <Row label="Payout balance" value={`$${balanceUsdc.toFixed(2)}`} top display />
          <Row label="Receives" value="USDC (Stellar)" top />
          <Row label="Network" value="Testnet" top />

          {/* Merchant verification section */}
          <div className="border-t border-ink/[.06] px-5 py-[15px]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status toko</span>
              {verified ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span>
                  Terverifikasi
                </span>
              ) : (
                <button
                  onClick={() => setShowStakeForm((v) => !v)}
                  className="text-sm font-semibold text-primary"
                >
                  {showStakeForm ? "Tutup" : "Verifikasi toko"}
                </button>
              )}
            </div>

            {!verified && showStakeForm && (
              <div className="mt-3 space-y-3">
                <p className="text-[12px] text-muted leading-relaxed">
                  Kirim tepat <span className="font-semibold text-ink">10 USDC</span> ke alamat berikut, lalu masukkan TX Hash di bawah.
                </p>
                <div className="rounded-[10px] bg-ink/[.04] px-3 py-2">
                  <p className="break-all font-mono text-[11px] text-ink select-all">
                    {ADMIN_ADDRESS || "—"}
                  </p>
                </div>
                <input
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="TX Hash Stellar..."
                  className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 font-mono text-[12px] text-ink outline-none placeholder:text-faint"
                />
                {stakeError && (
                  <p className="text-[12px] text-red-500">{stakeError}</p>
                )}
                <button
                  disabled={staking || !txHashInput.trim()}
                  onClick={async () => {
                    if (!address || !txHashInput.trim()) return;
                    setStaking(true);
                    setStakeError("");
                    try {
                      const res = await fetch("/api/merchant/stake", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ address, txHash: txHashInput.trim() }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setStakeError(data.error ?? "Verifikasi gagal.");
                      } else {
                        setVerified(true);
                        setShowStakeForm(false);
                        setTxHashInput("");
                      }
                    } catch {
                      setStakeError("Terjadi kesalahan. Coba lagi.");
                    } finally {
                      setStaking(false);
                    }
                  }}
                  className="w-full rounded-[12px] bg-primary py-2.5 font-display text-sm font-semibold text-white disabled:opacity-50"
                >
                  {staking ? "Memverifikasi…" : "Kirim & Verifikasi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEP-24 Withdrawal section */}
      <div className="flex-none px-[22px] pt-4">
        <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
          <div className="flex items-center justify-between px-5 py-[15px]">
            <span className="text-sm font-semibold text-ink">Tarik USDC ke Exchange</span>
            <button
              onClick={() => setShowWithdraw((v) => !v)}
              className="text-sm font-semibold text-primary"
            >
              {showWithdraw ? "Tutup" : "Tarik"}
            </button>
          </div>

          {showWithdraw && (
            <div className="border-t border-ink/[.06] px-5 pb-5 pt-4 space-y-3">
              {walletType === "passkey" ? (
                <p className="text-[12px] text-amber-600 leading-relaxed">
                  Penarikan SEP-24 memerlukan wallet Albedo atau Freighter. Connect ulang menggunakan wallet klasik.
                </p>
              ) : (
                <>
                  <div>
                    <p className="mb-1.5 text-[12px] text-muted">Pilih anchor/exchange</p>
                    <select
                      value={withdrawAnchor}
                      onChange={(e) => setWithdrawAnchor(e.target.value)}
                      className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 text-[13px] text-ink outline-none"
                    >
                      {KNOWN_ANCHORS.map((a) => (
                        <option key={a.domain} value={a.domain}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[12px] text-muted">Jumlah USDC (opsional)</p>
                    <input
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      inputMode="decimal"
                      placeholder="Contoh: 50"
                      className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint"
                    />
                  </div>
                  {withdrawError && (
                    <p className="text-[12px] text-red-500">{withdrawError}</p>
                  )}
                  <button
                    disabled={withdrawing}
                    onClick={async () => {
                      if (!address) return;
                      setWithdrawing(true);
                      setWithdrawError("");
                      try {
                        const url = await startSep24Withdrawal(
                          withdrawAnchor,
                          address,
                          signXdr,
                          withdrawAmount.trim() || undefined
                        );
                        window.open(url, "_blank");
                      } catch (e: any) {
                        setWithdrawError(e.message ?? "Gagal memulai penarikan.");
                      } finally {
                        setWithdrawing(false);
                      }
                    }}
                    className="w-full rounded-[12px] bg-primary py-2.5 font-display text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {withdrawing ? "Menghubungkan anchor…" : "Mulai Penarikan"}
                  </button>
                  <p className="text-[11px] text-faint leading-relaxed">
                    Kamu akan diarahkan ke halaman anchor untuk melengkapi detail penarikan.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-none px-[22px] pb-[96px] pt-3.5">
        <Button variant="glass" onClick={disconnect}>
          Sign out
        </Button>
      </div>
      <TabBar />
    </MobileShell>
  );
}

function Row({
  label,
  value,
  top,
  display,
  mono,
}: {
  label: string;
  value: string;
  top?: boolean;
  display?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-[15px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span
        className={
          display
            ? "tnum font-display text-sm font-bold text-ink"
            : mono
            ? "truncate font-mono text-[12px] text-ink"
            : "text-sm text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
