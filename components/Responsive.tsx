"use client";

import { ReactNode, useLayoutEffect, useState } from "react";

type Viewport = "mobile" | "web";

const QUERY = "(min-width: 1024px)"; // Tailwind `lg`

/**
 * Mounts only the tree matching the current viewport.
 *
 * The mobile and web components each run their own data fetching, motion/
 * animation loops, and (on some screens) WebGL contexts — mounting both
 * permanently and just CSS-hiding the inactive one (the old approach) meant
 * every screen was doing double the network calls, double the animation
 * work, and double the GPU load at all times, which is exactly what makes
 * a page feel heavy on a phone even though only one tree was ever visible.
 *
 * Defaults to "mobile" so SSR/first paint always matches on mobile (our
 * primary surface — the PWA opens straight into it) with zero flash and
 * zero wasted mount. Desktop corrects synchronously via useLayoutEffect
 * before the browser paints, so there's no visible flash there either —
 * worst case is one throwaway mobile-tree mount+unmount on desktop's first
 * load, versus the previous permanent 2x cost on every device.
 */
export function Responsive({
  mobile,
  web,
}: {
  mobile: ReactNode;
  web: ReactNode;
}) {
  const [viewport, setViewport] = useState<Viewport>("mobile");

  useLayoutEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setViewport(mq.matches ? "web" : "mobile");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return viewport === "mobile" ? mobile : web;
}
