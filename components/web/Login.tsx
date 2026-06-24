"use client";

import { useRouter } from "next/navigation";
import { MetalCta } from "@/components/ui/MetalCta";

export function Login() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-[440px] rounded-[28px] border border-ink/[.08] bg-white p-12 text-center shadow-[0_20px_50px_rgba(21,22,27,.10)]">
        <span className="font-display text-[46px] font-extrabold tracking-[-.035em] text-primary">
          lunas
        </span>
        <div className="mx-auto mt-4 max-w-[300px] font-display text-[19px] font-medium leading-[1.4]">
          Get paid in any balance. Receive exact dollars.
        </div>
        <MetalCta className="mt-9 block w-full">
          <button
            onClick={() => router.push("/dashboard")}
            className="liquid-surface w-full overflow-hidden rounded-btn py-4 font-display text-[17px] font-semibold text-white"
          >
            Continue
          </button>
        </MetalCta>
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[13px] text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="3.5" stroke="#9b9aa1" strokeWidth="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#9b9aa1" strokeWidth="1.8" />
          </svg>
          Secured with Face ID
        </div>
      </div>
    </main>
  );
}
