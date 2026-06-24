"use client";

import Link from "next/link";
import { ReactNode } from "react";
import type { MetalFxPreset } from "metal-fx";
import { MetalCta } from "./MetalCta";

const inner =
  "liquid-surface relative block overflow-hidden rounded-btn text-center font-display font-semibold text-white";

// Web/landing primary action — identical liquid-glass pill + metal ring as the
// mobile <Button>, so the look is consistent everywhere.
export function MetalButton({
  children,
  onClick,
  disabled,
  preset = "chromatic",
  full = true,
  size = "lg",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  preset?: MetalFxPreset;
  full?: boolean;
  size?: "lg" | "sm";
  className?: string;
}) {
  const pad = size === "lg" ? "py-4 text-[17px]" : "px-5 py-2.5 text-[15px]";
  return (
    <MetalCta preset={preset} className={full ? "block w-full" : "inline-block"}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${inner} ${full ? "w-full" : ""} ${pad} ${className}`}
      >
        {children}
      </button>
    </MetalCta>
  );
}

export function MetalLink({
  children,
  href,
  preset = "chromatic",
  full = false,
  className = "px-7 py-4 text-base",
}: {
  children: ReactNode;
  href: string;
  preset?: MetalFxPreset;
  full?: boolean;
  className?: string;
}) {
  return (
    <MetalCta preset={preset} className={full ? "block w-full" : "inline-block"}>
      <Link href={href} className={`${inner} ${full ? "w-full" : ""} ${className}`}>
        {children}
      </Link>
    </MetalCta>
  );
}
