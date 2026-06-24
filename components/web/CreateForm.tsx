"use client";

import { WebCard } from "./WebCard";
import { MetalCta } from "@/components/ui/MetalCta";
import { useCreateForm } from "@/lib/useCreateForm";

export function CreateForm() {
  const f = useCreateForm();

  return (
    <WebCard>
      <div className="mb-7 font-display text-[24px] font-bold tracking-[-.02em]">
        New product
      </div>

      <div className="mb-2 text-[13px] font-medium text-muted">Product name</div>
      <input
        value={f.name}
        onChange={(e) => f.setName(e.target.value)}
        placeholder="Sunset print A3"
        className={`h-[52px] w-full rounded-[14px] border bg-paper px-4 text-base text-ink outline-none placeholder:text-faint focus:shadow-[0_0_0_3px_rgba(47,42,107,.14)] ${
          f.touched && f.nameErr
            ? "border-danger focus:border-danger"
            : "border-ink/[.14] focus:border-primary"
        }`}
      />
      {f.touched && f.nameErr && (
        <div className="mt-1.5 text-xs text-danger">{f.nameErr}</div>
      )}

      <div className="mb-2 mt-7 text-[13px] font-medium text-muted">Price</div>
      <div className="flex items-baseline justify-center gap-1 pb-2 pt-4">
        <span className="font-display text-[40px] font-extrabold text-faint">
          $
        </span>
        <input
          value={f.price}
          onChange={(e) => f.onPrice(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          className="tnum w-[180px] border-none bg-transparent text-left font-display text-[68px] font-extrabold tracking-[-.04em] text-ink outline-none placeholder:text-faint"
        />
      </div>
      <div
        className={`text-center text-sm ${
          f.touched && f.priceErr ? "text-danger" : "text-muted"
        }`}
      >
        {f.touched && f.priceErr ? f.priceErr : f.local}
      </div>

      <MetalCta className="mt-8 block w-full">
        <button
          onClick={f.submit}
          className={`liquid-surface w-full overflow-hidden rounded-btn py-4 font-display text-base font-semibold text-white transition-opacity ${
            f.valid ? "" : "opacity-60"
          }`}
        >
          Create payment link
        </button>
      </MetalCta>
    </WebCard>
  );
}
