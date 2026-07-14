"use client";

const CONV = [
  { x: 54, y: 0, delay: 0 },
  { x: 27, y: 46, delay: 0.32 },
  { x: -27, y: 46, delay: 0.64 },
  { x: -54, y: 0, delay: 0.16 },
  { x: -27, y: -46, delay: 0.48 },
  { x: 27, y: -46, delay: 0.8 },
];

export function Processing({ payingWith }: { payingWith: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="relative mb-11 flex h-[180px] w-[180px] items-center justify-center">
        <div
          className="absolute h-[92px] w-[92px] rounded-full"
          style={{
            background: "radial-gradient(closest-side,rgba(47,42,107,.20),rgba(47,42,107,0))",
            animation: "halo 2.4s ease-out infinite",
          }}
        />
        {CONV.map((c, i) => (
          <span
            key={i}
            className="absolute h-[9px] w-[9px] rounded-full bg-primary"
            style={{ animation: `conv${i} 1.9s ease-in infinite`, animationDelay: `${c.delay}s` }}
          />
        ))}
        <div className="relative h-[66px] w-[66px] animate-wobble rounded-full bg-primary shadow-[0_12px_32px_rgba(47,42,107,.42),inset_0_2px_8px_rgba(255,255,255,.28)]">
          <div className="absolute left-[15px] top-[13px] h-[13px] w-[18px] rounded-full bg-white/50 blur-[2px]" />
        </div>
      </div>
      <div className="font-display text-[23px] font-semibold">Processing your payment…</div>
      <div className="mt-2 text-[15px] text-muted">Paying with {payingWith}</div>

      <style jsx>{`
        ${CONV.map(
          (c, i) => `
          @keyframes conv${i} {
            0% { transform: translate(${c.x}px, ${c.y}px) scale(1); opacity: 0; }
            26% { opacity: .95; }
            100% { transform: translate(0,0) scale(.22); opacity: 0; }
          }`
        ).join("\n")}
      `}</style>
    </div>
  );
}
