"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WebCard } from "./WebCard";
import { QrCode } from "@/components/ui/QrCode";
import { useToast } from "@/components/ui/Toast";
import { formatRp, formatUsd } from "@/lib/format";

interface OrderInfo {
  product_title: string;
  amount_stroops: number;
  product_id: string | null;
  product_type: 'one_time' | 'permanent';
}

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${slug}`)
      .then((r) => r.json())
      .then(({ order: o }) => { if (o) setOrder(o); })
      .catch(() => {});
  }, [slug]);

  const name = order?.product_title ?? "Product";
  const priceUSD = order ? order.amount_stroops / 10_000_000 : 0;

  const isPermanent = order?.product_type === "permanent" && order?.product_id;
  const payPath = isPermanent ? `/product/${order!.product_id}` : `/pay/${slug}`;
  const payUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${payPath}`
      : `lunas.me${payPath}`;
  const shortUrl = `lunas.me${payPath}`;

  function downloadQr() {
    const svgEl = document.querySelector("[data-qr-svg] svg") as SVGSVGElement | null;
    if (!svgEl) return;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 16, 16, size - 32, size - 32);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        if (!png) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(png);
        a.download = `qr-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
        a.click();
      }, "image/png");
    };
    img.src = url;
  }

  function copy() {
    navigator.clipboard?.writeText(payUrl).catch(() => {});
    setCopied(true);
    toast("Link copied", "success");
    setTimeout(() => setCopied(false), 1600);
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Pay for ${name}: ${payUrl}`)}`, "_blank");
  }

  function telegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(payUrl)}&text=${encodeURIComponent(`Pay for ${name}`)}`, "_blank");
  }

  function email() {
    window.open(`mailto:?subject=${encodeURIComponent(`Pay for ${name}`)}&body=${encodeURIComponent(`Here's your payment link: ${payUrl}`)}`, "_blank");
  }

  return (
    <WebCard>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <div className="flex flex-col items-center">
        <div className="mb-1 self-start font-display text-[18px] font-bold">{name}</div>

        {priceUSD > 0 ? (
          <>
            <div className="tnum mt-3 font-display text-[52px] font-extrabold leading-none tracking-[-.04em]">
              {formatUsd(priceUSD)}
            </div>
            <div className="mb-5 mt-1.5 text-sm text-muted">{formatRp(priceUSD)}</div>
          </>
        ) : (
          <div className="mb-5 mt-4 h-14 w-32 animate-pulse rounded-xl bg-ink/[.06]" />
        )}

        {/* QR */}
        <div data-qr-svg className="rounded-[20px] border border-ink/[.06] bg-white p-4 shadow-[0_8px_24px_rgba(21,22,27,.07)]">
          <QrCode value={payUrl} size={180} />
        </div>
        <p className="mt-3 text-[13px] text-faint">Scan to pay with any balance</p>

        {/* URL bar */}
        <div className="mt-5 flex w-full items-center gap-2 rounded-[14px] border border-ink/[.06] bg-paper py-2.5 pl-4 pr-2.5">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink">{shortUrl}</span>
          <button
            onClick={copy}
            className="rounded-[10px] border border-ink/[.06] bg-white px-3.5 py-1.5 font-display text-sm font-semibold text-primary hover:bg-ink/[.02]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Share buttons */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2.5">
          <ShareBtn onClick={whatsapp} bg="bg-[#25D366]" label="WhatsApp">
            <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 1.9.53 3.67 1.44 5.18L2 22l4.96-1.42A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm5.07 14.13c-.22.62-1.27 1.18-1.75 1.22-.44.04-.86.2-2.9-.6-2.44-.95-4-3.43-4.12-3.59-.12-.16-.97-1.28-.97-2.44 0-1.16.6-1.73.82-1.96.22-.24.47-.3.63-.3l.45.01c.14 0 .34-.05.52.4l.67 1.65c.06.14.1.3.02.47l-.25.38-.37.4c-.13.13-.27.27-.12.53.16.26.7 1.14 1.5 1.85.97.86 1.78 1.12 2.04 1.25.26.12.41.1.57-.06l.41-.48c.17-.2.34-.15.57-.08l1.62.76c.22.1.37.16.42.25.06.1.06.55-.17 1.17Z" />
          </ShareBtn>
          <ShareBtn onClick={telegram} bg="bg-[#229ED9]" label="Telegram">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8-1.7 8.02c-.12.55-.46.68-.93.42l-2.57-1.9-1.24 1.19c-.14.14-.25.25-.52.25l.19-2.64 4.84-4.37c.21-.19-.05-.29-.32-.1L7.37 14.6l-2.51-.78c-.55-.17-.56-.55.11-.82l9.8-3.78c.46-.16.86.11.87.58Z" />
          </ShareBtn>
          <ShareBtn onClick={email} bg="bg-[#EA4335]" label="Email">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path d="m2 7 10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </ShareBtn>
        </div>

        {/* Download QR */}
        <button
          onClick={downloadQr}
          className="liquid-surface mt-2.5 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] font-display text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M7 11l5 5 5-5M3 21h18" />
          </svg>
          Download QR
        </button>
      </div>
    </WebCard>
  );
}

function ShareBtn({
  onClick,
  bg,
  label,
  children,
}: {
  onClick: () => void;
  bg: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`${bg} flex flex-col items-center justify-center gap-1.5 rounded-[14px] py-3.5 text-white transition-opacity hover:opacity-90`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24">
        {children}
      </svg>
      <span className="text-[12px] font-semibold">{label}</span>
    </button>
  );
}
