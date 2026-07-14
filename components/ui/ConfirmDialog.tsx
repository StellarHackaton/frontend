"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEscClose } from "@/lib/useEscClose";
import { useLang } from "@/lib/i18n";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Centered confirm/alert dialog — liquid glass, Esc + backdrop dismissible.
export function ConfirmDialog({ open, title, body, confirmLabel, danger, onConfirm, onClose }: Props) {
  const { t } = useLang();
  useEscClose(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 flex items-center justify-center px-5 bg-black/30 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] rounded-[24px] bg-paper p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,.22)]"
            >
              <h2 className="mb-1.5 font-display text-[18px] font-bold">{title}</h2>
              <p className="mb-6 text-[14px] leading-relaxed text-muted">{body}</p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-[14px] border border-ink/15 py-3 font-display text-[14px] font-semibold text-muted active:bg-ink/[.04]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 rounded-[14px] py-3 font-display text-[14px] font-semibold text-white ${
                    danger ? "bg-red-500 active:bg-red-600" : "bg-primary active:bg-primary/90"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
