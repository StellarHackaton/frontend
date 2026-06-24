"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import type { MetalFxPreset, MetalFxTheme, MetalFxVariant } from "metal-fx";

// WebGL effect — client only (canvas + matchMedia), so load without SSR.
const MetalFx = dynamic(() => import("metal-fx").then((m) => m.MetalFx), {
  ssr: false,
});

export function MetalCta({
  children,
  preset = "chromatic",
  strength = 1,
  // Ring + reflections only fully render in dark mode → pin dark.
  theme = "dark",
  variant = "button",
  // Default ring is 1px → barely visible. Thicken it and scale the whole
  // engine (ring + glow + pattern) up so the liquid metal actually reads.
  ringCssPx = 1.5,
  scale = 1,
  className = "",
}: {
  children: ReactNode;
  preset?: MetalFxPreset;
  strength?: number;
  theme?: MetalFxTheme;
  variant?: MetalFxVariant;
  ringCssPx?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <MetalFx
      preset={preset}
      strength={strength}
      theme={theme}
      variant={variant}
      ringCssPx={ringCssPx}
      scale={scale}
      className={className}
    >
      {children}
    </MetalFx>
  );
}
