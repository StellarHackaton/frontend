import { ReactNode } from "react";

export type EdgeState = "nobalance" | "expired" | "paid";

export interface EdgeConfig {
  icon: ReactNode;
  title: string;
  body: string;
  primary?: string; // primary action label (null = none)
  tone: "neutral" | "success";
}

const card = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="13" rx="3.5" stroke="#9b9aa1" strokeWidth="1.8" />
    <path d="M3 10h18" stroke="#9b9aa1" strokeWidth="1.8" />
  </svg>
);

const clock = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#9b9aa1" strokeWidth="1.8" />
    <path d="M12 7.5V12l3 2" stroke="#9b9aa1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const check = (
  <svg width="34" height="34" viewBox="0 0 52 52" fill="none">
    <path d="M15 27l7 7 15-17" stroke="#1F9D78" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EDGE: Record<EdgeState, EdgeConfig> = {
  nobalance: {
    icon: card,
    title: "This balance can't be used yet",
    body: "Top up a supported balance, then try again.",
    primary: "Top up",
    tone: "neutral",
  },
  expired: {
    icon: clock,
    title: "This link has expired",
    body: "Ask the seller for a fresh payment link.",
    tone: "neutral",
  },
  paid: {
    icon: check,
    title: "Already paid",
    body: "This order is settled. Nothing more to do.",
    tone: "success",
  },
};
