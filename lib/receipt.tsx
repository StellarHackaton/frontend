"use client";

import { useEffect, useState } from "react";

export const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

export function buildReceiptText(item: string, seller: string, priceUSD: number, payingWith: string, txHash: string | null) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const lines = [
    `✅ Payment confirmed — Lunas ✓`,
    ``,
    `Item      : ${item}`,
    seller ? `Seller    : ${seller}` : null,
    `Amount    : $${priceUSD.toFixed(2)}`,
    `Paid with : ${payingWith}`,
    `Date      : ${dateStr}`,
    `Time      : ${timeStr}`,
    txHash ? `TX Hash   : ${txHash}` : null,
    txHash ? `Proof     : ${EXPLORER_BASE}/${txHash}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildReceiptBlob(
  item: string,
  seller: string,
  priceUSD: number,
  payingWith: string,
  txHash: string | null,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const W = 640;
    const TX_H = txHash ? 80 : 0;
    const topRows = [
      { label: "Item", value: item },
      seller ? { label: "Seller", value: seller } : null,
      { label: "Amount", value: `$${priceUSD.toFixed(2)}` },
      { label: "Paid with", value: payingWith },
      { label: "Date", value: dateStr },
      { label: "Time", value: timeStr },
    ].filter(Boolean) as { label: string; value: string }[];

    const ROW_H = 56;
    const H = 200 + topRows.length * ROW_H + TX_H + 80;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#FBFAF7";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1F9D78";
    ctx.fillRect(0, 0, W, 160);

    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.beginPath(); ctx.arc(W / 2, 74, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(W / 2, 74, 36, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1F9D78"; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(W / 2 - 14, 74); ctx.lineTo(W / 2 - 1, 87); ctx.lineTo(W / 2 + 18, 60); ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px system-ui,-apple-system,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Lunas ✓", W / 2, 140);

    ctx.fillStyle = "#FBFAF7";
    ctx.beginPath(); ctx.moveTo(0, 160);
    const zw = 18;
    for (let x = 0; x <= W + zw; x += zw) { ctx.lineTo(x + zw / 2, 172); ctx.lineTo(x + zw, 160); }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    let y = 198;
    topRows.forEach((row, i) => {
      if (i > 0) {
        ctx.strokeStyle = "rgba(21,22,27,.07)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, y - 10); ctx.lineTo(W - 40, y - 10); ctx.stroke();
      }
      ctx.font = "15px system-ui,-apple-system,sans-serif";
      ctx.fillStyle = "#6B6A73"; ctx.textAlign = "left";
      ctx.fillText(row.label, 40, y + 8);
      const isAmount = row.label === "Amount";
      ctx.font = isAmount ? "bold 18px system-ui,-apple-system,sans-serif" : "16px system-ui,-apple-system,sans-serif";
      ctx.fillStyle = isAmount ? "#1F9D78" : "#15161B"; ctx.textAlign = "right";
      ctx.fillText(row.value, W - 40, y + 8);
      y += ROW_H;
    });

    if (txHash) {
      ctx.strokeStyle = "rgba(21,22,27,.07)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40, y - 10); ctx.lineTo(W - 40, y - 10); ctx.stroke();
      ctx.font = "15px system-ui,-apple-system,sans-serif";
      ctx.fillStyle = "#6B6A73"; ctx.textAlign = "left";
      ctx.fillText("TX Hash", 40, y + 8);
      ctx.font = "12px ui-monospace,monospace";
      ctx.fillStyle = "#15161B"; ctx.textAlign = "left";
      ctx.fillText(txHash.slice(0, 32), 40, y + 30);
      ctx.fillText(txHash.slice(32), 40, y + 48);
      y += TX_H;
    }

    ctx.font = "13px system-ui,-apple-system,sans-serif";
    ctx.fillStyle = "rgba(21,22,27,.28)"; ctx.textAlign = "center";
    ctx.fillText("Powered by Lunas · lunas-pay.vercel.app", W / 2, y + 26);

    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export const SHARE_OPTIONS = [
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

export function useReceiptShare(
  item: string,
  seller: string,
  priceUSD: number,
  payingWith: string,
  txHash: string | null | undefined,
  active: boolean,
) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [receiptBlob, setReceiptBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (active) {
      buildReceiptBlob(item, seller, priceUSD, payingWith, txHash ?? null)
        .then((blob) => setReceiptBlob(blob));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, item, seller, priceUSD, payingWith, txHash]);

  async function handleShare(id: string) {
    const text = buildReceiptText(item, seller, priceUSD, payingWith, txHash ?? null);
    const file = receiptBlob ? new File([receiptBlob], "lunas-receipt.png", { type: "image/png" }) : null;
    const canShareImage = !!file && !!navigator.canShare?.({ files: [file] });

    if (id === "native" || id === "whatsapp" || id === "telegram") {
      if (canShareImage) {
        navigator.share({ files: [file!], title: "Lunas ✓ Receipt" }).catch(() => {});
      } else if (id === "native" && navigator.share) {
        navigator.share({ title: "Lunas ✓ — Payment confirmed", text }).catch(() => {});
      } else if (id === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      } else if (id === "telegram") {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(txHash ? `${EXPLORER_BASE}/${txHash}` : "")}&text=${encodeURIComponent(text)}`, "_blank");
      }
      setShareOpen(false);
    } else if (id === "email") {
      window.open(`mailto:?subject=${encodeURIComponent("Payment confirmed — Lunas ✓")}&body=${encodeURIComponent(text)}`, "_blank");
      setShareOpen(false);
    } else if (id === "copy") {
      if (receiptBlob && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": receiptBlob })]);
        } catch {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (id === "download") {
      if (receiptBlob) {
        const url = URL.createObjectURL(receiptBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lunas-receipt-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  return { copied, shareOpen, setShareOpen, receiptBlob, handleShare };
}
