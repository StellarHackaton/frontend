"use client";

import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Button } from "@/components/ui/Button";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";

export function Settings() {
  const { address, userInitial, disconnect } = useWalletContext();
  const { balanceUsdc } = useDashboard(address);

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const shortAddress = address
    ? `${address.slice(0, 8)}…${address.slice(-6)}`
    : "—";

  return (
    <MobileShell>
      <MobileHeader title="Settings" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        <div className="glass-strong relative mb-5 flex items-center gap-4 overflow-hidden rounded-[24px] p-5">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-bold">Merchant</div>
            <div className="truncate font-mono text-[12px] text-muted">{shortAddress}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-white/65 bg-white/55 backdrop-blur-[16px]">
          <Row label="Wallet" value={shortAddress} mono />
          <Row label="Member since" value={joined} top />
          <Row label="Payout balance" value={`$${balanceUsdc.toFixed(2)}`} top display />
          <Row label="Receives" value="USDC (Stellar)" top />
          <Row label="Network" value="Testnet" top />
        </div>
      </div>

      <div className="flex-none px-[22px] pb-[96px] pt-3.5">
        <Button variant="glass" onClick={disconnect}>
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
  mono,
}: {
  label: string;
  value: string;
  top?: boolean;
  display?: boolean;
  mono?: boolean;
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
            : mono
            ? "truncate font-mono text-[12px] text-ink"
            : "text-sm text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
