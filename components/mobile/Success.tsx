"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { EXPLORER_BASE, SHARE_OPTIONS, useReceiptShare } from "@/lib/receipt";
import { sheetSpring } from "@/lib/motion";
import { useLang, type Key } from "@/lib/i18n";

type Stage = "loading" | "check" | "title" | "receipt";

const SHARE_LABEL_KEY: Record<string, Key> = {
  native: "checkout.shareNative",
  whatsapp: "checkout.shareWhatsapp",
  telegram: "checkout.shareTelegram",
  email: "checkout.shareEmail",
  copy: "checkout.shareCopy",
  download: "checkout.shareDownload",
};

export function Success({
  item,
  seller,
  priceUSD,
  payingWith,
  txHash,
  onDone,
}: {
  item: string;
  seller: string;
  priceUSD: number;
  payingWith: string;
  txHash?: string | null;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [stage, setStage] = useState<Stage>("loading");
  const { copied, shareOpen, setShareOpen, handleShare } = useReceiptShare(
    item, seller, priceUSD, payingWith, txHash, stage === "receipt"
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStage("check"),   900);
    const t2 = setTimeout(() => setStage("title"),   1400);
    const t3 = setTimeout(() => setStage("receipt"), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0c0d12]">
      {/* top animated area — fills the whole screen while alone, then rises
          smoothly (layout animation) as the receipt reveals below it. */}
      <motion.div
        layout
        transition={sheetSpring}
        className="relative flex flex-1 flex-col items-center justify-center px-6"
      >
        {/* ambient glow */}
        <AnimatePresence>
          {stage !== "loading" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(31,157,120,.22), transparent)" }}
            />
          )}
        </AnimatePresence>

        {/* icon stage */}
        <motion.div
          layout
          animate={{ scale: stage === "receipt" ? 0.8 : 1 }}
          transition={sheetSpring}
          className="relative flex h-36 w-36 items-center justify-center"
        >
          {/* spinner */}
          <AnimatePresence>
            {stage === "loading" && (
              <motion.div
                key="spinner"
                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
                className="absolute h-28 w-28"
              >
                <svg className="animate-spin" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
                  <path d="M28 4 a24 24 0 0 1 24 24" stroke="#1F9D78" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-success/60 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* checkmark with ripple */}
          <AnimatePresence>
            {stage !== "loading" && (
              <motion.div
                key="checkmark"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 440, damping: 22 }}
                className="relative flex h-24 w-24 items-center justify-center"
              >
                {/* ripple rings */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                    transition={{ duration: 1 + i * 0.2, ease: "easeOut", delay: i * 0.12 }}
                    className="absolute h-24 w-24 rounded-full bg-success"
                  />
                ))}
                {/* circle */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success shadow-[0_0_48px_rgba(31,157,120,.55),inset_0_2px_8px_rgba(255,255,255,.3)]">
                  <div className="absolute left-4 top-3 h-4 w-7 rounded-full bg-white/35 blur-[4px]" />
                  <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
                    <path
                      d="M14 26l8 8 16-18"
                      stroke="#fff"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeDasharray: 52, strokeDashoffset: 52, animation: "lunasDraw .4s .08s ease forwards" }}
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* "Lunas ✓" */}
        <AnimatePresence>
          {(stage === "title" || stage === "receipt") && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, scale: stage === "receipt" ? 0.86 : 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className={stage === "receipt" ? "mt-2 text-center" : "mt-6 text-center"}
            >
              <div className="font-display text-[52px] font-extrabold leading-none tracking-[-.03em] text-white">
                Lunas <span className="text-success">✓</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2.5 text-[14px] text-white/45"
              >
                {t("checkout.paidWithPrefix")} {payingWith} {t("checkout.receivedPrefix")} ${priceUSD.toFixed(2)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* loading label */}
        <AnimatePresence>
          {stage === "loading" && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute bottom-20 text-[13px] font-medium tracking-[.04em] text-white/30 uppercase"
            >
              {t("checkout.verifying")}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* receipt sheet slides up */}
      <AnimatePresence>
        {stage === "receipt" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={sheetSpring}
            className="rounded-t-sheet bg-paper px-[22px] pb-8 pt-5 shadow-[0_-12px_40px_rgba(0,0,0,.35)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-4 overflow-hidden rounded-[20px] border border-ink/[.07]">
              <Row label={t("orders.item")} value={item} />
              {seller && <Row label={t("checkout.seller")} value={seller} top />}
              <Row label={t("checkout.total")} value={`$${priceUSD.toFixed(2)}`} display top />
              <Row label={t("orders.paidWith")} value={payingWith} top />
              {txHash && (
                <div className="border-t border-ink/[.07] px-1 py-[14px]">
                  <a
                    href={`${EXPLORER_BASE}/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[14px]"
                  >
                    <span className="text-muted">{t("checkout.viewProof")}</span>
                    <span className="flex items-center gap-1 font-medium text-primary">
                      {t("checkout.stellarExplorer")}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 7h10v10M7 17 17 7"/>
                      </svg>
                    </span>
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <Button variant="glass" className="h-[54px] rounded-[20px]" onClick={() => setShareOpen(true)}>
                {t("checkout.shareReceipt")}
              </Button>
              <Button onClick={onDone} className="h-[54px] rounded-[20px]">
                {t("checkout.done")}
              </Button>
            </div>

            {/* share sheet */}
            <AnimatePresence>
              {shareOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setShareOpen(false)}
                  />
                  <motion.div
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={sheetSpring}
                    className="fixed inset-x-0 bottom-0 z-50 rounded-t-sheet bg-paper px-5 pb-10 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,.18)]"
                  >
                    <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
                    <p className="mb-5 text-center font-display text-[17px] font-semibold text-ink">{t("checkout.shareReceipt")}</p>
                    <div className="grid grid-cols-3 gap-4">
                      {SHARE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleShare(opt.id)}
                          className="flex flex-col items-center gap-2 transition-transform active:scale-90"
                        >
                          <div className={`flex h-[54px] w-[54px] items-center justify-center rounded-[16px] ${opt.bg} ${opt.color}`}>
                            {opt.id === "copy" && copied
                              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                              : opt.icon}
                          </div>
                          <span className="text-[11px] text-muted">{opt.id === "copy" && copied ? t("checkout.shareCopied") : t(SHARE_LABEL_KEY[opt.id])}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes lunasDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function Row({ label, value, top, display }: { label: string; value: string; top?: boolean; display?: boolean }) {
  return (
    <div className={`flex justify-between px-1 py-[14px] text-[15px] ${top ? "border-t border-ink/[.07]" : ""}`}>
      <span className="text-muted">{label}</span>
      <span className={display ? "tnum font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
