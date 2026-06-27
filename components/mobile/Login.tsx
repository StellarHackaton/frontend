"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { useWalletContext } from "@/lib/wallet-context";
import { LogoMark, Wordmark } from "@/components/ui/Wordmark";

export function Login() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, connectFreighter, authStatus, isConnected } =
    useWalletContext();

  // Redirect as soon as wallet is connected / auth succeeds
  useEffect(() => {
    if (authStatus === "logged-in" || isConnected) {
      router.push("/dashboard");
    }
  }, [authStatus, isConnected, router]);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | "freighter" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading("google");
    try {
      await loginWithGoogle();
      // redirect handled by useEffect watching authStatus
    } catch {
      setError("Login gagal. Coba lagi.");
      setLoading(null);
    }
  };

  const handleEmail = async () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    if (!email) return;
    setError(null);
    setLoading("email");
    try {
      loginWithEmail(email);
      // Crossmint opens an OTP modal — redirect happens after modal closes
    } catch {
      setError("Login gagal. Coba lagi.");
    } finally {
      setLoading(null);
    }
  };

  const handleFreighter = async () => {
    setError(null);
    setLoading("freighter");
    try {
      await connectFreighter();
      // redirect handled by useEffect watching isConnected
    } catch {
      setError("Freighter tidak tersambung. Pastikan extension terpasang.");
      setLoading(null);
    }
  };

  const busy = authStatus === "in-progress" || loading !== null;

  return (
    <MobileShell>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={60} />
          <Wordmark size={36} />
        </div>
        <div className="mt-[18px] max-w-[260px] font-display text-[19px] font-medium leading-[1.4]">
          Terima bayaran dalam bentuk apapun. Dapat dolar pas.
        </div>
      </div>

      <div className="flex flex-none flex-col gap-3 px-[22px] pb-9 pt-3.5">
        {error && (
          <p className="text-center text-[13px] text-red-500">{error}</p>
        )}

        {/* Google */}
        <Button
          onClick={handleGoogle}
          disabled={busy}
          className="flex items-center justify-center gap-2"
        >
          {loading === "google" ? (
            <Spinner />
          ) : (
            <GoogleIcon />
          )}
          Masuk dengan Google
        </Button>

        {/* Email */}
        {showEmailInput && (
          <input
            type="email"
            placeholder="email@kamu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmail()}
            autoFocus
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-[15px] text-ink outline-none focus:border-primary"
          />
        )}
        <Button
          onClick={handleEmail}
          disabled={busy || (showEmailInput && !email)}
          variant="glass"
        >
          {loading === "email" ? <Spinner /> : showEmailInput ? "Kirim kode" : "Masuk dengan Email"}
        </Button>

        <div className="my-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-[12px] text-muted">atau</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        {/* Freighter */}
        <button
          onClick={handleFreighter}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white py-3 text-[14px] font-medium text-ink disabled:opacity-50"
        >
          {loading === "freighter" ? <Spinner small /> : <FreighterIcon />}
          Sambung Freighter
        </button>
      </div>
    </MobileShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FreighterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#1C1C3A" />
      <path d="M8 16h16M16 8l8 8-8 8" stroke="#8B8BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ small }: { small?: boolean }) {
  const s = small ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <svg className={`animate-spin ${s}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
