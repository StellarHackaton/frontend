export function Wordmark({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`font-display font-bold tracking-[-.02em] text-primary ${className}`}
      style={{ fontSize: size }}
    >
      lunas
    </span>
  );
}

export function LogoMark() {
  return (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-primary font-display text-base font-extrabold text-white shadow-[0_4px_10px_rgba(47,42,107,.3)]">
      L
    </div>
  );
}
