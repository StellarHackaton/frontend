"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { useWalletContext } from "@/lib/wallet-context";
import { LogoMark, Wordmark } from "@/components/ui/Wordmark";
import { useLang } from "@/lib/i18n";

export function Login() {
  const router = useRouter();
  const { connect, connectPrivy, isConnected } = useWalletContext();
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [privyLoading, setPrivyLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

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

  const handleConnect = async () => {
    setError(null);
    setWalletLoading(true);
    try {
      await connect();
    } catch {
      setError(t("login.errWallet"));
    } finally {
      setWalletLoading(false);
    }
  };

  const busy = privyLoading || walletLoading;

  return (
    <MobileShell>
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={60} />
          <Wordmark size={36} />
        </div>
        <div className="mt-[18px] max-w-[260px] font-display text-[19px] font-medium leading-[1.4]">
          {t("login.tagline")}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-none flex-col gap-3 px-[22px] pb-10 pt-3">
        {error && (
          <p className="mb-1 text-center text-[13px] text-danger">{error}</p>
        )}

        {/* Email / Google via Privy */}
        <SectionLabel text="EASIEST — NO WALLET NEEDED" />

        <Button onClick={handlePrivy} disabled={busy}>
          <span className="flex items-center justify-center gap-2.5">
            {privyLoading ? <Spinner /> : <MailIcon />}
            {privyLoading ? t("login.opening") : t("login.emailCta")}
          </span>
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          {t("login.emailHelper")}
        </p>

        {/* Freighter / classic wallet */}
        <SectionLabel text="ALREADY HAVE A STELLAR WALLET" />

        <Button variant="glass" onClick={handleConnect} disabled={busy}>
          <span className="flex items-center justify-center gap-2.5">
            {walletLoading ? <Spinner dark /> : <WalletIcon />}
            {walletLoading ? t("login.connecting") : t("login.connectWallet")}
          </span>
        </Button>
      </div>
    </MobileShell>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="mt-1 text-center text-[10px] font-bold tracking-[.08em] text-faint uppercase">
      {text}
    </p>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}


function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="1.8" />
      <path d="M16 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor" stroke="none" />
      <path d="M22 11V7a2 2 0 0 0-2-2H4L2 7" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke={dark ? "#15161B" : "white"} aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path className="opacity-75" fill={dark ? "#15161B" : "white"} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
