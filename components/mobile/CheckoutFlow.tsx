"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileShell } from "./MobileShell";
import { PayWithSheet } from "./PayWithSheet";
import { Processing } from "./Processing";
import { Success } from "./Success";
import { balances as ALL_BALANCES, Balance, MockProduct } from "@/lib/mock";
import { formatRp, formatUsd } from "@/lib/format";
import { screenIn } from "@/lib/motion";
import { EDGE } from "@/lib/checkoutStatus";

type Screen = "checkout" | "processing" | "success";

export function CheckoutFlow({
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
      <MobileShell>
        <motion.div
          className="flex flex-1 flex-col"
          variants={screenIn}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="glass mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-[22px]">
              {cfg.icon}
            </div>
            <div className="max-w-[260px] font-display text-2xl font-bold leading-[1.25]">
              {cfg.title}
            </div>
            <div className="mt-3 max-w-[240px] text-[15px] leading-[1.5] text-muted">
              {cfg.body}
            </div>
          </div>
          <div className="flex flex-none flex-col gap-1.5 px-[22px] pb-8 pt-3.5">
            {cfg.primary && (
              <Button className="h-[54px] rounded-[20px]">{cfg.primary}</Button>
            )}
            <a
              href="/"
              className="flex h-11 items-center justify-center text-[15px] text-muted"
            >
              Back
            </a>
          </div>
        </motion.div>
      </MobileShell>
    );
  }
  return <CheckoutLive product={product} settleMs={settleMs} />;
}

function CheckoutLive({
  product,
  settleMs = 2600,
}: {
  product: MockProduct;
  settleMs?: number;
}) {
  const [screen, setScreen] = useState<Screen>("checkout");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState("euro");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const selected =
    ALL_BALANCES.find((b) => b.key === selectedKey) ?? ALL_BALANCES[0];
  const canPay = selected.enabled;

  function pay() {
    setSheetOpen(false);
    setScreen("processing");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setScreen("success"), settleMs);
  }
  function select(b: Balance) {
    if (!b.enabled) return;
    setSelectedKey(b.key);
    setSheetOpen(false);
  }
  function reset() {
    clearTimeout(timer.current);
    setScreen("checkout");
    setSheetOpen(false);
  }

  return (
    <MobileShell>
      <AnimatePresence mode="wait" initial={false}>
        {screen === "processing" && (
          <motion.div
            key="processing"
            className="flex flex-1 flex-col"
            variants={screenIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Processing payingWith={selected.name} />
          </motion.div>
        )}

        {screen === "success" && (
          <motion.div
            key="success"
            className="flex flex-1 flex-col"
            variants={screenIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Success
              item={product.name}
              seller={product.seller}
              priceUSD={product.priceUSD}
              payingWith={selected.name}
              onDone={reset}
            />
          </motion.div>
        )}

        {screen === "checkout" && (
          <motion.div
            key="checkout"
            className="flex flex-1 flex-col"
            variants={screenIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex h-[54px] flex-none items-center px-6">
              <Wordmark />
            </div>

            <div className="flex flex-1 flex-col px-[22px] pb-4 pt-2">
              <div className="glass relative flex items-center gap-3 overflow-hidden rounded-card p-3">
                <div
                  className="pointer-events-none absolute -left-5 -top-10 h-[150px] w-[150px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(closest-side,rgba(255,255,255,.7),rgba(255,255,255,0))",
                  }}
                />
                <div className="relative flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[15px] bg-primary-soft font-display text-xl font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
                  {product.sellerInitial}
                </div>
                <div className="relative">
                  <div className="text-[13px] text-muted">{product.seller}</div>
                  <div className="font-display text-[17px] font-semibold">
                    {product.name}
                  </div>
                </div>
              </div>

              <motion.div
                className="my-auto py-[30px] text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              >
                <div className="mb-3 text-[13px] uppercase tracking-[.1em] text-muted">
                  Total
                </div>
                <div className="tnum font-display text-[66px] font-extrabold leading-[.95] tracking-[-.045em]">
                  {formatRp(product.priceUSD)}
                </div>
                <div className="mt-3 text-[17px] font-medium text-muted">
                  {formatUsd(product.priceUSD)}
                </div>
              </motion.div>

              <motion.button
                onClick={() => setSheetOpen(true)}
                whileTap={{ scale: 0.98 }}
                className={`glass relative flex items-center justify-between overflow-hidden rounded-card p-4 ${
                  canPay ? "" : "!border-danger/40"
                }`}
              >
                <div
                  className="pointer-events-none absolute -left-6 -top-11 h-40 w-40 rounded-full"
                  style={{
                    background:
                      "radial-gradient(closest-side,rgba(255,255,255,.65),rgba(255,255,255,0))",
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F1EFEA] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
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
                      <div className="mt-0.5 text-xs text-danger">
                        {selected.helper}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative flex items-center gap-1.5">
                  {selected.approx && (
                    <span className="tnum text-[15px] text-muted">
                      {selected.approx}
                    </span>
                  )}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="#9b9aa1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.button>
              <div className="mt-3 text-center text-[13px] text-muted">
                {canPay
                  ? "Pay with any balance you already have."
                  : "Pick another balance to continue."}
              </div>
            </div>

            <div className="flex-none px-[22px] pb-8 pt-3.5">
              {canPay ? (
                <Button metalPreset="gold" onClick={pay}>
                  Pay
                </Button>
              ) : (
                <Button variant="disabled">Not enough balance</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PayWithSheet
        open={sheetOpen}
        balances={ALL_BALANCES}
        selectedKey={selectedKey}
        onClose={() => setSheetOpen(false)}
        onSelect={select}
      />
    </MobileShell>
  );
}
