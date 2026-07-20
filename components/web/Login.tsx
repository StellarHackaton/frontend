"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetalCta } from "@/components/ui/MetalCta";
import { useWalletContext } from "@/lib/wallet-context";
import { LogoMark, Wordmark } from "@/components/ui/Wordmark";
import { useLang } from "@/lib/i18n";

export function Login() {
  const router = useRouter();
  const { connect, connectPrivy, isConnected, authStatus } = useWalletContext();
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [privyLoading, setPrivyLoading] = useState(false);

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch {
      setError(t("login.errWallet"));
    }
  };

  const handlePrivy = async () => {
    setError(null);
    setPrivyLoading(true);
    try {
      await connectPrivy();
    } catch (e: any) {
      setError(e?.message ?? t("login.errEmail"));
    } finally {
      setPrivyLoading(false);
    }
  };

  const busy = authStatus === "connecting";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="liquid-glass w-full max-w-[440px] rounded-[28px] p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={56} />
          <Wordmark size={34} />
        </div>
        <div className="mx-auto mt-4 max-w-[300px] font-display text-[19px] font-medium leading-[1.4]">
          {t("login.tagline")}
        </div>

        {error && (
          <p className="mt-4 text-[13px] text-danger">{error}</p>
        )}

        {/* ── Privy: email / Google (recommended for merchants) ── */}
        <div className="mt-8 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
            {t("login.easiest")}
          </p>
          <MetalCta className="block w-full">
            <button
              onClick={handlePrivy}
              disabled={busy || privyLoading}
              className="liquid-surface flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-btn py-4 font-display text-[16px] font-semibold text-white transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.98] disabled:opacity-50"
            >
              {privyLoading ? <Spinner /> : <MailIcon />}
              {privyLoading ? t("login.opening") : t("login.emailCta")}
            </button>
          </MetalCta>
          <p className="text-[12px] leading-relaxed text-muted">
            {t("login.emailHelper")}
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/[.08]" />
          <span className="text-[12px] text-muted">{t("login.or")}</span>
          <div className="h-px flex-1 bg-ink/[.08]" />
        </div>

        {/* ── Classic wallet (Albedo / Freighter) ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
            {t("login.haveWallet")}
          </p>
          <button
            onClick={handleConnect}
            disabled={busy}
            className="liquid-glass !border-primary/40 flex w-full items-center justify-center gap-2.5 rounded-btn py-4 font-display text-[16px] font-semibold text-primary transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.98] disabled:opacity-50"
          >
            {busy ? <Spinner dark /> : <WalletIcon />}
            {busy ? t("login.connecting") : t("login.connectWallet")}
          </button>
          <p className="text-[12px] leading-relaxed text-muted">
            <strong className="text-ink">Albedo</strong> — {t("login.albedoHelper")}{" "}
            <strong className="text-ink">Freighter</strong> — {t("login.freighterHelper")}
          </p>
        </div>

        <p className="mt-6 text-[12px] text-muted">
          {t("login.terms")}
        </p>
      </div>
    </main>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="1.8" />
      <path d="M16 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor" stroke="none" />
      <path d="M22 11V7a2 2 0 0 0-2-2H4L2 7" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke={dark ? "#15161B" : "white"}
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path
        className="opacity-75"
        fill={dark ? "#15161B" : "white"}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
