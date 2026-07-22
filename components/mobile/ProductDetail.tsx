"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "./MobileShell";
import { BackButton } from "@/components/ui/BackButton";
import { QrCode } from "@/components/ui/QrCode";
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
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center gap-2.5 px-[18px]">
        <BackButton onClick={() => router.push("/products")} />
        <span className="font-display text-lg font-bold">{name}</span>
      </div>

      <div className="flex flex-1 flex-col items-center px-[22px] pb-4 pt-0.5">
        <div className="relative mt-1 flex w-full flex-col items-center overflow-hidden rounded-[32px] bg-white px-6 pb-6 pt-[26px] shadow-[0_22px_50px_rgba(21,22,27,.14),inset_0_1px_0_rgba(255,255,255,1)]">
          <div
            className="pointer-events-none absolute -left-[30px] -top-[60px] h-[200px] w-[200px] rounded-full"
            style={{ background: "radial-gradient(closest-side,rgba(255,221,186,.4),rgba(255,221,186,0))" }}
          />
          <span className="relative self-start font-display text-base font-bold tracking-[-.02em] text-primary">lunas</span>
          {priceUSD > 0 ? (
            <>
              <div className="tnum relative mb-1 mt-3.5 font-display text-[44px] font-extrabold leading-none tracking-[-.04em]">
                {formatUsd(priceUSD)}
              </div>
              <div className="relative mb-[18px] text-[13px] text-muted">{formatRp(priceUSD)}</div>
            </>
          ) : (
            <div className="relative mb-[18px] mt-4 h-12 w-32 animate-pulse rounded-xl bg-ink/[.06]" />
          )}
          <div data-qr-svg className="relative rounded-[18px] bg-white p-2">
            <QrCode value={payUrl} size={168} />
          </div>
          <div className="relative mt-3.5 text-[13px] tracking-[.02em] text-faint">
            {t("product.scanToPay")}
          </div>
        </div>

        {/* URL bar */}
        <div className="mt-[18px] flex w-full items-center gap-2 rounded-[16px] border border-white/65 bg-white/55 py-2.5 pl-4 pr-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-[16px]">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink">{shortUrl}</span>
          <button
            onClick={copy}
            className="rounded-[11px] bg-white px-3 py-1.5 font-display text-sm font-semibold text-primary shadow-[0_2px_6px_rgba(21,22,27,.08)] transition-transform duration-300 active:scale-[.94]"
          >
            {copied ? t("checkout.shareCopied") : t("checkout.shareCopy")}
          </button>
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2.5 px-[22px] pb-8 pt-2">
        {/* Share */}
        <button
          onClick={share}
          className="liquid-glass flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[20px] font-display text-[16px] font-semibold text-ink transition-transform active:scale-[.97]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {t("checkout.shareNative")}
        </button>

        {/* Download QR */}
        <button
          onClick={downloadQr}
          className="liquid-surface flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[20px] font-display text-[16px] font-semibold text-white transition-transform active:scale-[.97]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M7 11l5 5 5-5M3 21h18" />
          </svg>
          {t("product.downloadQr")}
        </button>
      </div>
    </MobileShell>
  );
}
