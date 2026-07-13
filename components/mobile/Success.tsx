"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

type Stage = "loading" | "check" | "title" | "receipt";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

function downloadReceiptImage(
  item: string,
  seller: string,
  priceUSD: number,
  payingWith: string,
  txHash: string | null,
) {
  const W = 640;
  const rows = [
    { label: "Item", value: item },
    seller ? { label: "Seller", value: seller } : null,
    { label: "Amount", value: `$${priceUSD.toFixed(2)}` },
    { label: "Paid with", value: payingWith },
    { label: "Date", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
    txHash ? { label: "Proof", value: txHash.slice(0, 20) + "…" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const ROW_H = 56;
  const H = 200 + rows.length * ROW_H + 80;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background
  ctx.fillStyle = "#FBFAF7";
  ctx.fillRect(0, 0, W, H);

  // green header
  ctx.fillStyle = "#1F9D78";
  ctx.fillRect(0, 0, W, 160);

  // check circle outer glow
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.arc(W / 2, 74, 46, 0, Math.PI * 2);
  ctx.fill();

  // check circle
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(W / 2, 74, 36, 0, Math.PI * 2);
  ctx.fill();

  // checkmark
  ctx.strokeStyle = "#1F9D78";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 14, 74);
  ctx.lineTo(W / 2 - 1, 87);
  ctx.lineTo(W / 2 + 18, 60);
  ctx.stroke();

  // "Lunas ✓" in header
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px system-ui,-apple-system,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Lunas ✓", W / 2, 140);

  // zigzag receipt edge
  ctx.fillStyle = "#FBFAF7";
  ctx.beginPath();
  ctx.moveTo(0, 160);
  const zw = 18;
  for (let x = 0; x <= W + zw; x += zw) {
    ctx.lineTo(x + zw / 2, 172);
    ctx.lineTo(x + zw, 160);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // rows
  let y = 198;
  rows.forEach((row, i) => {
    if (i > 0) {
      ctx.strokeStyle = "rgba(21,22,27,.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y - 10);
      ctx.lineTo(W - 40, y - 10);
      ctx.stroke();
    }

    ctx.font = "15px system-ui,-apple-system,sans-serif";
    ctx.fillStyle = "#6B6A73";
    ctx.textAlign = "left";
    ctx.fillText(row.label, 40, y + 8);

    const isAmount = row.label === "Amount";
    ctx.font = isAmount ? "bold 18px system-ui,-apple-system,sans-serif" : "16px system-ui,-apple-system,sans-serif";
    ctx.fillStyle = isAmount ? "#1F9D78" : "#15161B";
    ctx.textAlign = "right";
    ctx.fillText(row.value, W - 40, y + 8);

    y += ROW_H;
  });

  // footer
  ctx.font = "13px system-ui,-apple-system,sans-serif";
  ctx.fillStyle = "rgba(21,22,27,.28)";
  ctx.textAlign = "center";
  ctx.fillText("Powered by Lunas", W / 2, y + 26);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lunas-receipt-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function buildReceiptText(item: string, seller: string, priceUSD: number, payingWith: string, txHash: string | null) {
  const lines = [
    `✅ Payment confirmed — Lunas ✓`,
    ``,
    `Item    : ${item}`,
    seller ? `Seller  : ${seller}` : null,
    `Amount  : $${priceUSD.toFixed(2)}`,
    `Paid with: ${payingWith}`,
    txHash ? `Proof   : ${EXPLORER_BASE}/${txHash}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

const SHARE_OPTIONS = [
  {
    id: "native",
    label: "Share",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    bg: "bg-primary",
    color: "text-white",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.57a.75.75 0 0 0 .93.903l5.87-1.54A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.507-5.197-1.389l-.373-.219-3.863 1.015.979-3.768-.242-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
    bg: "bg-[#25D366]",
    color: "text-white",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    bg: "bg-[#229ED9]",
    color: "text-white",
  },
  {
    id: "email",
    label: "Email",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    bg: "bg-[#EA4335]",
    color: "text-white",
  },
  {
    id: "copy",
    label: "Copy",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    ),
    bg: "bg-ink/10",
    color: "text-ink",
  },
  {
    id: "download",
    label: "Download",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    bg: "bg-ink/10",
    color: "text-ink",
  },
];

export function Success({
  item,
  seller,
  priceUSD,
  payingWith,
  txHash,
  onDone,
}: {
  item: string;
  seller: string;
  priceUSD: number;
  payingWith: string;
  txHash?: string | null;
  onDone: () => void;
}) {
  const [stage, setStage] = useState<Stage>("loading");
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  function handleShare(id: string) {
    const text = buildReceiptText(item, seller, priceUSD, payingWith, txHash ?? null);

    if (id === "native" && navigator.share) {
      navigator.share({ title: "Lunas ✓ — Payment confirmed", text }).catch(() => {});
    } else if (id === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } else if (id === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(txHash ? `${EXPLORER_BASE}/${txHash}` : "")}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (id === "email") {
      window.open(`mailto:?subject=${encodeURIComponent("Payment confirmed — Lunas ✓")}&body=${encodeURIComponent(text)}`, "_blank");
    } else if (id === "copy") {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else if (id === "download") {
      downloadReceiptImage(item, seller, priceUSD, payingWith, txHash ?? null);
    }

    if (id !== "copy" && id !== "download") setShareOpen(false);
  }

  useEffect(() => {
    const t1 = setTimeout(() => setStage("check"),   900);
    const t2 = setTimeout(() => setStage("title"),   1400);
    const t3 = setTimeout(() => setStage("receipt"), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0c0d12]">
      {/* top animated area */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        {/* ambient glow */}
        <AnimatePresence>
          {stage !== "loading" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(31,157,120,.22), transparent)" }}
            />
          )}
        </AnimatePresence>

        {/* icon stage */}
        <div className="relative flex h-36 w-36 items-center justify-center">
          {/* spinner */}
          <AnimatePresence>
            {stage === "loading" && (
              <motion.div
                key="spinner"
                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
                className="absolute h-28 w-28"
              >
                <svg className="animate-spin" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
                  <path d="M28 4 a24 24 0 0 1 24 24" stroke="#1F9D78" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-success/60 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* checkmark with ripple */}
          <AnimatePresence>
            {stage !== "loading" && (
              <motion.div
                key="checkmark"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 440, damping: 22 }}
                className="relative flex h-24 w-24 items-center justify-center"
              >
                {/* ripple rings */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                    transition={{ duration: 1 + i * 0.2, ease: "easeOut", delay: i * 0.12 }}
                    className="absolute h-24 w-24 rounded-full bg-success"
                  />
                ))}
                {/* circle */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success shadow-[0_0_48px_rgba(31,157,120,.55),inset_0_2px_8px_rgba(255,255,255,.3)]">
                  <div className="absolute left-4 top-3 h-4 w-7 rounded-full bg-white/35 blur-[4px]" />
                  <svg width="46" height="46" viewBox="0 0 52 52" fill="none">
                    <path
                      d="M14 26l8 8 16-18"
                      stroke="#fff"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeDasharray: 52, strokeDashoffset: 52, animation: "lunasDraw .4s .08s ease forwards" }}
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* "Lunas ✓" */}
        <AnimatePresence>
          {(stage === "title" || stage === "receipt") && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="mt-6 text-center"
            >
              <div className="font-display text-[52px] font-extrabold leading-none tracking-[-.03em] text-white">
                Lunas <span className="text-success">✓</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2.5 text-[14px] text-white/45"
              >
                Paid with {payingWith} · received ${priceUSD.toFixed(2)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* loading label */}
        <AnimatePresence>
          {stage === "loading" && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute bottom-20 text-[13px] font-medium tracking-[.04em] text-white/30 uppercase"
            >
              Memverifikasi…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* receipt sheet slides up */}
      <AnimatePresence>
        {stage === "receipt" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="rounded-t-[32px] bg-paper px-[22px] pb-8 pt-5 shadow-[0_-12px_40px_rgba(0,0,0,.35)]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-4 overflow-hidden rounded-[20px] border border-ink/[.07]">
              <Row label="Item" value={item} />
              {seller && <Row label="Seller" value={seller} top />}
              <Row label="Total" value={`$${priceUSD.toFixed(2)}`} display top />
              <Row label="Paid with" value={payingWith} top />
              {txHash && (
                <div className="border-t border-ink/[.07] px-1 py-[14px]">
                  <a
                    href={`${EXPLORER_BASE}/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[14px]"
                  >
                    <span className="text-muted">View proof</span>
                    <span className="flex items-center gap-1 font-medium text-primary">
                      Stellar Explorer
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 7h10v10M7 17 17 7"/>
                      </svg>
                    </span>
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <Button variant="glass" className="h-[54px] rounded-[20px]" onClick={() => setShareOpen(true)}>
                Share receipt
              </Button>
              <Button onClick={onDone} className="h-[54px] rounded-[20px]">
                Done
              </Button>
            </div>

            {/* share sheet */}
            <AnimatePresence>
              {shareOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setShareOpen(false)}
                  />
                  <motion.div
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                    className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-paper px-5 pb-10 pt-5 shadow-[0_-8px_40px_rgba(0,0,0,.18)]"
                  >
                    <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
                    <p className="mb-5 text-center font-display text-[17px] font-semibold text-ink">Share receipt</p>
                    <div className="grid grid-cols-3 gap-4">
                      {SHARE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleShare(opt.id)}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className={`flex h-[54px] w-[54px] items-center justify-center rounded-[16px] ${opt.bg} ${opt.color}`}>
                            {opt.id === "copy" && copied
                              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                              : opt.icon}
                          </div>
                          <span className="text-[11px] text-muted">{opt.id === "copy" && copied ? "Copied!" : opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes lunasDraw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function Row({ label, value, top, display }: { label: string; value: string; top?: boolean; display?: boolean }) {
  return (
    <div className={`flex justify-between px-1 py-[14px] text-[15px] ${top ? "border-t border-ink/[.07]" : ""}`}>
      <span className="text-muted">{label}</span>
      <span className={display ? "tnum font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
