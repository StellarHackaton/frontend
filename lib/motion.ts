import type { Variants, Transition } from "framer-motion";

// Calm, confident easing — quick out, soft settle. Matches the Liquid-Glass feel.
export const EASE = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

// Whole-screen entrance.
export const screenIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
};

// Parent that staggers its children in.
export const listContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

// Child of a staggered list.
export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
};

// Press feedback for tappable surfaces.
export const tap = { scale: 0.97 } as const;
export const tapSm = { scale: 0.94 } as const;
