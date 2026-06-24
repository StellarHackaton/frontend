"use client";

import { motion, useReducedMotion } from "framer-motion";

// Re-mounts on every navigation → gives each route a smooth fade-in.
// Opacity-only so position:fixed children (sheets, tab bar) stay anchored.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
