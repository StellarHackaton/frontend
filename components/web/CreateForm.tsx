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
      <div className="flex items-baseline justify-center gap-1.5 pb-2 pt-4">
        <span className="font-display text-[38px] font-extrabold leading-none text-ink/35">
          $
        </span>
        <input
          value={f.price}
          onChange={(e) => f.onPrice(e.target.value)}
          inputMode="decimal"
          placeholder="0"
          style={{ width: `${Math.max(1, (f.price || "0").length)}ch` }}
          className="tnum min-w-[1ch] max-w-full border-none bg-transparent text-left font-display text-[68px] font-extrabold leading-none tracking-[-.04em] text-ink outline-none placeholder:text-faint"
        />
      </div>
      <div
        className={`text-center text-sm ${
          f.touched && f.priceErr ? "text-danger" : "text-muted"
        }`}
      >
        {f.touched && f.priceErr ? f.priceErr : f.local}
      </div>

      {/* payment type toggle */}
      <div className="mt-7">
        <div className="mb-2 text-[13px] font-medium text-muted">Tipe pembayaran</div>
        <div className="flex gap-2">
          {(["one_time", "permanent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => f.setType(t)}
              className={`flex-1 rounded-[14px] border py-2.5 font-display text-[14px] font-semibold transition-colors ${
                f.type === t
                  ? "border-primary bg-primary/[.07] text-primary"
                  : "border-ink/[.12] bg-paper text-muted"
              }`}
            >
              {t === "one_time" ? "1× (custom)" : "Toko (berulang)"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">
          {f.type === "one_time"
            ? "Link sekali pakai untuk 1 buyer — cocok untuk freelancer."
            : "Halaman produk permanen — buyer bisa bayar berkali-kali."}
        </p>
      </div>

      <MetalCta className="mt-8 block w-full">
        <button
          onClick={f.submit}
          disabled={f.submitting}
          className={`liquid-surface w-full overflow-hidden rounded-btn py-4 font-display text-base font-semibold text-white transition-opacity ${
            f.valid && !f.submitting ? "" : "opacity-60"
          }`}
        >
          {f.submitting ? "Creating…" : f.type === "permanent" ? "Buat halaman produk" : "Create payment link"}
        </button>
      </MetalCta>
    </WebCard>
  );
}
