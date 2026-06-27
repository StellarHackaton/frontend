"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { QrCode } from "@/components/ui/QrCode";
import { useToast } from "@/components/ui/Toast";
import { product } from "@/lib/mock";
import { formatRp, formatUsd } from "@/lib/format";

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
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
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center gap-2.5 px-[18px]">
        <BackButton onClick={() => router.push("/dashboard")} />
        <span className="font-display text-lg font-bold">{name}</span>
      </div>

      <div className="flex flex-1 flex-col items-center px-[22px] pb-4 pt-0.5">
        <div className="relative mt-1 flex w-full flex-col items-center overflow-hidden rounded-[32px] bg-white px-6 pb-6 pt-[26px] shadow-[0_22px_50px_rgba(21,22,27,.14),inset_0_1px_0_rgba(255,255,255,1)]">
          <div
            className="pointer-events-none absolute -left-[30px] -top-[60px] h-[200px] w-[200px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side,rgba(255,221,186,.4),rgba(255,221,186,0))",
            }}
          />
          <span className="relative self-start font-display text-base font-bold tracking-[-.02em] text-primary">
            lunas
          </span>
          <div className="tnum relative mb-1 mt-3.5 font-display text-[44px] font-extrabold leading-none tracking-[-.04em]">
            {formatUsd(product.priceUSD)}
          </div>
          <div className="relative mb-[18px] text-[13px] text-muted">
            {formatRp(product.priceUSD)}
          </div>
          <div className="relative rounded-[18px] bg-white p-2">
            <QrCode value={payUrl} size={168} />
          </div>
          <div className="relative mt-3.5 text-[13px] tracking-[.02em] text-faint">
            Scan to pay with any balance
          </div>
        </div>

        <div className="mt-[18px] flex w-full items-center gap-2 rounded-[16px] border border-white/65 bg-white/55 py-2.5 pl-4 pr-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-[16px]">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink">
            {shortUrl}
          </span>
          <button
            onClick={copy}
            className="rounded-[11px] bg-white px-3 py-1.5 font-display text-sm font-semibold text-primary shadow-[0_2px_6px_rgba(21,22,27,.08)] transition-transform duration-300 active:scale-[.94]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-3.5 text-[13px] text-muted">3 paid so far</div>
      </div>

      <div className="flex flex-none flex-col gap-2.5 px-[22px] pb-8 pt-3.5">
        <Button onClick={whatsapp} className="gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative">
            <path
              d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5Z"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Share on WhatsApp
        </Button>
        <Button variant="glass" onClick={copy} className="h-[54px] rounded-[20px]">
          Copy link
        </Button>
      </div>
    </MobileShell>
  );
}
