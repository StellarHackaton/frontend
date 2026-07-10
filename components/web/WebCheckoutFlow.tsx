"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WebCard } from "./WebCard";
import { formatRp, formatUsd } from "@/lib/format";
import { EASE, listContainer, listItem, screenIn } from "@/lib/motion";
import { EDGE } from "@/lib/checkoutStatus";
import { MetalButton } from "@/components/ui/MetalButton";
import { useEscClose } from "@/lib/useEscClose";
import { useCheckout, CheckoutOption } from "@/lib/useCheckout";
import { useWalletContext } from "@/lib/wallet-context";
import { CctpCheckout } from "@/components/cctp/CctpCheckout";

export function WebCheckoutFlow({ orderId }: { orderId: string }) {
  const co = useCheckout(orderId);
  const { address, connect, authStatus } = useWalletContext();

  if (co.orderLoading) {
    return (
      <WebCard>
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-wobble rounded-full bg-primary" />
        </div>
      </WebCard>
    );
  }

  if (co.screen === "edge" && co.edge) {
    const cfg = EDGE[co.edge];
    return (
      <WebCard>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-paper">{cfg.icon}</div>
          <div className="max-w-[320px] font-display text-[24px] font-bold leading-[1.25]">{cfg.title}</div>
          <div className="mt-3 max-w-[300px] text-[15px] leading-[1.5] text-muted">{cfg.body}</div>
          <div className="mt-8 flex w-full flex-col gap-2.5">
            {cfg.primary && <MetalButton>{cfg.primary}</MetalButton>}
            <a href="/" className="flex h-11 items-center justify-center text-[15px] text-muted">Back</a>
          </div>
        </div>
      </WebCard>
    );
  }

  if (co.screen === "processing") {
    return (
      <WebCard>
        <div className="flex flex-col items-center py-10">
          <div className="relative mb-7 flex h-[90px] w-[90px] items-center justify-center">
            <div className="absolute h-[70px] w-[70px] rounded-full"
              style={{ background: "radial-gradient(closest-side,rgba(47,42,107,.16),rgba(47,42,107,0))" }} />
            <div className="h-4 w-4 animate-wobble rounded-full bg-primary" />
          </div>
          <div className="font-display text-[23px] font-semibold">Processing your payment…</div>
          <div className="mt-2 text-[15px] text-muted">Paying with {co.selected?.label ?? "…"}</div>
        </div>
      </WebCard>
    );
  }

  if (co.screen === "success") {
    return (
      <WebCard>
        <div className="flex flex-col items-center">
          <div className="mb-6 text-[13px] text-muted">
            Paid with {co.selected?.label ?? "wallet"} → received ${co.priceUSD.toFixed(2)}
          </div>
          <div className="relative flex h-[84px] w-[84px] items-center justify-center">
            <div className="absolute h-[84px] w-[84px] rounded-full"
              style={{ background: "radial-gradient(closest-side,rgba(31,157,120,.4),rgba(31,157,120,0))", animation: "halo .9s .2s ease-out both" }} />
            <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-success shadow-[0_16px_34px_rgba(31,157,120,.32)]"
              style={{ animation: "pop .5s .15s ease both" }}>
              <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
                <path d="M15 27l7 7 15-17" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: "lunasDraw .45s .42s ease forwards" }} />
              </svg>
            </div>
          </div>
          <div className="my-6 font-display text-[46px] font-extrabold tracking-[-.025em] text-success"
            style={{ animation: "rise .5s .55s ease both" }}>
            Lunas ✓
          </div>
          <div className="w-full rounded-[18px] border border-ink/[.06] bg-paper px-[18px] py-1"
            style={{ animation: "slide .5s .7s ease both" }}>
            <Row label="Item" value={co.order?.product_title ?? "Product"} />
            <Row label="Total" value={formatRp(co.priceUSD)} top display />
            {co.txHash && (
              <div className="border-t border-ink/[.06] py-3">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${co.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-sm font-semibold text-primary"
                >
                  View proof ↗
                </a>
              </div>
            )}
          </div>
          <div className="mt-5 flex w-full gap-2.5">
            <div className="flex-1">
              <MetalButton onClick={() => window.location.href = "/"} preset="gold" className="!py-3 text-[15px]">
                Done
              </MetalButton>
            </div>
          </div>
        </div>
      </WebCard>
    );
  }

  // Checkout screen
  const selected = co.selected;
  const canPay = !!selected && selected.enabled && !!address && !co.quotesLoading;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key="checkout" variants={screenIn} initial="initial" animate="animate" exit="exit">
          <WebCard>
            <div className="flex items-center gap-3">
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-primary-soft font-display text-xl font-bold text-primary">
                {co.order?.product_title?.[0] ?? "?"}
              </div>
              <div>
                <div className="font-display text-[17px] font-semibold">{co.order?.product_title ?? "Loading…"}</div>
                {co.order?.merchant_name && (
                  <div className="flex items-center gap-1 text-[12px] text-muted">
                    <span>{co.order.merchant_name}</span>
                    {co.order.merchant_verified && (
                      <span title="Verified merchant" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-white">✓</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <motion.div className="py-9 text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}>
              <div className="mb-3 text-[13px] uppercase tracking-[.1em] text-muted">Total</div>
              <div className="tnum font-display text-[64px] font-extrabold leading-[.95] tracking-[-.045em] sm:text-[72px]">
                {formatRp(co.priceUSD)}
              </div>
              <div className="mt-3 text-[17px] font-medium text-muted">{formatUsd(co.priceUSD)}</div>
            </motion.div>

            {!address ? (
              <div className="flex flex-col items-center gap-4 rounded-[18px] border border-ink/[.08] bg-paper px-6 py-6 text-center">
                <div className="text-[15px] font-semibold">Connect your wallet to pay</div>
                <button
                  onClick={connect}
                  className="liquid-surface rounded-btn px-6 py-3 font-display text-[15px] font-semibold text-white"
                >
                  {authStatus === "connecting" ? "Connecting…" : "Connect wallet"}
                </button>
              </div>
            ) : (
              <>
                <WebPayPicker
                  options={co.options}
                  selectedKey={co.selectedKey}
                  onSelect={(key) => co.setSelectedKey(key)}
                  loading={co.quotesLoading}
                />

                {co.payError && (
                  <div className="mt-3 rounded-[12px] bg-danger/10 px-4 py-2.5 text-sm text-danger">
                    {co.payError}
                  </div>
                )}

                <div className="my-4 text-center text-[13px] text-muted">
                  {co.edge === "nobalance"
                    ? "No compatible balance found in this wallet."
                    : "Pay with any balance you already have."}
                </div>

                {canPay ? (
                  <motion.button
                    onClick={co.pay}
                    whileTap={{ scale: 0.97 }}
                    className="liquid-surface w-full overflow-hidden rounded-btn py-4 font-display text-[17px] font-semibold text-white"
                  >
                    Pay
                  </motion.button>
                ) : (
                  <button disabled className="w-full cursor-not-allowed rounded-btn bg-ink/20 py-4 font-display text-[17px] font-semibold text-muted">
                    {co.quotesLoading ? "Finding options…" : address ? "Not enough balance" : "Connect wallet"}
                  </button>
                )}

                {co.order?.merchant_address && (
                  <>
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-ink/[.08]" />
                      <span className="text-[12px] text-muted">atau dari chain lain</span>
                      <div className="h-px flex-1 bg-ink/[.08]" />
                    </div>
                    <CctpCheckout
                      amountUsdc={co.priceUSD.toFixed(2)}
                      merchantAddress={co.order.merchant_address}
                      orderId={orderId}
                      onSuccess={() => co.openSSE()}
                      onError={(msg) => co.setPayError(msg)}
                    />
                  </>
                )}
              </>
            )}
          </WebCard>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function WebPayPicker({
  options,
  selectedKey,
  onSelect,
  loading,
}: {
  options: CheckoutOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-[58px] items-center justify-center rounded-[18px] border border-ink/[.08] bg-paper">
        <span className="text-[15px] text-muted">Finding payment options…</span>
      </div>
    );
  }

  return (
    <motion.div className="flex flex-col gap-2.5" variants={listContainer} initial="initial" animate="animate">
      {options.map((o) => {
        const selected = o.key === selectedKey;
        return (
          <motion.button
            key={o.key}
            variants={listItem}
            whileTap={o.enabled ? { scale: 0.98 } : undefined}
            onClick={() => o.enabled && onSelect(o.key)}
            disabled={!o.enabled}
            className={`flex items-center justify-between rounded-[16px] border bg-paper p-3 text-left ${
              o.enabled
                ? selected ? "border-primary" : "border-ink/[.08]"
                : "cursor-not-allowed border-danger/40 opacity-90"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-xl">{o.emoji}</div>
              <div>
                <div className="font-display text-base font-semibold">{o.label}</div>
                {o.helper && <div className="text-xs text-danger">{o.helper}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="tnum text-[15px] text-muted">{o.approx}</span>
              {selected && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#2F2A6B" />
                  <path d="M7 12.5l3.2 3.2L17 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function Row({
  label, value, top, display,
}: {
  label: string; value: string; top?: boolean; display?: boolean;
}) {
  return (
    <div className={`flex justify-between py-3 text-[15px] ${top ? "border-t border-ink/[.06]" : ""}`}>
      <span className="text-muted">{label}</span>
      <span className={display ? "tnum font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
