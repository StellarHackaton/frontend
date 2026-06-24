import { MetalLink } from "@/components/ui/MetalButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="font-display text-[40px] font-extrabold tracking-[-.035em] text-primary">
        lunas
      </span>
      <div className="mt-6 font-display text-[28px] font-bold tracking-[-.02em]">
        This page got away
      </div>
      <div className="mt-2 max-w-[300px] text-[15px] leading-[1.5] text-muted">
        The link may be wrong or the product is no longer available.
      </div>
      <span className="mt-8 inline-block">
        <MetalLink href="/" className="px-7 py-3.5 text-base">
          Back home
        </MetalLink>
      </span>
    </main>
  );
}
