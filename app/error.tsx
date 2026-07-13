"use client";

import { useEffect } from "react";
import { MetalLink } from "@/components/ui/MetalButton";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="font-display text-[40px] font-extrabold tracking-[-.035em] text-primary">
        lunas
      </span>
      <div className="mt-6 font-display text-[28px] font-bold tracking-[-.02em]">
        Something went sideways
      </div>
      <div className="mt-2 max-w-[300px] text-[15px] leading-[1.5] text-muted">
        The page hit a snag. Try again, or head back home.
      </div>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="liquid-glass !border-primary/40 rounded-btn px-6 py-3.5 font-display text-base font-semibold text-primary"
        >
          Try again
        </button>
        <MetalLink href="/" className="px-7 py-3.5 text-base">
          Back home
        </MetalLink>
      </div>
    </main>
  );
}
