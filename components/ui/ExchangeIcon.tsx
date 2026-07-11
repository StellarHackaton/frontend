import Image from "next/image";

const LOGOS: Record<string, {
  src?: string;
  bg: string;
  invert?: boolean;
  pad?: number;
  cover?: boolean;
  initial?: string;
}> = {
  binance:   { src: "/logos/binance.svg", bg: "#000000", pad: 0.15 },
  okx:       { src: "/logos/okx.svg",    bg: "#000000", pad: 0.15, invert: true },
  bybit:     { src: "/logos/bybit.png",  bg: "#1A1B1F" },
  freighter: { src: "/logos/freighter.png", bg: "#5B4CDB", cover: true },
};

export function ExchangeIcon({ id, size = 44, fill = false }: { id: string; size?: number; fill?: boolean }) {
  const logo = LOGOS[id];
  if (!logo) return null;

  if (fill) {
    return (
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ background: logo.bg }}
      >
        {logo.initial ? (
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "28%", lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>
            {logo.initial}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src!}
            alt={id}
            style={{
              width: logo.cover ? "100%" : logo.pad ? `${(1 - logo.pad * 2) * 100}%` : "80%",
              height: logo.cover ? "100%" : logo.pad ? `${(1 - logo.pad * 2) * 100}%` : "80%",
              objectFit: logo.cover ? "cover" : "contain",
              objectPosition: "center",
              ...(logo.invert ? { filter: "brightness(0) invert(1)" } : {}),
            }}
          />
        )}
      </div>
    );
  }

  const r = Math.round(size * 0.28);
  const padFrac = logo.pad ?? 0;
  const pad = Math.round(size * padFrac);
  const inner = size - pad * 2;

  return (
    <div
      className="flex items-center justify-center overflow-hidden flex-none"
      style={{ width: size, height: size, borderRadius: r, background: logo.bg }}
    >
      {logo.initial ? (
        <span style={{ color: "#fff", fontWeight: 700, fontSize: Math.round(size * 0.28), lineHeight: 1, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.03em" }}>
          {logo.initial}
        </span>
      ) : (
        <Image
          src={logo.src!}
          alt={id}
          width={inner}
          height={inner}
          style={{
            objectFit: logo.cover ? "cover" : "contain",
            objectPosition: "center",
            width: logo.cover ? size : inner,
            height: logo.cover ? size : inner,
            ...(logo.invert ? { filter: "brightness(0) invert(1)" } : {}),
          }}
          unoptimized
        />
      )}
    </div>
  );
}
