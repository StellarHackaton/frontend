"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentIcon } from "./PaymentIcon";
import { formatRp } from "@/lib/format";

type Stage = "scan" | "pay" | "processing" | "check" | "title" | "receipt";

const TIMINGS: [Stage, number][] = [
  ["scan",       0],
  ["pay",     2400],
  ["processing", 4100],
  ["check",   5000],
  ["title",   5600],
  ["receipt", 6200],
];
const RESET = 9300;

export function PhoneHero() {
  const [stage, setStage] = useState<Stage>("scan");
  const [cycle, setCycle] = useState(0);
  const [btnPressed, setBtnPressed] = useState(false);

  useEffect(() => {
    const timers = TIMINGS.slice(1).map(([s, ms]) =>
      setTimeout(() => setStage(s), ms)
    );
    // button press animation: 500ms before processing
    const pressOn  = setTimeout(() => setBtnPressed(true),  3500);
    const pressOff = setTimeout(() => setBtnPressed(false), 4100);
    const reset = setTimeout(() => { setStage("scan"); setCycle((c) => c + 1); }, RESET);
    return () => { timers.forEach(clearTimeout); clearTimeout(pressOn); clearTimeout(pressOff); clearTimeout(reset); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  const isDark = stage === "scan" || stage === "processing" || stage === "check" || stage === "title" || stage === "receipt";

  return (
    <div className="relative flex justify-center select-none">
      {/* phone shell */}
      <div className="relative overflow-hidden" style={{
        width: 270, height: 545,
        borderRadius: 48,
        background: "linear-gradient(160deg,#2e2e32 0%,#1a1a1c 100%)",
        boxShadow: "0 40px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.13), inset 0 -1px 0 rgba(0,0,0,.5)",
        padding: "10px 10px 14px",
      }}>
        {/* side buttons */}
        <div className="absolute -left-[3px] top-[94px]  h-7  w-[3px] rounded-l-full bg-[#38383c]" />
        <div className="absolute -left-[3px] top-[134px] h-10 w-[3px] rounded-l-full bg-[#38383c]" />
        <div className="absolute -left-[3px] top-[182px] h-10 w-[3px] rounded-l-full bg-[#38383c]" />
        <div className="absolute -right-[3px] top-[142px] h-12 w-[3px] rounded-r-full bg-[#38383c]" />

        {/* screen */}
        <motion.div
          animate={{ backgroundColor: isDark ? "#0c0d12" : "#f5f4f0" }}
          transition={{ duration: 0.4 }}
          className="relative flex h-full flex-col overflow-hidden"
          style={{ borderRadius: 40 }}
        >
          {/* status bar */}
          <StatusBar dark={isDark} />

          {/* screen body */}
          <div className="relative flex flex-1 flex-col overflow-hidden">

            {/* ── STAGE: SCAN ── */}
            <AnimatePresence>
              {stage === "scan" && (
                <motion.div key={`scan-${cycle}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="flex flex-1 flex-col items-center justify-center gap-5 px-5">
                  {/* viewfinder */}
                  <div className="relative flex h-[180px] w-[180px] items-center justify-center">
                    {/* corner brackets */}
                    {[["top-0 left-0","border-t-2 border-l-2"],
                      ["top-0 right-0","border-t-2 border-r-2"],
                      ["bottom-0 left-0","border-b-2 border-l-2"],
                      ["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos, brd]) => (
                      <div key={pos} className={`absolute ${pos} h-8 w-8 border-success rounded-[4px] ${brd}`} />
                    ))}
                    {/* qr code */}
                    <QrSvg />
                    {/* scan line */}
                    <motion.div
                      initial={{ top: "10%" }} animate={{ top: "88%" }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                      className="absolute left-[5%] right-[5%] h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg,transparent,rgba(31,157,120,.9),transparent)" }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-display text-[14px] font-semibold text-white/80">Arahkan ke kode QR</div>
                    <div className="mt-1 text-[11px] text-white/35">Lunas · pembayaran digital</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STAGE: PAY ── */}
            <AnimatePresence>
              {stage === "pay" && (
                <motion.div key={`pay-${cycle}`}
                  initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="absolute inset-0 flex flex-col px-4 pt-3 pb-4">
                  {/* product header */}
                  <div className="flex items-center gap-2.5 rounded-[14px] bg-white/70 px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,.06)]">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-primary/10 font-display text-base font-bold text-primary">S</div>
                    <div>
                      <div className="font-display text-[13px] font-semibold text-ink">Sunset print A3</div>
                      <div className="flex items-center gap-1 text-[10px] text-muted">
                        Studio Mawar
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-white">✓</span>
                      </div>
                    </div>
                  </div>

                  {/* amount */}
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <div className="text-[11px] uppercase tracking-[.1em] text-ink/40">Total</div>
                    <div className="tnum mt-1 font-display text-[42px] font-extrabold leading-none tracking-[-.04em] text-ink">
                      {formatRp(5)}
                    </div>
                    <div className="mt-1 text-[11px] text-muted">$5.00 USDC</div>
                  </div>

                  {/* payment method */}
                  <div className="mb-3 rounded-[14px] border border-ink/[.08] bg-white/80 p-3">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.06em] text-muted">Bayar dengan</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="overflow-hidden rounded-[8px]"><PaymentIcon code="EURC" size={28} radius={8} /></div>
                        <span className="font-display text-[13px] font-semibold text-ink">Euro</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="tnum text-[11px] text-muted">≈ 4.62 EURC</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" fill="#2F2A6B" />
                          <path d="M7 12.5l2.8 2.8L17 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* pay button */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: 1, y: 0,
                      scale: btnPressed ? 0.96 : 1,
                      backgroundColor: btnPressed ? "#1e1a4a" : "#2F2A6B",
                      boxShadow: btnPressed
                        ? "0 2px 6px rgba(47,42,107,.2)"
                        : "0 8px 20px rgba(47,42,107,.35)",
                    }}
                    transition={{ delay: btnPressed ? 0 : 0.3, duration: 0.15 }}
                    className="flex items-center justify-center gap-2 rounded-[16px] py-3.5">
                    <span className="font-display text-[14px] font-semibold text-white">Bayar sekarang</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STAGE: PROCESSING / CHECK / TITLE / RECEIPT ── */}
            <AnimatePresence>
              {(stage === "processing" || stage === "check" || stage === "title" || stage === "receipt") && (
                <motion.div key={`success-${cycle}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col">

                  {/* ambient */}
                  <AnimatePresence>
                    {stage !== "processing" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 38%, rgba(31,157,120,.28), transparent)" }} />
                    )}
                  </AnimatePresence>

                  {/* icon area */}
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <div className="relative flex h-[76px] w-[76px] items-center justify-center">
                      {/* spinner */}
                      <AnimatePresence>
                        {stage === "processing" && (
                          <motion.div key="sp" exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                            className="absolute h-[68px] w-[68px]">
                            <svg className="animate-spin" viewBox="0 0 56 56" fill="none">
                              <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
                              <path d="M28 4 a24 24 0 0 1 24 24" stroke="#1F9D78" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success/70" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* checkmark */}
                      <AnimatePresence>
                        {(stage === "check" || stage === "title" || stage === "receipt") && (
                          <motion.div key="ck"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 480, damping: 22 }}
                            className="relative flex h-[68px] w-[68px] items-center justify-center">
                            {[0, 1].map((i) => (
                              <motion.div key={i}
                                initial={{ scale: 1, opacity: 0.4 }}
                                animate={{ scale: 2.4 + i * 0.6, opacity: 0 }}
                                transition={{ duration: 1 + i * 0.2, ease: "easeOut", delay: i * 0.12 }}
                                className="absolute h-[68px] w-[68px] rounded-full bg-success" />
                            ))}
                            <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-success shadow-[0_0_40px_rgba(31,157,120,.6),inset_0_2px_6px_rgba(255,255,255,.3)]">
                              <div className="absolute left-3 top-2.5 h-3 w-5 rounded-full bg-white/30 blur-[3px]" />
                              <svg width="30" height="30" viewBox="0 0 52 52" fill="none">
                                <path d="M14 26l8 8 16-18" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ strokeDasharray: 52, strokeDashoffset: 52, animation: "lunasDraw .4s .08s ease forwards" }} />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* title */}
                    <AnimatePresence>
                      {(stage === "title" || stage === "receipt") && (
                        <motion.div key={`ttl-${cycle}`}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 22 }}
                          className="mt-4 text-center">
                          <div className="font-display text-[32px] font-extrabold leading-none tracking-[-.03em] text-white">
                            Lunas <span className="text-success">✓</span>
                          </div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="mt-1.5 text-[11px] text-white/40">
                            Paid with Euro · received $5
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* processing label */}
                    <AnimatePresence>
                      {stage === "processing" && (
                        <motion.p exit={{ opacity: 0 }}
                          className="absolute bottom-16 text-[10px] font-medium uppercase tracking-[.06em] text-white/25">
                          Verifying…
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* receipt */}
                  <AnimatePresence>
                    {stage === "receipt" && (
                      <motion.div key={`rc-${cycle}`}
                        initial={{ y: "100%" }} animate={{ y: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        className="flex-none rounded-t-[24px] bg-paper px-4 pb-4 pt-3.5 shadow-[0_-8px_24px_rgba(0,0,0,.4)]">
                        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-ink/15" />
                        <div className="overflow-hidden rounded-[14px] border border-ink/[.07]">
                          <PhoneRow label="Item"   value="Sunset print A3" />
                          <PhoneRow label="Seller" value="Studio Mawar" top />
                          <PhoneRow label="Total"  value={formatRp(5)} display top />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes lunasDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  const c = dark ? "rgba(255,255,255,.55)" : "rgba(21,22,27,.6)";
  return (
    <div className="flex flex-none items-center justify-between px-5 pt-3 pb-1.5">
      <span style={{ color: c }} className="text-[11px] font-semibold">9:41</span>
      <div className="h-[22px] w-[84px] rounded-full bg-black" />
      <div className="flex items-center gap-1">
        <svg width="13" height="9" viewBox="0 0 13 9" fill={c}>
          <rect x="0"  y="3.5" width="2" height="5.5" rx="0.5" />
          <rect x="3"  y="2"   width="2" height="7"   rx="0.5" />
          <rect x="6"  y="0.5" width="2" height="8.5" rx="0.5" />
          <rect x="9"  y="0"   width="2" height="9"   rx="0.5" />
        </svg>
        <svg width="22" height="10" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={c} />
          <rect x="2" y="2" width="15" height="8" rx="2" fill={c} />
          <path d="M23 4v4a2 2 0 0 0 0-4Z" fill={c} opacity={0.5} />
        </svg>
      </div>
    </div>
  );
}

function QrSvg() {
  const B = "#fff"; // block color
  const s = 6;     // cell size px
  // encode a simplified 21×21 QR-like grid
  const rows = [
    "1111111011010111111",
    "1000001000100000001",
    "1011101011101011101",
    "1011101000001011101",
    "1011101010001011101",
    "1000001001100000001",
    "1111111010101111111",
    "0000000001100000000",
    "0110101101011010101",
    "0001010010100101011",
    "1010001011001110001",
    "0101100100110010110",
    "0010011010101010011",
    "0000000010101010100",
    "1111111011010110001",
    "1000001001001010010",
    "1011101001101001001",
    "1011101010010100110",
    "1011101011001011011",
    "1000001000110001001",
    "1111111010101011011",
  ];
  const w = rows[0].length * s;
  const h = rows.length * s;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.9 }}>
      <rect width={w} height={h} fill="rgba(0,0,0,.55)" rx="4" />
      {rows.map((row, y) =>
        row.split("").map((cell, x) =>
          cell === "1" ? (
            <rect key={`${x}-${y}`} x={x * s + 0.5} y={y * s + 0.5} width={s - 1} height={s - 1} rx="0.5" fill={B} />
          ) : null
        )
      )}
    </svg>
  );
}

function PhoneRow({ label, value, top, display }: { label: string; value: string; top?: boolean; display?: boolean }) {
  return (
    <div className={`flex justify-between px-3.5 py-2.5 text-[12px] ${top ? "border-t border-ink/[.07]" : ""}`}>
      <span className="text-muted">{label}</span>
      <span className={display ? "tnum font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
