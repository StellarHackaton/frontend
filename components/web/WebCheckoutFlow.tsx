"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WebCard } from "./WebCard";
import { balances as ALL_BALANCES, Balance, MockProduct } from "@/lib/mock";
import { formatRp, formatUsd } from "@/lib/format";
import { EASE, listContainer, listItem, screenIn } from "@/lib/motion";
import { EDGE } from "@/lib/checkoutStatus";
import { MetalCta } from "@/components/ui/MetalCta";
import { MetalButton } from "@/components/ui/MetalButton";

type Screen = "checkout" | "processing" | "success";

export function WebCheckoutFlow({
  product,
  settleMs = 2600,
  state = "normal",
}: {
  product: MockProduct;
  settleMs?: number;
  state?: "normal" | "nobalance" | "expired" | "paid";
}) {
  if (state !== "normal") {
    const cfg = EDGE[state];
    return (
      <WebCard>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-paper">
            {cfg.icon}
          </div>
          <div className="max-w-[320px] font-display text-[24px] font-bold leading-[1.25]">
            {cfg.title}
          </div>
          <div className="mt-3 max-w-[300px] text-[15px] leading-[1.5] text-muted">
            {cfg.body}
          </div>
          <div className="mt-8 flex w-full flex-col gap-2.5">
            {cfg.primary && <MetalButton>{cfg.primary}</MetalButton>}
            <a
              href="/"
              className="flex h-11 items-center justify-center text-[15px] text-muted"
            >
              Back
            </a>
          </div>
        </div>
      </WebCard>
    );
  }
  return <WebCheckoutLive product={product} settleMs={settleMs} />;
}

function WebCheckoutLive({
  product,
  settleMs = 2600,
}: {
  product: MockProduct;
  settleMs?: number;
}) {
  const [screen, setScreen] = useState<Screen>("checkout");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("euro");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const selected =
    ALL_BALANCES.find((b) => b.key === selectedKey) ?? ALL_BALANCES[0];
  const canPay = selected.enabled;

  function pay() {
    setModalOpen(false);
    setScreen("processing");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setScreen("success"), settleMs);
  }
  function select(b: Balance) {
    if (!b.enabled) return;
    setSelectedKey(b.key);
    setModalOpen(false);
  }
  function reset() {
    clearTimeout(timer.current);
    setScreen("checkout");
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          variants={screenIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {screen === "processing" && (
            <WebCard>
              <div className="flex flex-col items-center py-10">
                <div className="relative mb-7 flex h-[90px] w-[90px] items-center justify-center">
                  <div
                    className="absolute h-[70px] w-[70px] rounded-full"
                    style={{
                      background:
                        "radial-gradient(closest-side,rgba(47,42,107,.16),rgba(47,42,107,0))",
                    }}
                  />
                  <div className="h-4 w-4 animate-wobble rounded-full bg-primary" />
                </div>
                <div className="font-display text-[23px] font-semibold">
                  Processing your payment…
                </div>
                <div className="mt-2 text-[15px] text-muted">
                  Paying with {selected.name}
                </div>
              </div>
            </WebCard>
          )}

          {screen === "success" && (
            <WebCard>
              <div className="flex flex-col items-center">
                <div className="mb-6 text-[13px] text-muted">
                  Paid with {selected.name} → received ${product.priceUSD}
                </div>
                <div className="relative flex h-[84px] w-[84px] items-center justify-center">
                  <div
                    className="absolute h-[84px] w-[84px] rounded-full"
                    style={{
                      background:
                        "radial-gradient(closest-side,rgba(31,157,120,.4),rgba(31,157,120,0))",
                      animation: "halo .9s .2s ease-out both",
                    }}
                  />
                  <div
                    className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-success shadow-[0_16px_34px_rgba(31,157,120,.32)]"
                    style={{ animation: "pop .5s .15s ease both" }}
                  >
                    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
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
                  className="my-6 font-display text-[46px] font-extrabold tracking-[-.025em] text-success"
                  style={{ animation: "rise .5s .55s ease both" }}
                >
                  Lunas ✓
                </div>
                <div
                  className="w-full rounded-[18px] border border-ink/[.06] bg-paper px-[18px] py-1"
                  style={{ animation: "slide .5s .7s ease both" }}
                >
                  <Row label="Item" value={product.name} />
                  <Row label="Seller" value={product.seller} top />
                  <Row label="Total" value={formatRp(product.priceUSD)} top display />
                  <Row label="Date" value="22 Jun 2026" top />
                  <div className="border-t border-ink/[.06] py-3">
                    <span className="cursor-pointer text-sm font-semibold text-primary">
                      View proof ↗
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex w-full gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="liquid-glass !border-primary/40 flex-1 rounded-[14px] py-3 font-display text-[15px] font-semibold text-primary"
                  >
                    Share receipt
                  </motion.button>
                  <div className="flex-1">
                    <MetalButton onClick={reset} preset="gold" className="!py-3 text-[15px]">
                      Done
                    </MetalButton>
                  </div>
                </div>
              </div>
            </WebCard>
          )}

          {screen === "checkout" && (
            <WebCard>
              <div className="flex items-center gap-3">
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-primary-soft font-display text-xl font-bold text-primary">
                  {product.sellerInitial}
                </div>
                <div>
                  <div className="text-[13px] text-muted">{product.seller}</div>
                  <div className="font-display text-[17px] font-semibold">
                    {product.name}
                  </div>
                </div>
              </div>

              <motion.div
                className="py-9 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
              >
                <div className="mb-3 text-[13px] uppercase tracking-[.1em] text-muted">
                  Total
                </div>
                <div className="tnum font-display text-[64px] font-extrabold leading-[.95] tracking-[-.045em] sm:text-[72px]">
                  {formatRp(product.priceUSD)}
                </div>
                <div className="mt-3 text-[17px] font-medium text-muted">
                  {formatUsd(product.priceUSD)}
                </div>
              </motion.div>

              <motion.button
                onClick={() => setModalOpen(true)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center justify-between rounded-[18px] border bg-paper px-[18px] py-3.5 ${
                  canPay ? "border-ink/[.08]" : "border-danger/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-xl">
                    {selected.emoji}
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] uppercase tracking-[.04em] text-muted">
                      Pay with
                    </div>
                    <div className="font-display text-base font-semibold">
                      {selected.name}
                    </div>
                    {!canPay && selected.helper && (
                      <div className="text-xs text-danger">{selected.helper}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.approx && (
                    <span className="tnum text-[15px] text-muted">
                      {selected.approx}
                    </span>
                  )}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#9b9aa1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.button>

              <div className="my-4 text-center text-[13px] text-muted">
                {canPay
                  ? "Pay with any balance you already have."
                  : "Pick another balance to continue."}
              </div>

              {canPay ? (
                <MetalCta preset="gold" className="block w-full">
                  <motion.button
                    onClick={pay}
                    whileTap={{ scale: 0.97 }}
                    className="liquid-surface w-full overflow-hidden rounded-btn py-4 font-display text-[17px] font-semibold text-white"
                  >
                    Pay
                  </motion.button>
                </MetalCta>
              ) : (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-btn bg-ink/[.07] py-4 font-display text-[17px] font-semibold text-faint"
                >
                  Not enough balance
                </button>
              )}
            </WebCard>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <WebPayModal
            balances={ALL_BALANCES}
            selectedKey={selectedKey}
            onClose={() => setModalOpen(false)}
            onSelect={select}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function WebPayModal({
  balances,
  selectedKey,
  onClose,
  onSelect,
}: {
  balances: Balance[];
  selectedKey: string;
  onClose: () => void;
  onSelect: (b: Balance) => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-5">
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative w-full max-w-[420px] rounded-[24px] border border-ink/[.08] bg-white p-6 shadow-[0_30px_70px_rgba(21,22,27,.25)]"
      >
        <div className="font-display text-[22px] font-bold tracking-[-.01em]">
          Pay with
        </div>
        <div className="mb-4 mt-1 text-sm text-muted">
          Choose the balance you want to use
        </div>
        <motion.div
          className="flex flex-col gap-2.5"
          variants={listContainer}
          initial="initial"
          animate="animate"
        >
          {balances.map((b) => {
            const selected = b.key === selectedKey;
            return (
              <motion.button
                key={b.key}
                variants={listItem}
                whileTap={b.enabled ? { scale: 0.98 } : undefined}
                onClick={() => onSelect(b)}
                disabled={!b.enabled}
                className={`flex items-center justify-between rounded-[16px] border bg-paper p-3 text-left ${
                  b.enabled
                    ? selected
                      ? "border-primary"
                      : "border-ink/[.08]"
                    : "cursor-not-allowed border-danger/40 opacity-90"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-xl">
                    {b.emoji}
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold">
                      {b.name}
                    </div>
                    {b.helper && (
                      <div className="text-xs text-danger">{b.helper}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tnum text-[15px] text-muted">{b.approx}</span>
                  {selected && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#2F2A6B" />
                      <path
                        d="M7 12.5l3.2 3.2L17 8.5"
                        stroke="#fff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
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
      className={`flex justify-between py-3 text-[15px] ${
        top ? "border-t border-ink/[.06]" : ""
      }`}
    >
      <span className="text-muted">{label}</span>
      <span className={display ? "tnum font-display font-bold text-ink" : "text-ink"}>
        {value}
      </span>
    </div>
  );
}
