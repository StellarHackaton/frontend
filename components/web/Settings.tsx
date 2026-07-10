"use client";

import { useState, useEffect } from "react";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { WebShell } from "./WebShell";
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

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const shortAddress = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—";

  useEffect(() => {
    if (!address) return;
    fetch(`/api/merchant/profile?address=${address}`)
      .then((r) => r.json())
      .then(({ merchant }) => { if (merchant) setVerified(!!merchant.verified); })
      .catch(() => {});
  }, [address]);

  async function handleSignOut() {
    await disconnect();
  }

  async function saveName() {
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
  }

  async function submitStake() {
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
  }

  return (
    <WebShell title="Settings">
      <div className="max-w-[640px]">
        {/* profile */}
        <div className="liquid-glass mb-6 flex items-center gap-4 rounded-[24px] p-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl font-bold text-primary">
            {userInitial}
          </div>
          <div>
            <div className="font-display text-xl font-bold">Merchant</div>
            <div className="font-mono text-[13px] text-muted">{shortAddress}</div>
          </div>
        </div>

        {/* detail rows */}
        <div className="liquid-glass overflow-hidden rounded-[24px]">
          {/* store name editable row */}
          <div className="flex items-center justify-between px-7 py-[18px]">
            <span className="text-[15px] text-muted">Nama toko</span>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-[8px] border border-ink/[.12] bg-white px-2.5 py-1.5 text-[14px] text-ink outline-none"
                  maxLength={40}
                  autoFocus
                />
                <button
                  disabled={saving}
                  onClick={saveName}
                  className="text-[14px] font-semibold text-primary"
                >
                  {saving ? "…" : "Simpan"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-[14px] text-muted"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(storeName ?? ""); setEditing(true); }}
                className="text-[15px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                {storeName || "—"}
              </button>
            )}
          </div>

          <Row label="Wallet address" value={shortAddress} mono top />
          <Row label="Member since" value={joined} top />
          <Row label="Payout balance" value={`$${balanceUsdc.toFixed(2)}`} top display />
          <Row label="Receives" value="USDC (Stellar)" top />
          <Row label="Network" value="Testnet" top />

          {/* verification section */}
          <div className="border-t border-ink/[.06] px-7 py-[18px]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted">Status toko</span>
              {verified ? (
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-emerald-600">
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                  Terverifikasi
                </span>
              ) : (
                <button
                  onClick={() => setShowStakeForm((v) => !v)}
                  className="text-[15px] font-semibold text-primary"
                >
                  {showStakeForm ? "Tutup" : "Verifikasi toko"}
                </button>
              )}
            </div>

            {!verified && showStakeForm && (
              <div className="mt-4 space-y-3">
                <p className="text-[13px] text-muted leading-relaxed">
                  Kirim tepat <span className="font-semibold text-ink">10 USDC</span> ke alamat berikut, lalu masukkan TX Hash di bawah.
                </p>
                <div className="rounded-[12px] bg-ink/[.04] px-4 py-3">
                  <p className="break-all font-mono text-[12px] text-ink select-all">
                    {ADMIN_ADDRESS || "—"}
                  </p>
                </div>
                <input
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(e.target.value)}
                  placeholder="TX Hash Stellar..."
                  className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[13px] text-ink outline-none placeholder:text-faint"
                />
                {stakeError && (
                  <p className="text-[13px] text-red-500">{stakeError}</p>
                )}
                <button
                  disabled={staking || !txHashInput.trim()}
                  onClick={submitStake}
                  className="w-full rounded-[14px] bg-primary py-3 font-display text-[15px] font-semibold text-white disabled:opacity-50"
                >
                  {staking ? "Memverifikasi…" : "Kirim & Verifikasi"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEP-24 withdrawal */}
        <div className="liquid-glass mt-6 overflow-hidden rounded-[24px]">
          <div className="flex items-center justify-between px-7 py-[18px]">
            <span className="font-display text-[15px] font-semibold text-ink">Tarik USDC ke Exchange</span>
            <button
              onClick={() => setShowWithdraw((v) => !v)}
              className="text-[15px] font-semibold text-primary"
            >
              {showWithdraw ? "Tutup" : "Tarik"}
            </button>
          </div>
          {showWithdraw && (
            <div className="border-t border-ink/[.06] px-7 pb-7 pt-5 space-y-4">
              {walletType === "passkey" ? (
                <p className="text-[13px] text-amber-600 leading-relaxed">
                  Penarikan SEP-24 memerlukan wallet Albedo atau Freighter. Connect ulang menggunakan wallet klasik.
                </p>
              ) : (
                <>
                  <div>
                    <p className="mb-1.5 text-[13px] text-muted">Pilih anchor/exchange</p>
                    <select
                      value={withdrawAnchor}
                      onChange={(e) => setWithdrawAnchor(e.target.value)}
                      className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[14px] text-ink outline-none"
                    >
                      {KNOWN_ANCHORS.map((a) => (
                        <option key={a.domain} value={a.domain}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[13px] text-muted">Jumlah USDC (opsional)</p>
                    <input
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      inputMode="decimal"
                      placeholder="Contoh: 50"
                      className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[14px] text-ink outline-none placeholder:text-faint"
                    />
                  </div>
                  {withdrawError && (
                    <p className="text-[13px] text-red-500">{withdrawError}</p>
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
                    className="w-full rounded-[14px] bg-primary py-3 font-display text-[15px] font-semibold text-white disabled:opacity-50"
                  >
                    {withdrawing ? "Menghubungkan anchor…" : "Mulai Penarikan"}
                  </button>
                  <p className="text-[12px] text-faint leading-relaxed">
                    Kamu akan diarahkan ke halaman anchor untuk melengkapi detail penarikan dan rekening tujuan.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="liquid-glass !border-red-400/40 mt-6 w-full rounded-btn py-3.5 font-display text-[15px] font-semibold text-red-500"
        >
          Sign out
        </button>
      </div>
    </WebShell>
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
      className={`flex items-center justify-between px-7 py-[18px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-[15px] text-muted">{label}</span>
      <span
        className={
          display
            ? "tnum font-display text-[15px] font-bold text-ink"
            : mono
            ? "font-mono text-[13px] text-ink"
            : "text-[15px] text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
