"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WebCard } from "./WebCard";
import { QrCode } from "@/components/ui/QrCode";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/components/ui/Toast";
import { formatRp, formatUsd } from "@/lib/format";
import { useLang } from "@/lib/i18n";

interface OrderInfo {
  product_title: string;
  amount_stroops: number;
  product_id: string | null;
  product_type: 'one_time' | 'permanent';
}

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${slug}`)
      .then((r) => r.json())
      .then(({ order: o }) => { if (o) setOrder(o); })
      .catch(() => {});
  }, [slug]);

  const name = order?.product_title ?? t("checkout.productFallback");
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
    toast(t("common.linkCopied"), "success");
    setTimeout(() => setCopied(false), 1600);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Pay for ${name}`, url: payUrl });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <WebCard>
      <div className="mb-5">
        <BackButton onClick={() => router.back()} />
      </div>

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
        <p className="mt-3 text-[13px] text-faint">{t("product.scanToPay")}</p>

        {/* URL bar */}
        <div className="mt-5 flex w-full items-center gap-2 rounded-[14px] border border-ink/[.06] bg-paper py-2.5 pl-4 pr-2.5">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink">{shortUrl}</span>
          <button
            onClick={copy}
            className="rounded-[10px] border border-ink/[.06] bg-white px-3.5 py-1.5 font-display text-sm font-semibold text-primary hover:bg-ink/[.02]"
          >
            {copied ? t("checkout.shareCopied") : t("checkout.shareCopy")}
          </button>
        </div>

        {/* Share */}
        <button
          onClick={share}
          className="liquid-glass mt-4 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] font-display text-[15px] font-semibold text-ink"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {t("checkout.shareNative")}
        </button>

        {/* Download QR */}
        <button
          onClick={downloadQr}
          className="liquid-surface mt-2.5 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] font-display text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M7 11l5 5 5-5M3 21h18" />
          </svg>
          {t("product.downloadQr")}
        </button>
      </div>
    </WebCard>
  );
}
