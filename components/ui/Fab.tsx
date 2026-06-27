"use client";

import { motion } from "framer-motion";

// Floating action button — liquid-glass circle, sits above the floating nav.
export function Fab({
  onClick,
  label = "New",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.15 }}
      whileTap={{ scale: 0.88 }}
      className="liquid-glass fixed bottom-[96px] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full !border-white/70 text-primary shadow-[0_14px_34px_rgba(47,42,107,.28)]"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F2A6B">
        <path d="M12 5v14M5 12h14" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
