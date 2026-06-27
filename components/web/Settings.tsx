"use client";

import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";
import { WebShell } from "./WebShell";

export function Settings() {
  const { address, userInitial, disconnect } = useWalletContext();
  const { balanceUsdc } = useDashboard(address);

  const joined = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const shortAddress = address
    ? `${address.slice(0, 8)}…${address.slice(-6)}`
    : "—";

  const handleSignOut = async () => {
    await disconnect();
  };

  return (
    <WebShell title="Settings">
      <div className="max-w-[640px]">
        {/* profile */}
        <div className="liquid-glass mb-6 flex items-center gap-4 rounded-[24px] p-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl font-bold text-primary">
            {userInitial}
          </div>
          <div>
            <div className="font-display text-xl font-bold">Merchant</div>
            <div className="font-mono text-[13px] text-muted">{shortAddress}</div>
          </div>
        </div>

        {/* detail rows */}
        <div className="liquid-glass overflow-hidden rounded-[24px]">
          <Row label="Wallet address" value={shortAddress} mono />
          <Row label="Member since" value={joined} top />
          <Row label="Payout balance" value={`$${balanceUsdc.toFixed(2)}`} top display />
          <Row label="Receives" value="USDC (Stellar)" top />
          <Row label="Network" value="Testnet" top />
        </div>

        <button
          onClick={handleSignOut}
          className="liquid-glass !border-red-400/40 mt-6 w-full rounded-btn py-3.5 font-display text-[15px] font-semibold text-red-500"
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
      className={`flex items-center justify-between px-7 py-[18px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-[15px] text-muted">{label}</span>
      <span
        className={
          display
            ? "tnum font-display text-[15px] font-bold text-ink"
            : mono
            ? "font-mono text-[13px] text-ink"
            : "text-[15px] text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
