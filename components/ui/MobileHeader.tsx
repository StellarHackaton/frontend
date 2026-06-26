"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Clean inner-page header: large section title, optional right slot.
// Brand wordmark lives on Home/landing/login — inner tabs show the section.
export function MobileHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-[60px] flex-none items-center justify-between px-6">
      <motion.h1
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="font-display text-[26px] font-extrabold tracking-[-.03em]"
      >
        {title}
      </motion.h1>
      {right}
    </div>
  );
}
