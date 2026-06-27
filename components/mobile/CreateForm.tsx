"use client";

import { MobileShell } from "./MobileShell";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { useCreateForm } from "@/lib/useCreateForm";

export function CreateForm() {
  const f = useCreateForm();

  return (
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center gap-2.5 px-[18px]">
        <BackButton onClick={f.back} />
        <span className="font-display text-lg font-bold">New product</span>
      </div>

      <div className="flex flex-1 flex-col gap-[26px] px-[22px] py-4">
        <div>
          <div className="mb-2 text-[13px] font-medium text-muted">
            Product name
          </div>
          <input
            value={f.name}
            onChange={(e) => f.setName(e.target.value)}
            placeholder="Sunset print A3"
            className={`h-[54px] w-full rounded-[18px] border bg-white/55 px-4 text-base text-ink shadow-[0_6px_18px_rgba(21,22,27,.05),inset_0_1px_0_rgba(255,255,255,.85)] outline-none backdrop-blur-[16px] placeholder:text-faint focus:shadow-[0_0_0_3px_rgba(47,42,107,.14)] ${
              f.touched && f.nameErr
                ? "border-danger focus:border-danger"
                : "border-white/70 focus:border-primary"
            }`}
          />
          {f.touched && f.nameErr && (
            <div className="mt-1.5 text-xs text-danger">{f.nameErr}</div>
          )}
        </div>

        <div>
          <div className="mb-3 text-[13px] font-medium text-muted">Price</div>
          <div className="flex items-baseline justify-center gap-1.5 pb-2 pt-5">
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
        </div>
      </div>

      <div className="flex-none px-[22px] pb-8 pt-3.5">
        <Button onClick={f.submit} className={f.valid ? "" : "opacity-60"}>
          Create payment link
        </Button>
      </div>
    </MobileShell>
  );
}
