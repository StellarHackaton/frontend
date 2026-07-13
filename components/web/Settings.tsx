"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { WebShell } from "./WebShell";
import { buildUsdcPaymentXdr, submitToHorizon, SEND_DESTINATIONS } from "@/lib/stellar-payment";
import { ExchangeIcon } from "@/components/ui/ExchangeIcon";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";


export function Settings() {
  const { address, userInitial, disconnect, storeName, setStoreName, walletType, signXdr } = useWalletContext();
  const { user: privyUser } = usePrivy();
  const { balanceUsdc } = useDashboard(address);
  const { t, lang } = useLang();

  const privyEmail = privyUser?.email?.address
    ?? (privyUser as any)?.google?.email
    ?? ((privyUser?.linkedAccounts ?? []).find((a: any) => a.type === "email") as any)?.address
    ?? ((privyUser?.linkedAccounts ?? []).find((a: any) => a.type === "google_oauth") as any)?.email
    ?? null;
  const displaySub = walletType === "privy" && privyEmail ? privyEmail : (address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—");

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(storeName ?? "");
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [txHashInput, setTxHashInput] = useState("");
  const [staking, setStaking] = useState(false);
  const [stakeError, setStakeError] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [sendDest, setSendDest] = useState("");
  const [sendMemo, setSendMemo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendTxHash, setSendTxHash] = useState("");

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const shortAddress = address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—";

  useEffect(() => {
    if (!address) return;
    fetch(`/api/merchant/profile?address=${address}`)
      .then((r) => r.json())
      .then(({ merchant }) => { if (merchant) setVerified(!!merchant.verified); })
      .catch(() => {});
  }, [address]);

  // Sync nameInput when storeName loads from wallet context (it starts as undefined)
  useEffect(() => {
    if (storeName && !editing) setNameInput(storeName);
  }, [storeName]);

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
        setStakeError(data.error ?? t("settings.errVerify"));
      } else {
        setVerified(true);
        setShowStakeForm(false);
        setTxHashInput("");
      }
    } catch {
      setStakeError(t("settings.errGeneric"));
    } finally {
      setStaking(false);
    }
  }


  async function sendUsdc() {
    if (!address || !sendDest.trim() || !sendAmount.trim()) return;
    setSending(true);
    setSendError("");
    setSendTxHash("");
    try {
      const xdr = await buildUsdcPaymentXdr(address, sendDest.trim(), sendAmount.trim(), sendMemo.trim() || undefined);
      const signedXdr = await signXdr(xdr);
      const hash = walletType === "passkey" ? signedXdr : await submitToHorizon(signedXdr);
      setSendTxHash(hash);
      setSendDest("");
      setSendMemo("");
      setSendAmount("");
    } catch (e: any) {
      setSendError(e.message ?? t("settings.errSend"));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <WebShell title="Settings">
        <div className="max-w-[640px]">
          {/* profile */}
          <div className="liquid-glass mb-6 flex items-center gap-4 rounded-[24px] p-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl font-bold text-primary">
              {userInitial}
            </div>
            <div>
              <div className="font-display text-xl font-bold">{storeName || "Merchant"}</div>
              <div className="text-[13px] text-muted">{displaySub}</div>
            </div>
          </div>

          {/* detail rows */}
          <div className="liquid-glass overflow-hidden rounded-[24px]">
            <div className="flex items-center justify-between px-7 py-[18px]">
              <span className="text-[15px] text-muted">{t("settings.storeName")}</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="rounded-[8px] border border-ink/[.12] bg-white px-2.5 py-1.5 text-[14px] text-ink outline-none"
                    maxLength={40}
                    autoFocus
                  />
                  <button disabled={saving} onClick={saveName} className="text-[14px] font-semibold text-primary">
                    {saving ? "…" : t("settings.save")}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-[14px] text-muted">
                    {t("settings.cancel")}
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

            <Row label={t("settings.walletAddress")} value={shortAddress} mono top />
            <Row label={t("settings.memberSince")} value={joined} top />
            <Row label={t("settings.payoutBalance")} value={`$${balanceUsdc.toFixed(2)}`} top display />
            <Row label={t("settings.receives")} value="USDC (Stellar)" top />
            <Row label={t("settings.network")} value="Testnet" top />

            {/* language */}
            <div className="flex items-center justify-between border-t border-ink/[.06] px-7 py-[18px]">
              <span className="text-[15px] text-muted">{t("settings.language")}</span>
              <LanguageToggle />
            </div>

            {/* verification */}
            <div className="border-t border-ink/[.06] px-7 py-[18px]">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-muted">{t("settings.storeStatus")}</span>
                {verified ? (
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold text-emerald-600">
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                    {t("settings.verified")}
                  </span>
                ) : (
                  <button onClick={() => setShowStakeForm((v) => !v)} className="text-[15px] font-semibold text-primary">
                    {showStakeForm ? t("settings.close") : t("settings.verifyStore")}
                  </button>
                )}
              </div>
              {!verified && showStakeForm && (
                <div className="mt-4 space-y-3">
                  <p className="text-[13px] text-muted leading-relaxed">
                    {t("settings.stakeInstructions")}
                  </p>
                  <div className="rounded-[12px] bg-ink/[.04] px-4 py-3">
                    <p className="break-all font-mono text-[12px] text-ink select-all">{ADMIN_ADDRESS || "—"}</p>
                  </div>
                  <input
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder={t("settings.txHashPlaceholder")}
                    className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[13px] text-ink outline-none placeholder:text-faint"
                  />
                  {stakeError && <p className="text-[13px] text-red-500">{stakeError}</p>}
                  <button
                    disabled={staking || !txHashInput.trim()}
                    onClick={submitStake}
                    className="w-full rounded-[14px] bg-primary py-3 font-display text-[15px] font-semibold text-white disabled:opacity-50"
                  >
                    {staking ? t("login.verifying") : t("settings.sendAndVerify")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Direct USDC transfer */}
          <div className="liquid-glass mt-6 overflow-hidden rounded-[24px]">
            <div className="flex items-center justify-between px-7 py-[18px]">
              <div>
                <span className="font-display text-[15px] font-semibold text-ink">{t("settings.sendUsdcTitle")}</span>
                <p className="mt-0.5 text-[12px] text-muted">{t("settings.sendUsdcSub")}</p>
              </div>
              <button
                onClick={() => { setShowSend((v) => !v); setSelectedExchange(null); setSendTxHash(""); setSendError(""); setSendDest(""); setSendMemo(""); setSendAmount(""); }}
                className="text-[15px] font-semibold text-primary"
              >
                {showSend ? t("settings.close") : t("settings.send")}
              </button>
            </div>

            {showSend && (
              <div className="border-t border-ink/[.06] px-7 pb-8 pt-6">

                {/* Step 1 — pilih exchange */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">1</span>
                    <span className="text-[13px] font-semibold text-ink">{t("settings.step1")}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {SEND_DESTINATIONS.map((ex) => {
                      const active = selectedExchange === ex.id;
                      return (
                        <button
                          key={ex.id}
                          onClick={() => { setSelectedExchange(ex.id); setSendDest(""); setSendMemo(""); setSendError(""); setSendTxHash(""); }}
                          className="relative flex flex-col items-center overflow-hidden rounded-[16px] transition-all duration-150"
                          style={{
                            boxShadow: active ? `0 0 0 2.5px ${ex.iconBg}` : "0 0 0 1.5px rgba(21,22,27,.09)",
                            transform: active ? "scale(1.04)" : "scale(1)",
                          }}
                        >
                          {active && (
                            <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white" style={{ background: ex.iconBg }}>✓</span>
                          )}
                          <div className="aspect-square w-full">
                            <ExchangeIcon id={ex.id} fill />
                          </div>
                          <span className="w-full bg-white py-1.5 text-center text-[11px] font-semibold text-ink">{ex.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedExchange && (() => {
                  const ex = SEND_DESTINATIONS.find((e) => e.id === selectedExchange)!;
                  return (
                    <>
                      {/* Step 2 — instruksi */}
                      <div className="mb-6">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">2</span>
                          <span className="text-[13px] font-semibold text-ink">{t("settings.step2GetAddressFrom")} {ex.name}</span>
                        </div>
                        <div className="overflow-hidden rounded-[16px] border border-ink/[.06] bg-ink/[.02]">
                          {ex.steps[lang].map((step, i) => (
                            <div key={i} className="flex items-start gap-3 border-b border-ink/[.05] px-4 py-3 last:border-b-0">
                              <span
                                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ background: ex.iconBg }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-[13px] text-muted leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step 3 — isi form */}
                      <div className="mb-6">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">3</span>
                          <span className="text-[13px] font-semibold text-ink">{t("settings.step3")}</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[13px]">
                              <span className="font-medium text-ink">
                                {ex.id === "freighter" ? t("settings.freighterAddress") : `${t("settings.depositAddress")} ${ex.name}`}
                              </span>
                              <span className="text-faint">Stellar (G...)</span>
                            </label>
                            <input
                              value={sendDest}
                              onChange={(e) => setSendDest(e.target.value)}
                              placeholder="GBXXXXXX..."
                              className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 font-mono text-[13px] text-ink outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                          </div>

                          {ex.needsMemo && (
                            <div>
                              <label className="mb-1.5 flex items-center justify-between text-[13px]">
                                <span className="font-medium text-ink">{t("settings.memo")}</span>
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">{t("settings.required")}</span>
                              </label>
                              <input
                                value={sendMemo}
                                onChange={(e) => setSendMemo(e.target.value)}
                                placeholder={t("settings.memoPlaceholder")}
                                className="w-full rounded-[12px] border border-ink/[.12] bg-white px-4 py-3 text-[14px] text-ink outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
                              />
                              <p className="mt-1.5 text-[11px] text-faint">
                                {t("settings.memoHelper")}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[13px]">
                              <span className="font-medium text-ink">{t("settings.usdcAmount")}</span>
                              <span className="text-faint">{t("settings.balance")}: ${balanceUsdc.toFixed(2)}</span>
                            </label>
                            <div className="relative">
                              <input
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                inputMode="decimal"
                                placeholder="0.00"
                                className="w-full rounded-[12px] border border-ink/[.12] bg-white py-3 pl-4 pr-20 text-[14px] text-ink outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/10"
                              />
                              <button
                                type="button"
                                onClick={() => setSendAmount(balanceUsdc.toFixed(2))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[8px] bg-ink/[.06] px-2 py-1 text-[11px] font-semibold text-muted hover:bg-ink/10"
                              >
                                {t("settings.max")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {sendError && (
                        <div className="mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-[13px] text-red-600">
                          {sendError}
                        </div>
                      )}

                      {sendTxHash ? (
                        <div className="rounded-[16px] bg-emerald-50 p-5 text-center">
                          <div className="mb-1.5 text-[28px]">✅</div>
                          <p className="font-display text-[15px] font-bold text-emerald-700">{t("settings.sentSuccess")}</p>
                          <p className="mt-1 text-[12px] text-emerald-600">{t("settings.onWayTo")} {ex.name}</p>
                          <p className="mt-3 break-all rounded-[10px] bg-emerald-100 px-3 py-2 font-mono text-[10px] text-emerald-700">
                            TX: {sendTxHash}
                          </p>
                          <button onClick={() => { setSendTxHash(""); setSendDest(""); setSendMemo(""); setSendAmount(""); }} className="mt-3 text-[12px] text-emerald-600 underline">
                            {t("settings.sendAgain")}
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={sending || !sendDest.trim() || !sendAmount.trim() || (ex.needsMemo && !sendMemo.trim())}
                          onClick={sendUsdc}
                          className="w-full rounded-[14px] py-3.5 font-display text-[15px] font-semibold text-white shadow-md transition-opacity disabled:opacity-40"
                          style={{ background: `linear-gradient(135deg, ${ex.iconBg}, ${ex.iconBg}cc)` }}
                        >
                          {sending ? t("settings.sending") : `${t("settings.sendUsdcTo")} ${ex.name} →`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <button
            onClick={disconnect}
            className="liquid-glass !border-red-400/40 mt-6 w-full rounded-btn py-3.5 font-display text-[15px] font-semibold text-red-500"
          >
            {t("settings.signOut")}
          </button>
        </div>
      </WebShell>

    </>
  );
}

function Row({
  label, value, top, display, mono,
}: {
  label: string; value: string; top?: boolean; display?: boolean; mono?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-7 py-[18px] ${top ? "border-t border-ink/[.06]" : ""}`}>
      <span className="text-[15px] text-muted">{label}</span>
      <span className={display ? "tnum font-display text-[15px] font-bold text-ink" : mono ? "font-mono text-[13px] text-ink" : "text-[15px] text-ink"}>
        {value}
      </span>
    </div>
  );
}
