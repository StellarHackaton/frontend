"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Button } from "@/components/ui/Button";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { buildUsdcPaymentXdr, submitToHorizon, SEND_DESTINATIONS } from "@/lib/stellar-payment";
import { ExchangeIcon } from "@/components/ui/ExchangeIcon";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "";

export function Settings() {
  const { address, userInitial, disconnect, storeName, setStoreName, walletType, signXdr } = useWalletContext();
  const { balanceUsdc } = useDashboard(address);
  const { t, lang } = useLang();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

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

  const { user: privyUser } = usePrivy();
  const privyEmail = privyUser?.email?.address
    ?? (privyUser as any)?.google?.email
    ?? ((privyUser?.linkedAccounts ?? []).find((a: any) => a.type === "email") as any)?.address
    ?? ((privyUser?.linkedAccounts ?? []).find((a: any) => a.type === "google_oauth") as any)?.email
    ?? null;
  const displaySub = walletType === "privy" && privyEmail
    ? privyEmail
    : (address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—");

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
      <MobileShell>
        <MobileHeader title="Settings" />

        <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
          <div className="glass-strong relative mb-5 flex items-center gap-4 overflow-hidden rounded-[24px] p-5">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold">{storeName || "Merchant"}</div>
              <div className="text-[13px] text-muted truncate">{displaySub}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
            {/* store name */}
            <div className="flex items-center justify-between px-5 py-[15px]">
              <span className="text-sm text-muted">{t("settings.storeName")}</span>
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
                    {saving ? "…" : t("settings.save")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setNameInput(storeName ?? ""); setEditing(true); }}
                  className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {storeName || "—"}
                </button>
              )}
            </div>

            <Row label={t("settings.wallet")} value={address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—"} mono top />
            <Row label={t("settings.memberSince")} value={joined} top />
            <Row label={t("settings.payoutBalance")} value={`$${balanceUsdc.toFixed(2)}`} top display />
            <Row label={t("settings.receives")} value="USDC (Stellar)" top />
            <Row label={t("settings.network")} value="Testnet" top />

            {/* language */}
            <div className="flex items-center justify-between border-t border-ink/[.06] px-5 py-[15px]">
              <span className="text-sm text-muted">{t("settings.language")}</span>
              <LanguageToggle />
            </div>

            {/* verification */}
            <div className="border-t border-ink/[.06] px-5 py-[15px]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{t("settings.storeStatus")}</span>
                {verified ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span>
                    {t("settings.verified")}
                  </span>
                ) : (
                  <button onClick={() => setShowStakeForm((v) => !v)} className="text-sm font-semibold text-primary">
                    {showStakeForm ? t("settings.close") : t("settings.verifyStore")}
                  </button>
                )}
              </div>
              {!verified && showStakeForm && (
                <div className="mt-3 space-y-3">
                  <p className="text-[12px] text-muted leading-relaxed">
                    {t("settings.stakeInstructions")}
                  </p>
                  <div className="rounded-[10px] bg-ink/[.04] px-3 py-2">
                    <p className="break-all font-mono text-[11px] text-ink select-all">{ADMIN_ADDRESS || "—"}</p>
                  </div>
                  <input
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder={t("settings.txHashPlaceholder")}
                    className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 font-mono text-[12px] text-ink outline-none placeholder:text-faint"
                  />
                  {stakeError && <p className="text-[12px] text-red-500">{stakeError}</p>}
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
                        if (!res.ok) setStakeError(data.error ?? t("settings.errVerify"));
                        else { setVerified(true); setShowStakeForm(false); setTxHashInput(""); }
                      } catch {
                        setStakeError(t("settings.errGeneric"));
                      } finally {
                        setStaking(false);
                      }
                    }}
                    className="w-full rounded-[12px] bg-primary py-2.5 font-display text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {staking ? t("login.verifying") : t("settings.sendAndVerify")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Direct USDC transfer */}
        <div className="flex-none px-[22px] pt-3.5">
          <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
            <div className="flex items-center justify-between px-5 py-[15px]">
              <div>
                <span className="text-sm font-semibold text-ink">{t("settings.sendUsdcTitle")}</span>
                <p className="text-[11px] text-muted">{t("settings.sendUsdcSub")}</p>
              </div>
              <button
                onClick={() => { setShowSend((v) => !v); setSelectedExchange(null); setSendTxHash(""); setSendError(""); setSendDest(""); setSendMemo(""); setSendAmount(""); }}
                className="text-sm font-semibold text-primary"
              >
                {showSend ? t("settings.close") : t("settings.send")}
              </button>
            </div>

            {showSend && (
              <div className="border-t border-ink/[.06] px-5 pb-6 pt-5 space-y-5">

                {/* Step 1 */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">1</span>
                    <span className="text-[12px] font-semibold text-ink">{t("settings.step1")}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SEND_DESTINATIONS.map((ex) => {
                      const active = selectedExchange === ex.id;
                      return (
                        <button
                          key={ex.id}
                          onClick={() => { setSelectedExchange(ex.id); setSendDest(""); setSendMemo(""); setSendError(""); setSendTxHash(""); }}
                          className="relative flex flex-col items-center overflow-hidden rounded-[14px] transition-all duration-150"
                          style={{
                            boxShadow: active ? `0 0 0 2px ${ex.iconBg}` : "0 0 0 1.5px rgba(21,22,27,.09)",
                            transform: active ? "scale(1.05)" : "scale(1)",
                          }}
                        >
                          {active && (
                            <span className="absolute right-1 top-1 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] text-white" style={{ background: ex.iconBg }}>✓</span>
                          )}
                          <div className="aspect-square w-full">
                            <ExchangeIcon id={ex.id} fill />
                          </div>
                          <span className="w-full bg-white py-1 text-center text-[9px] font-semibold text-ink leading-tight">{ex.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedExchange && (() => {
                  const ex = SEND_DESTINATIONS.find((e) => e.id === selectedExchange)!;
                  return (
                    <>
                      {/* Step 2 — cara dapat address */}
                      <div>
                        <div className="mb-2.5 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">2</span>
                          <span className="text-[12px] font-semibold text-ink">{t("settings.step2GetAddress")}</span>
                        </div>
                        <div className="overflow-hidden rounded-[12px] bg-ink/[.03] border border-ink/[.05]">
                          {ex.steps[lang].map((step, i) => (
                            <div key={i} className="flex items-start gap-2.5 border-b border-ink/[.05] px-3 py-2.5 last:border-b-0">
                              <span
                                className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[9px] font-bold text-white"
                                style={{ background: ex.iconBg }}
                              >
                                {i + 1}
                              </span>
                              <span className="text-[12px] text-muted leading-snug">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step 3 — form */}
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-white">3</span>
                          <span className="text-[12px] font-semibold text-ink">{t("settings.step3")}</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[12px]">
                              <span className="font-medium text-ink">
                                {ex.id === "freighter" ? t("settings.freighterAddress") : t("settings.depositAddress")}
                              </span>
                              <span className="text-faint">Stellar (G...)</span>
                            </label>
                            <input
                              value={sendDest}
                              onChange={(e) => setSendDest(e.target.value)}
                              placeholder="GBXXXXXX..."
                              className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 font-mono text-[11px] text-ink outline-none placeholder:text-faint focus:border-primary"
                            />
                          </div>

                          {ex.needsMemo && (
                            <div>
                              <label className="mb-1.5 flex items-center justify-between text-[12px]">
                                <span className="font-medium text-ink">{t("settings.memo")}</span>
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">{t("settings.required")}</span>
                              </label>
                              <input
                                value={sendMemo}
                                onChange={(e) => setSendMemo(e.target.value)}
                                placeholder={t("settings.memoPlaceholder")}
                                className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-primary"
                              />
                              <p className="mt-1 text-[10px] text-faint">{t("settings.memoHelper")}</p>
                            </div>
                          )}

                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-[12px]">
                              <span className="font-medium text-ink">{t("settings.usdcAmount")}</span>
                              <button type="button" onClick={() => setSendAmount(balanceUsdc.toFixed(2))} className="text-primary text-[11px] font-semibold">
                                {t("settings.max")} ${balanceUsdc.toFixed(2)}
                              </button>
                            </label>
                            <input
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                              inputMode="decimal"
                              placeholder="0.00"
                              className="w-full rounded-[10px] border border-ink/[.12] bg-white px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {sendError && (
                        <div className="rounded-[10px] bg-red-50 px-3 py-2.5 text-[12px] text-red-600">{sendError}</div>
                      )}

                      {sendTxHash ? (
                        <div className="rounded-[14px] bg-emerald-50 p-4 text-center">
                          <div className="text-[24px]">✅</div>
                          <p className="mt-1 font-display text-[14px] font-bold text-emerald-700">{t("settings.sentSuccess")}</p>
                          <p className="mt-0.5 text-[11px] text-emerald-600">{t("settings.onWayTo")} {ex.name}</p>
                          <p className="mt-2.5 break-all rounded-[8px] bg-emerald-100 px-2.5 py-1.5 font-mono text-[9px] text-emerald-700">TX: {sendTxHash}</p>
                          <button onClick={() => { setSendTxHash(""); setSendDest(""); setSendMemo(""); setSendAmount(""); }} className="mt-2 text-[11px] text-emerald-600 underline">
                            {t("settings.sendAgain")}
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={sending || !sendDest.trim() || !sendAmount.trim() || (ex.needsMemo && !sendMemo.trim())}
                          onClick={sendUsdc}
                          className="w-full rounded-[12px] py-3 font-display text-sm font-semibold text-white shadow-sm disabled:opacity-40"
                          style={{ background: ex.iconBg }}
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
        </div>

        <div className="flex-none px-[22px] pb-[96px] pt-3.5">
          <Button variant="glass" onClick={() => setConfirmSignOut(true)}>{t("settings.signOut")}</Button>
        </div>
        <TabBar />
      </MobileShell>

      <ConfirmDialog
        open={confirmSignOut}
        title={t("settings.signOutConfirmTitle")}
        body={t("settings.signOutConfirmBody")}
        confirmLabel={t("settings.signOut")}
        danger
        onConfirm={disconnect}
        onClose={() => setConfirmSignOut(false)}
      />
    </>
  );
}

function Row({
  label, value, top, display, mono,
}: {
  label: string; value: string; top?: boolean; display?: boolean; mono?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-[15px] ${top ? "border-t border-ink/[.06]" : ""}`}>
      <span className="text-sm text-muted">{label}</span>
      <span className={display ? "tnum font-display text-sm font-bold text-ink" : mono ? "truncate font-mono text-[12px] text-ink" : "text-sm text-ink"}>
        {value}
      </span>
    </div>
  );
}
