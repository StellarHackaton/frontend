"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetalCta } from "@/components/ui/MetalCta";
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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="liquid-glass w-full max-w-[440px] rounded-[28px] p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={56} />
          <Wordmark size={34} />
        </div>
        <div className="mx-auto mt-4 max-w-[300px] font-display text-[19px] font-medium leading-[1.4]">
          Terima bayaran dalam bentuk apapun. Dapat dolar pas.
        </div>

        {error && (
          <p className="mt-4 text-[13px] text-red-500">{error}</p>
        )}

        {/* ── Privy: email / Google (recommended for merchants) ── */}
        <div className="mt-8 flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
            Cara termudah — tanpa wallet
          </p>
          <button
            onClick={handlePrivy}
            disabled={busy || privyLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-btn bg-[#2F2A6B] py-4 font-display text-[16px] font-semibold text-white disabled:opacity-60"
          >
            {privyLoading ? <Spinner /> : <MailIcon />}
            {privyLoading ? "Membuka…" : "Masuk dengan Email"}
          </button>
          <p className="text-[12px] leading-relaxed text-muted">
            Masuk pakai email atau Google. Wallet Stellar dibuat otomatis.
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/[.08]" />
          <span className="text-[12px] text-muted">atau pakai biometrik / wallet</span>
          <div className="h-px flex-1 bg-ink/[.08]" />
        </div>

        {/* ── Passkey / biometric (awam) ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
            Untuk pengguna baru
          </p>
          <button
            onClick={() => handlePasskey("register")}
            disabled={busy || passkeyLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-btn bg-[#0c0d12] py-4 font-display text-[16px] font-semibold text-white disabled:opacity-60"
          >
            {passkeyLoading ? <Spinner /> : <FingerprintIcon />}
            {passkeyLoading ? "Menyiapkan…" : "Daftar dengan Sidik Jari"}
          </button>
          <button
            onClick={() => handlePasskey("login")}
            disabled={busy || passkeyLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-btn border border-ink/15 bg-paper py-4 font-display text-[16px] font-semibold text-ink disabled:opacity-60"
          >
            {passkeyLoading ? <Spinner dark /> : <FingerprintIcon dark />}
            {passkeyLoading ? "Memverifikasi…" : "Masuk dengan Sidik Jari"}
          </button>
          <p className="text-[11px] leading-relaxed text-muted">
            Tidak perlu tahu crypto. Cukup sentuh sidik jari.
          </p>
        </div>

        {/* ── Classic wallet (Albedo / Freighter) ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
            Sudah punya wallet Stellar
          </p>
          <MetalCta className="block w-full">
            <button
              onClick={handleConnect}
              disabled={busy}
              className="liquid-surface flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-btn py-4 font-display text-[17px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? <Spinner /> : <WalletIcon />}
              {busy ? "Menghubungkan…" : "Hubungkan Wallet"}
            </button>
          </MetalCta>
          <p className="text-[12px] leading-relaxed text-muted">
            <strong className="text-ink">Albedo</strong> — tanpa install, buka di browser.{" "}
            <strong className="text-ink">Freighter</strong> — jika sudah punya extension.
          </p>
        </div>

        <p className="mt-6 text-[12px] text-muted">
          Dengan masuk, kamu setuju dengan Syarat &amp; Ketentuan Lunas.
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

function FingerprintIcon({ dark }: { dark?: boolean }) {
  const color = dark ? "#15161B" : "white";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} aria-hidden>
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
