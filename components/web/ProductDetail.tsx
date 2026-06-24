"use client";

import { useState } from "react";
import { WebCard } from "./WebCard";
import { QrCode } from "@/components/ui/QrCode";
import { MetalCta } from "@/components/ui/MetalCta";
import { useToast } from "@/components/ui/Toast";
import { product } from "@/lib/mock";
import { formatRp, formatUsd } from "@/lib/format";

export function ProductDetail({ slug }: { slug: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const name = product.name;

  const payUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/pay/${slug}`
      : `lunas.me/p/${slug}`;
  const shortUrl = `lunas.me/p/${slug}`;

  function copy() {
    navigator.clipboard?.writeText(payUrl).catch(() => {});
    setCopied(true);
    toast("Link copied", "success");
    setTimeout(() => setCopied(false), 1600);
  }
  function whatsapp() {
    const text = encodeURIComponent(`Pay for ${name}: ${payUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <WebCard>
      <div className="mb-5 font-display text-lg font-bold">{name}</div>
      <div className="flex flex-col items-center">
        <div className="tnum font-display text-[56px] font-extrabold leading-none tracking-[-.04em]">
          {formatUsd(product.priceUSD)}
        </div>
        <div className="mb-6 mt-1.5 text-sm text-muted">
          {formatRp(product.priceUSD)}
        </div>
        <div className="rounded-[18px] border border-ink/[.06] bg-white p-3.5 shadow-[0_8px_22px_rgba(21,22,27,.06)]">
          <QrCode value={payUrl} size={172} />
        </div>

        <div className="mt-[22px] flex w-full items-center gap-2 rounded-[14px] border border-ink/[.06] bg-paper py-2.5 pl-4 pr-2.5">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink">
            {shortUrl}
          </span>
          <button
            onClick={copy}
            className="rounded-[11px] border border-ink/[.06] bg-white px-3.5 py-1.5 font-display text-sm font-semibold text-primary"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-3.5 text-[13px] text-muted">3 paid so far</div>

        <div className="mt-[22px] flex w-full gap-2.5">
          <MetalCta className="block flex-1">
            <button
              onClick={whatsapp}
              className="liquid-surface w-full overflow-hidden rounded-[14px] py-3.5 font-display text-[15px] font-semibold text-white"
            >
              Share on WhatsApp
            </button>
          </MetalCta>
          <button
            onClick={copy}
            className="liquid-glass !border-primary/40 flex-1 rounded-[14px] py-[13px] font-display text-[15px] font-semibold text-primary"
          >
            Copy link
          </button>
        </div>
      </div>
    </WebCard>
  );
}
