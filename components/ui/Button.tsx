"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import type { MetalFxPreset } from "metal-fx";
import { MetalCta } from "./MetalCta";

type Variant = "primary" | "glass" | "disabled";

const base =
  "relative flex h-14 w-full items-center justify-center overflow-hidden rounded-[22px] font-display text-[17px] font-semibold transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] active:scale-[.96] disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-btnPrimary",
  glass: "liquid-glass !border-primary/40 text-primary",
  disabled:
    "cursor-not-allowed border border-ink/[.04] bg-ink/[.07] text-faint",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Color of the metal-fx ring on primary buttons. */
  metalPreset?: MetalFxPreset;
  /** Opt OUT of the liquid-glass + ring treatment (plain indigo primary). */
  plain?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", metalPreset = "chromatic", plain, className = "", children, ...props },
  ref
) {
  // Every primary button is the liquid-glass pill + metal ring, so the look is
  // identical on every screen. `plain` falls back to the flat indigo fill.
  const liquid = variant === "primary" && !plain;
  const isDisabled = variant === "disabled" || props.disabled;
  const fill = liquid
    ? "liquid-surface text-white shadow-btnPrimary"
    : variants[variant];
  const btn = (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${base} ${fill} ${className} ${!liquid && isDisabled ? "opacity-50" : ""}`}
      {...props}
    >
      <span className="relative">{children}</span>
    </button>
  );

  if (liquid) {
    return (
      <MetalCta
        preset={metalPreset}
        className={`w-full ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
      >
        {btn}
      </MetalCta>
    );
  }
  return btn;
});
