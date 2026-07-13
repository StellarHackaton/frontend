"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckoutOption } from "@/lib/useCheckout";
import { useEscClose } from "@/lib/useEscClose";
import { PaymentIcon } from "@/components/ui/PaymentIcon";

interface Props {
  open: boolean;
  options: CheckoutOption[];
  selectedKey: string;
  onClose: () => void;
  onSelect: (o: CheckoutOption) => void;
}

export function PayWithSheet({ open, options, selectedKey, onClose, onSelect }: Props) {
  useEscClose(open, onClose);
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
            <div className="font-display text-[22px] font-bold tracking-[-.01em]">Pay with</div>
            <div className="mb-[18px] mt-1 text-sm text-muted">Choose the balance you want to use</div>
            <div className="flex flex-col gap-2.5">
              {options.map((o) => {
                const selected = o.key === selectedKey;
                return (
                  <button
                    key={o.key}
                    onClick={() => onSelect(o)}
                    disabled={!o.enabled}
                    className={`flex items-center justify-between rounded-[18px] border bg-white/60 p-3 text-left shadow-[0_2px_0_rgba(0,0,0,.06),0_4px_16px_rgba(0,0,0,.07)] transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] active:scale-[.98] active:shadow-[0_1px_0_rgba(0,0,0,.06),0_2px_8px_rgba(0,0,0,.06)] ${
                      o.enabled
                        ? selected ? "border-primary" : "border-white/65"
                        : "cursor-not-allowed border-danger/40 opacity-90"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-none overflow-hidden rounded-[13px] shadow-[0_2px_8px_rgba(0,0,0,.15)]">
                        <PaymentIcon code={o.assetCode} size={42} radius={13} />
                      </div>
                      <div>
                        <div className="font-display text-base font-semibold">{o.label}</div>
                        {o.helper && <div className="mt-0.5 text-xs text-danger">{o.helper}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tnum text-[15px] text-muted">{o.approx}</span>
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
      <path d="M7 12.5l3.2 3.2L17 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
