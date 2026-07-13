"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileShell } from "./MobileShell";
import { PayWithSheet } from "./PayWithSheet";
import { Processing } from "./Processing";
import { Success } from "./Success";
import { formatRp, formatUsd } from "@/lib/format";
import { screenIn } from "@/lib/motion";
import { EDGE } from "@/lib/checkoutStatus";
import { useCheckout } from "@/lib/useCheckout";
import { useWalletContext } from "@/lib/wallet-context";
import { CctpCheckout } from "@/components/cctp/CctpCheckout";
import { useState } from "react";

export function CheckoutFlow({ orderId }: { orderId: string }) {
  const co = useCheckout(orderId);

  if (co.orderLoading) {
    return (
      <MobileShell>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-5 w-5 animate-wobble rounded-full bg-primary" />
        </div>
      </MobileShell>
    );
  }

  if (co.screen === "edge" && co.edge) {
    const cfg = EDGE[co.edge];
    return (
      <MobileShell>
        <motion.div className="flex flex-1 flex-col" variants={screenIn} initial="initial" animate="animate">
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="glass mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-[22px]">
              {cfg.icon}
            </div>
            <div className="max-w-[260px] font-display text-2xl font-bold leading-[1.25]">{cfg.title}</div>
            <div className="mt-3 max-w-[240px] text-[15px] leading-[1.5] text-muted">{cfg.body}</div>
          </div>
          <div className="flex flex-none flex-col gap-1.5 px-[22px] pb-8 pt-3.5">
            {cfg.primary && <Button className="h-[54px] rounded-[20px]">{cfg.primary}</Button>}
            <a href="/" className="flex h-11 items-center justify-center text-[15px] text-muted">Back</a>
          </div>
        </motion.div>
      </MobileShell>
    );
  }

  if (co.screen === "processing") {
    return (
      <MobileShell>
        <motion.div key="processing" className="flex flex-1 flex-col" variants={screenIn} initial="initial" animate="animate">
          <Processing payingWith={co.selected?.label ?? "…"} />
        </motion.div>
      </MobileShell>
    );
  }

  if (co.screen === "success") {
    return (
      <MobileShell>
        <motion.div key="success" className="flex flex-1 flex-col" variants={screenIn} initial="initial" animate="animate">
          <Success
            item={co.order?.product_title ?? "Product"}
            seller=""
            priceUSD={co.priceUSD}
            payingWith={co.selected?.label ?? ""}
            txHash={co.txHash}
            onDone={() => window.location.href = "/"}
          />
        </motion.div>
      </MobileShell>
    );
  }

  return <CheckoutLive co={co} orderId={orderId} />;
}

function CheckoutLive({ co, orderId }: { co: ReturnType<typeof useCheckout>; orderId: string }) {
  const { address, connect, authStatus } = useWalletContext();
  const [sheetOpen, setSheetOpen] = useState(false);

  const product = co.order;
  const selected = co.selected;
  const canPay = !!selected && selected.enabled && !!address;

  return (
    <MobileShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key="checkout" className="flex flex-1 flex-col" variants={screenIn} initial="initial" animate="animate" exit="exit">
          <div className="flex h-[54px] flex-none items-center px-6">
            <Wordmark />
          </div>

          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-2">
            <div className="glass relative flex items-center gap-3 overflow-hidden rounded-card p-3">
              <div
                className="pointer-events-none absolute -left-5 -top-10 h-[150px] w-[150px] rounded-full"
                style={{ background: "radial-gradient(closest-side,rgba(255,255,255,.7),rgba(255,255,255,0))" }}
              />
              <div className="relative flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[15px] bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
                {product?.product_title?.[0] ?? "?"}
              </div>
              <div className="relative">
                <div className="font-display text-[17px] font-semibold">{product?.product_title ?? "Loading…"}</div>
                {product?.merchant_name && (
                  <div className="flex items-center gap-1 text-[12px] text-muted">
                    <span>{product.merchant_name}</span>
                    {product.merchant_verified && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-white">✓</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <motion.div
              className="my-auto py-[30px] text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              <div className="mb-3 text-[13px] uppercase tracking-[.1em] text-muted">Total</div>
              <div className="tnum font-display text-[66px] font-extrabold leading-[.95] tracking-[-.045em]">
                {formatRp(co.priceUSD)}
              </div>
              <div className="mt-3 text-[17px] font-medium text-muted">{formatUsd(co.priceUSD)}</div>
            </motion.div>

            {!address ? (
              <div className="flex flex-col items-center gap-3 rounded-card border border-ink/[.08] bg-white/60 p-5 text-center">
                <div className="text-[15px] font-semibold">Connect wallet to pay</div>
                <Button
                  onClick={connect}
                  className="h-[46px] rounded-[18px] text-[15px]"
                >
                  {authStatus === "connecting" ? "Connecting…" : "Connect wallet"}
                </Button>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={() => setSheetOpen(true)}
                  whileTap={{ scale: 0.98 }}
                  className={`glass relative flex items-center justify-between overflow-hidden rounded-card p-4 ${canPay ? "" : "!border-danger/40"}`}
                >
                  <div className="pointer-events-none absolute -left-6 -top-11 h-40 w-40 rounded-full"
                    style={{ background: "radial-gradient(closest-side,rgba(255,255,255,.65),rgba(255,255,255,0))" }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F1EFEA] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
                      {co.quotesLoading ? "⋯" : (selected?.emoji ?? "💰")}
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] uppercase tracking-[.04em] text-muted">Pay with</div>
                      <div className="font-display text-base font-semibold">
                        {co.quotesLoading ? "Finding options…" : (selected?.label ?? "Select")}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-1.5">
                    {selected?.approx && <span className="tnum text-[15px] text-muted">{selected.approx}</span>}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6l6 6-6 6" stroke="#9b9aa1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </motion.button>

                {co.payError && (
                  <div className="mt-2 rounded-[12px] bg-danger/10 px-4 py-2.5 text-sm text-danger">
                    {co.payError}
                  </div>
                )}

                <div className="mt-3 text-center text-[13px] text-muted">
                  {co.edge === "nobalance"
                    ? "No compatible balance found."
                    : "Pay with any balance you already have."}
                </div>

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
          </div>

          <div className="flex-none px-[22px] pb-8 pt-3.5">
            {canPay && !co.quotesLoading ? (
              <Button plain onClick={co.pay}>Pay</Button>
            ) : address ? (
              <Button variant="disabled">{co.quotesLoading ? "Finding options…" : "Not enough balance"}</Button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      <PayWithSheet
        open={sheetOpen}
        options={co.options}
        selectedKey={co.selectedKey}
        onClose={() => setSheetOpen(false)}
        onSelect={(o) => { co.setSelectedKey(o.key); setSheetOpen(false); }}
      />
    </MobileShell>
  );
}
