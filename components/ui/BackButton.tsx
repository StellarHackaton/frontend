"use client";

import { motion } from "framer-motion";

// Liquid-glass back button — visible frosted circle, used in every page header.
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Back"
      whileTap={{ scale: 0.9 }}
      className="liquid-glass flex h-10 w-10 flex-none items-center justify-center rounded-full !border-ink/[.08] !bg-white/90 text-ink shadow-[0_8px_22px_rgba(21,22,27,.16)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="#15161B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}
