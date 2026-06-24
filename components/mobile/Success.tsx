"use client";

import { Button } from "@/components/ui/Button";
import { formatRp } from "@/lib/format";

// The signature "Lunas ✓" receipt moment — earned, quick, no confetti overload.
export function Success({
  item,
  seller,
  priceUSD,
  payingWith,
  onDone,
}: {
  item: string;
  seller: string;
  priceUSD: number;
  payingWith: string;
  onDone: () => void;
}) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-[22px] pb-2 pt-6">
        <div className="my-4 animate-fade text-center text-[13px] text-muted">
          Paid with {payingWith} → received ${priceUSD}
        </div>

        <div className="relative flex h-24 w-24 items-center justify-center">
          <div
            className="absolute h-24 w-24 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side,rgba(31,157,120,.4),rgba(31,157,120,0))",
              animation: "halo .9s .2s ease-out both",
            }}
          />
          <div
            className="relative flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full bg-success shadow-[0_16px_36px_rgba(31,157,120,.4),inset_0_2px_8px_rgba(255,255,255,.35)]"
            style={{ animation: "pop .5s .15s ease both" }}
          >
            <div className="absolute left-[18px] top-[14px] h-[18px] w-[26px] rounded-full bg-white/40 blur-[3px]" />
            <svg width="48" height="48" viewBox="0 0 52 52" fill="none" className="relative">
              <path
                d="M15 27l7 7 15-17"
                stroke="#fff"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 48,
                  strokeDashoffset: 48,
                  animation: "lunasDraw .45s .42s ease forwards",
                }}
              />
            </svg>
          </div>
        </div>

        <div
          className="my-[22px] font-display text-5xl font-extrabold tracking-[-.025em] text-success"
          style={{ animation: "rise .5s .55s ease both" }}
        >
          Lunas ✓
        </div>

        <div
          className="glass relative w-full overflow-hidden rounded-[26px] px-[18px] py-1.5"
          style={{ animation: "slide .5s .7s ease both" }}
        >
          <Row label="Item" value={item} />
          <Row label="Seller" value={seller} top />
          <Row label="Total" value={formatRp(priceUSD)} display top />
          <Row label="Date" value="22 Jun 2026" top />
          <div className="relative border-t border-ink/[.07] py-[13px]">
            <span className="cursor-pointer text-sm font-semibold text-primary">
              View proof ↗
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2.5 px-[22px] pb-8 pt-3.5">
        <Button variant="glass" className="h-[54px] rounded-[20px]">
          Share receipt
        </Button>
        <Button onClick={onDone} className="h-[54px] rounded-[20px]">
          Done
        </Button>
      </div>

      <style jsx global>{`
        @keyframes lunasDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}

function Row({
  label,
  value,
  top,
  display,
}: {
  label: string;
  value: string;
  top?: boolean;
  display?: boolean;
}) {
  return (
    <div
      className={`relative flex justify-between py-[13px] text-[15px] ${
        top ? "border-t border-ink/[.07]" : ""
      }`}
    >
      <span className="text-muted">{label}</span>
      <span
        className={display ? "tnum font-display font-bold text-ink" : "text-ink"}
      >
        {value}
      </span>
    </div>
  );
}
