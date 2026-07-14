"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang, type Key } from "@/lib/i18n";

export interface TourStep {
  /** Matches a `data-tour="..."` attribute on the real element to spotlight. */
  target: string;
  titleKey: Key;
  bodyKey: Key;
}

interface Props {
  steps: TourStep[];
  /** localStorage key gating the auto-start — set once completed/skipped. */
  storageKey: string;
  /** Delay before auto-starting, so the screen has settled first. */
  autoStartDelay?: number;
}

const PAD = 10;
const CARD_W = 300;

// Spotlight product tour — dims the screen, cuts a highlight ring around the
// real DOM node matching `data-tour`, and walks through steps with a small
// tooltip card. Auto-starts once per `storageKey`; replayable from Settings
// by clearing that key (see ui/Settings "Show app tour" row).
export function Tour({ steps, storageKey, autoStartDelay = 700 }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey)) return;
    const timer = setTimeout(() => setOpen(true), autoStartDelay);
    return () => clearTimeout(timer);
  }, [storageKey, autoStartDelay]);

  // A parent screen can force a replay by removing the storage key then
  // dispatching this event (see Settings "Show app tour").
  useEffect(() => {
    function onReplay(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && detail !== storageKey) return;
      setI(0);
      setOpen(true);
    }
    window.addEventListener("lunas:tour-replay", onReplay);
    return () => window.removeEventListener("lunas:tour-replay", onReplay);
  }, [storageKey]);

  const measure = useCallback(() => {
    const step = steps[i];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [i, steps]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  function close() {
    localStorage.setItem(storageKey, "1");
    setOpen(false);
    setI(0);
  }
  function next() {
    if (i < steps.length - 1) setI((v) => v + 1);
    else close();
  }
  function back() {
    if (i > 0) setI((v) => v - 1);
  }

  if (!open || steps.length === 0) return null;
  const step = steps[i];

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const below = !rect || rect.top < vh * 0.55;
  const cardLeft = rect
    ? Math.max(16, Math.min(rect.left + rect.width / 2 - CARD_W / 2, vw - CARD_W - 16))
    : Math.max(16, vw / 2 - CARD_W / 2);
  const cardTop = rect ? (below ? Math.min(rect.bottom + 16, vh - 220) : undefined) : vh / 2 - 90;
  const cardBottom = rect && !below ? vh - rect.top + 16 : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="lunas-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200]"
      >
        {/* dark scrim with a spotlight cutout around the target */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute rounded-[18px]"
          style={
            rect
              ? {
                  left: rect.left - PAD,
                  top: rect.top - PAD,
                  width: rect.width + PAD * 2,
                  height: rect.height + PAD * 2,
                  boxShadow: "0 0 0 9999px rgba(8,9,13,.72)",
                }
              : { inset: 0, background: "rgba(8,9,13,.72)" }
          }
          onClick={close}
        />
        {rect && (
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="pointer-events-none absolute rounded-[18px] ring-2 ring-white/70"
            style={{
              left: rect.left - PAD,
              top: rect.top - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
            }}
          />
        )}

        {/* tooltip card */}
        <motion.div
          key={i}
          initial={{ opacity: 0, y: below ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="absolute rounded-[20px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,.35)]"
          style={{ left: cardLeft, top: cardTop, bottom: cardBottom, width: CARD_W, maxWidth: "calc(100vw - 32px)" }}
        >
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.08em] text-primary">
            {t("tour.stepOf")} {i + 1}/{steps.length}
          </div>
          <div className="mb-1.5 font-display text-[16px] font-bold text-ink">{t(step.titleKey)}</div>
          <p className="text-[13px] leading-relaxed text-muted">{t(step.bodyKey)}</p>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={close} className="text-[13px] font-semibold text-muted transition-opacity active:opacity-60">
              {t("tour.skip")}
            </button>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <button onClick={back} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink transition-opacity active:opacity-60">
                  {t("tour.back")}
                </button>
              )}
              <button
                onClick={next}
                className="rounded-full bg-primary px-4 py-1.5 font-display text-[13px] font-semibold text-white transition-opacity active:opacity-80"
              >
                {i === steps.length - 1 ? t("tour.done") : t("tour.next")}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Clear a tour's "seen" flag and re-trigger it immediately (used by Settings). */
export function replayTour(storageKey: string) {
  localStorage.removeItem(storageKey);
  window.dispatchEvent(new CustomEvent("lunas:tour-replay", { detail: storageKey }));
}
