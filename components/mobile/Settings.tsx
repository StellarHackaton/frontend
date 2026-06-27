"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Button } from "@/components/ui/Button";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { merchant } from "@/lib/mock";

export function Settings() {
  const router = useRouter();
  return (
    <MobileShell>
      <MobileHeader title="Settings" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <div className="glass-strong relative mb-5 flex items-center gap-4 overflow-hidden rounded-[24px] p-5">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
            {merchant.initial}
          </div>
          <div>
            <div className="font-display text-lg font-bold">{merchant.name}</div>
            <div className="text-sm text-muted">{merchant.business}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
          <Row label="Business name" value={merchant.business} />
          <Row label="Member since" value={merchant.joined} top />
          <Row label="Payout balance" value={merchant.payoutBalance} top display />
          <Row label="Receives" value="Dollar" top />
          <Row label="Language" value="English" top />
        </div>
      </div>

      <div className="flex-none px-[22px] pb-[96px] pt-3.5">
        <Button variant="glass" onClick={() => router.push("/login")}>
          Sign out
        </Button>
      </div>
      <TabBar />
    </MobileShell>
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
      className={`flex items-center justify-between px-5 py-[15px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span
        className={
          display
            ? "tnum font-display text-sm font-bold text-ink"
            : "text-sm text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
