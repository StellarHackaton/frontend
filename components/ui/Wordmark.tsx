/* Brand wordmark + mark. Source art lives in /public/logo (indigo on light). */

export function Wordmark({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/wordmark.png"
      alt="Lunas"
      style={{ height: size, width: "auto" }}
      className={className}
    />
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/mark.png"
      alt="Lunas"
      style={{ height: size, width: "auto" }}
    />
  );
}
