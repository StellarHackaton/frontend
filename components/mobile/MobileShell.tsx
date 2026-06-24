import { ReactNode } from "react";

// Full-viewport mobile surface (no device bezel) with the Liquid-Glass atmosphere.
// Real phones render this edge-to-edge; the bezel was showcase-only.
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-paper text-ink">
      <div
        className="pointer-events-none absolute -left-[70px] -top-[90px] h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side,rgba(255,221,186,.55),rgba(255,221,186,0))",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[120px] -right-[90px] h-[380px] w-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side,rgba(47,42,107,.12),rgba(47,42,107,0))",
        }}
      />
      <div
        className="pointer-events-none absolute -left-[60px] top-[38%] h-[240px] w-[240px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side,rgba(31,157,120,.08),rgba(31,157,120,0))",
        }}
      />
      <div className="relative z-[1] flex min-h-[100dvh] flex-col">{children}</div>
    </div>
  );
}
