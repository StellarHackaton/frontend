"use client";

import { useRouter } from "next/navigation";
import { WebShell } from "./WebShell";
import { merchant } from "@/lib/mock";

export function Settings() {
  const router = useRouter();
  return (
    <WebShell title="Settings">
      <div className="max-w-[640px]">
        {/* profile */}
        <div className="liquid-glass mb-6 flex items-center gap-4 rounded-[24px] p-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl font-bold text-primary">
            {merchant.initial}
          </div>
          <div>
            <div className="font-display text-xl font-bold">{merchant.name}</div>
            <div className="text-[15px] text-muted">{merchant.business}</div>
          </div>
        </div>

        {/* detail rows */}
        <div className="liquid-glass overflow-hidden rounded-[24px]">
          <Row label="Business name" value={merchant.business} />
          <Row label="Member since" value={merchant.joined} top />
          <Row label="Payout balance" value={merchant.payoutBalance} top display />
          <Row label="Receives" value="Dollar" top />
          <Row label="Language" value="English" top />
        </div>

        <button
          onClick={() => router.push("/login")}
          className="liquid-glass !border-primary/40 mt-6 w-full rounded-btn py-3.5 font-display text-[15px] font-semibold text-primary"
        >
          Sign out
        </button>
      </div>
    </WebShell>
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
      className={`flex items-center justify-between px-7 py-[18px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-[15px] text-muted">{label}</span>
      <span
        className={
          display
            ? "tnum font-display text-[15px] font-bold text-ink"
            : "text-[15px] text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
