"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, useEffect, useState } from "react";
import type { MetalFxPreset, MetalFxTheme, MetalFxVariant } from "metal-fx";

// WebGL effect — client only (canvas + matchMedia), so load without SSR.
const MetalFx = dynamic(() => import("metal-fx").then((m) => m.MetalFx), {
  ssr: false,
});

// metal-fx throws "WebGL not supported" on GPUs/browsers without WebGL.
// Catch it so the page survives — the liquid-surface fill still renders,
// just without the metal ring on top.
class MetalBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function webglOk() {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

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
  // Probe WebGL after mount (SSR-safe). Until then / if absent, render plain.
  const [hasWebgl, setHasWebgl] = useState(false);
  useEffect(() => {
    setHasWebgl(webglOk());
  }, []);

  const fallback = <div className={className}>{children}</div>;
  if (!hasWebgl) return fallback;

  return (
    <MetalBoundary fallback={fallback}>
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
    </MetalBoundary>
  );
}
