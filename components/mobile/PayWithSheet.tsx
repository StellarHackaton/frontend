"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Balance } from "@/lib/mock";

interface Props {
  open: boolean;
  balances: Balance[];
  selectedKey: string;
  onClose: () => void;
  onSelect: (b: Balance) => void;
}

// Mobile bottom sheet (Liquid Glass). Anchored to the viewport bottom.
export function PayWithSheet({
  open,
  balances,
  selectedKey,
  onClose,
  onSelect,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-30">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.32, 1.4, 0.4, 1] }}
            className="glass-sheet absolute inset-x-0 bottom-0 rounded-t-[30px] px-5 pb-8 pt-3"
          >
            <div className="mx-auto mb-4 h-1 w-[38px] rounded-full bg-ink/[.16]" />
            <div className="font-display text-[22px] font-bold tracking-[-.01em]">
              Pay with
            </div>
            <div className="mb-[18px] mt-1 text-sm text-muted">
              Choose the balance you want to use
            </div>
            <div className="flex flex-col gap-2.5">
              {balances.map((b) => {
                const selected = b.key === selectedKey;
                return (
                  <button
                    key={b.key}
                    onClick={() => onSelect(b)}
                    disabled={!b.enabled}
                    className={`flex items-center justify-between rounded-[18px] border bg-white/60 p-3 text-left transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] active:scale-[.98] ${
                      b.enabled
                        ? selected
                          ? "border-primary"
                          : "border-white/65"
                        : "cursor-not-allowed border-danger/40 opacity-90"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] bg-[#F1EFEA] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
                        {b.emoji}
                      </div>
                      <div>
                        <div className="font-display text-base font-semibold">
                          {b.name}
                        </div>
                        {b.helper && (
                          <div className="mt-0.5 text-xs text-danger">
                            {b.helper}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tnum text-[15px] text-muted">
                        {b.approx}
                      </span>
                      {selected && <CheckCircle />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CheckCircle() {
  return (
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
  );
}
