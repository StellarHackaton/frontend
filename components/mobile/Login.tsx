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
  const { connect, connectPasskey, connectPrivy, isConnected, authStatus } = useWalletContext();
  const { t } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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

  const handlePasskey = async (mode: "register" | "login") => {
    setError(null);
    setPasskeyLoading(true);
    try {
      await connectPasskey(mode);
    } catch (e: any) {
      setError(e?.message ?? t("login.errPasskey"));
    } finally {
      setPasskeyLoading(false);
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
      <div className="flex flex-none flex-col gap-3 px-[22px] pb-9 pt-3.5">
        {error && (
          <p className="text-center text-[13px] text-red-500">{error}</p>
        )}

        {/* ── Privy: email / Google — the recommended, easiest path ── */}
        <Button
          onClick={handlePrivy}
          disabled={busy || privyLoading}
          className="flex items-center justify-center gap-2.5"
        >
          {privyLoading ? <Spinner /> : <MailIcon />}
          {privyLoading ? t("login.opening") : t("login.emailCta")}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted">
          {t("login.emailHelper")}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-ink/[.08]" />
          <span className="text-[11px] text-muted">{t("login.or")}</span>
          <div className="h-px flex-1 bg-ink/[.08]" />
        </div>

        {/* Passkey / biometrik — secondary paths */}
        <Button
          variant="glass"
          onClick={() => handlePasskey("register")}
          disabled={busy || passkeyLoading}
          className="flex items-center justify-center gap-2"
        >
          {passkeyLoading ? <Spinner dark /> : <FingerprintIcon dark />}
          {passkeyLoading ? t("login.preparing") : t("login.registerPasskey")}
        </Button>

        <Button
          variant="glass"
          onClick={() => handlePasskey("login")}
          disabled={busy || passkeyLoading}
          className="flex items-center justify-center gap-2"
        >
          {passkeyLoading ? <Spinner dark /> : <FingerprintIcon dark />}
          {passkeyLoading ? t("login.verifying") : t("login.loginPasskey")}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          {t("login.passkeyHelper")}
        </p>

        {/* Classic wallet */}
        <Button
          onClick={handleConnect}
          disabled={busy}
          variant="glass"
          className="flex items-center justify-center gap-2 h-[52px] rounded-[20px]"
        >
          {busy ? <Spinner dark /> : <WalletIcon />}
          {busy ? t("login.connecting") : t("login.connectWalletFull")}
        </Button>
      </div>
    </MobileShell>
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

function FingerprintIcon({ dark }: { dark?: boolean }) {
  const color = dark ? "#15161B" : "white";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} aria-hidden>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.5-.5 3-1.5 4" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 6a6 6 0 0 1 6 6c0 2.5-.8 4.8-2 6.5" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 2a10 10 0 0 1 10 10c0 4-1.5 7.5-4 10" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 19.5A14 14 0 0 1 2 12a10 10 0 0 1 5-8.7" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 21.5A9.9 9.9 0 0 1 6 16c0-1.5.4-3 1-4.2" strokeWidth="1.7" strokeLinecap="round" />
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
