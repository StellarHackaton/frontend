"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { LogoMark, Wordmark } from "@/components/ui/Wordmark";

export function Login() {
  const router = useRouter();
  return (
    <MobileShell>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={60} />
          <Wordmark size={36} />
        </div>
        <div className="mt-[18px] max-w-[260px] font-display text-[19px] font-medium leading-[1.4]">
          Get paid in any balance. Receive exact dollars.
        </div>
      </div>
      <div className="flex flex-none flex-col items-center gap-3.5 px-[22px] pb-9 pt-3.5">
        <Button onClick={() => router.push("/dashboard")}>
          Continue
        </Button>
        <div className="flex items-center gap-1.5 text-[13px] text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="3.5" stroke="#9b9aa1" strokeWidth="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#9b9aa1" strokeWidth="1.8" />
          </svg>
          Secured with Face ID
        </div>
      </div>
    </MobileShell>
  );
}
