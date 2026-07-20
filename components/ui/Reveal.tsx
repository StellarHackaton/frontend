"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

// Scroll-triggered fade-up. Drop around any block on the (server) landing page.
// Re-triggers both ways by default — fades out on scroll-up, back in on
// scroll-down — for a section that visibly breathes with the page instead
// of a one-shot intro. Pass `once` for content that should stay put after
// its first reveal.
export function Reveal({
  children,
  delay = 0,
  className = "",
  once = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
