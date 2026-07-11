interface Props {
  code: string;
  size?: number;
  radius?: number;
}

const CONFIGS: Record<string, { bg: string; fg: string; content: "dollar" | "euro" | "p" | "xlm" | "letter" }> = {
  USDC:  { bg: "#2775CA", fg: "#fff", content: "dollar" },
  EURC:  { bg: "#0052B4", fg: "#fff", content: "euro"   },
  PYUSD: { bg: "#003087", fg: "#fff", content: "p"      },
  XLM:   { bg: "#1B1B3A", fg: "#fff", content: "xlm"    },
};

export function PaymentIcon({ code, size = 42, radius }: Props) {
  const r = radius ?? Math.round(size * 0.28);
  const cfg = CONFIGS[code] ?? { bg: "#6B7280", fg: "#fff", content: "letter" as const };
  const s = size;
  const ic = s * 0.46;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <rect width={s} height={s} rx={r} fill={cfg.bg} />

      {cfg.content === "dollar" && (
        <text x={s / 2} y={s * 0.685} textAnchor="middle" fill={cfg.fg}
          fontFamily="system-ui,sans-serif" fontWeight="700" fontSize={ic}>$</text>
      )}

      {cfg.content === "euro" && (
        <text x={s / 2} y={s * 0.685} textAnchor="middle" fill={cfg.fg}
          fontFamily="system-ui,sans-serif" fontWeight="700" fontSize={ic}>€</text>
      )}

      {cfg.content === "p" && (
        <text x={s / 2} y={s * 0.685} textAnchor="middle" fill={cfg.fg}
          fontFamily="system-ui,sans-serif" fontWeight="800" fontSize={ic}>P</text>
      )}

      {cfg.content === "xlm" && (() => {
        const cx = s / 2, cy = s / 2, arm = s * 0.28;
        const angles = [0, 60, 120];
        const sw = s * 0.075;
        return angles.map((a) => {
          const rad = (a * Math.PI) / 180;
          const cos = Math.cos(rad), sin = Math.sin(rad);
          return (
            <line key={a}
              x1={cx - arm * cos} y1={cy - arm * sin}
              x2={cx + arm * cos} y2={cy + arm * sin}
              stroke={cfg.fg} strokeWidth={sw} strokeLinecap="round" />
          );
        });
      })()}

      {cfg.content === "letter" && (
        <text x={s / 2} y={s * 0.685} textAnchor="middle" fill={cfg.fg}
          fontFamily="system-ui,sans-serif" fontWeight="700" fontSize={ic}>
          {code[0]}
        </text>
      )}
    </svg>
  );
}
