"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { useWalletContext } from "@/lib/wallet-context";
import { LogoMark, Wordmark } from "@/components/ui/Wordmark";

export function Login() {
  const router = useRouter();
  const { connect, connectPasskey, connectPrivy, isConnected, authStatus } = useWalletContext();
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
      setError("Koneksi wallet gagal. Coba lagi.");
    }
  };

  const handlePasskey = async (mode: "register" | "login") => {
    setError(null);
    setPasskeyLoading(true);
    try {
      await connectPasskey(mode);
    } catch (e: any) {
      setError(e?.message ?? "Passkey gagal. Coba lagi.");
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
      setError(e?.message ?? "Login email gagal. Coba lagi.");
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
          Terima bayaran dalam bentuk apapun. Dapat dolar pas.
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-none flex-col gap-3 px-[22px] pb-9 pt-3.5">
        {error && (
          <p className="text-center text-[13px] text-red-500">{error}</p>
        )}

        {/* ── Privy: email / Google ── */}
        <button
          onClick={handlePrivy}
          disabled={busy || privyLoading}
          className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[20px] bg-[#2F2A6B] font-display text-[16px] font-semibold text-white disabled:opacity-60 active:scale-[.97]"
        >
          {privyLoading ? <Spinner /> : <MailIcon />}
          {privyLoading ? "Membuka…" : "Masuk dengan Email"}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-muted">
          Email atau Google. Wallet dibuat otomatis.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-ink/[.08]" />
          <span className="text-[11px] text-muted">atau pakai biometrik / wallet</span>
          <div className="h-px flex-1 bg-ink/[.08]" />
        </div>

        {/* Passkey / biometrik */}
        <Button
          onClick={() => handlePasskey("register")}
          disabled={busy || passkeyLoading}
          className="flex items-center justify-center gap-2"
        >
          {passkeyLoading ? <Spinner /> : <FingerprintIcon />}
          {passkeyLoading ? "Menyiapkan…" : "Daftar dengan Sidik Jari"}
        </Button>

        <button
          onClick={() => handlePasskey("login")}
          disabled={busy || passkeyLoading}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[20px] border border-ink/15 bg-white font-display text-[16px] font-semibold text-ink disabled:opacity-60 active:scale-[.97]"
        >
          {passkeyLoading ? <Spinner dark /> : <FingerprintIcon dark />}
          {passkeyLoading ? "Memverifikasi…" : "Masuk dengan Sidik Jari"}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          Tidak perlu tahu crypto. Cukup sentuh sidik jari.
        </p>

        {/* Classic wallet */}
        <Button
          onClick={handleConnect}
          disabled={busy}
          variant="glass"
          className="flex items-center justify-center gap-2 h-[52px] rounded-[20px]"
        >
          {busy ? <Spinner dark /> : <WalletIcon />}
          {busy ? "Menghubungkan…" : "Hubungkan Wallet (Albedo / Freighter)"}
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
