"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/lib/wallet-context";
import { Wordmark } from "@/components/ui/Wordmark";
import { useLang } from "@/lib/i18n";

export function OnboardingFlow() {
  const router = useRouter();
  const { address, storeName, setStoreName } = useWalletContext();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError(t("onboarding.errEmpty")); return; }
    if (trimmed.length < 2) { setError(t("onboarding.errShort")); return; }
    if (!address) { setError(t("onboarding.errNoWallet")); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/merchant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, storeName: trimmed }),
      });
      if (!res.ok) throw new Error(t("common.errSave"));
      setStoreName(trimmed);
      router.replace("/dashboard");
    } catch {
      setError(t("common.errSave"));
    } finally {
      setLoading(false);
    }
  }

  // Still loading storeName — don't render yet
  if (storeName === undefined) return null;

  // Already has a store name — redirect to dashboard
  if (storeName) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f5f4f0] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark size={26} />
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow-[0_8px_40px_rgba(21,22,27,.10)]">
          <h1 className="mb-1 font-display text-[22px] font-bold">{t("onboarding.title")}</h1>
          <p className="mb-6 text-[14px] text-muted">
            {t("onboarding.subtitle")}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">
                {t("onboarding.label")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onboarding.placeholder")}
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
              {loading ? t("common.saving") : t("onboarding.continue")}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-faint">
          {t("onboarding.helper")}
        </p>
      </div>
    </div>
  );
}
