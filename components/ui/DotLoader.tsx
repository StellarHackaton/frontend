// Smooth 3-dot bounce — shared loading indicator (route fallback + order fetch).
export function DotLoader({ size = 3 }: { size?: number }) {
  return (
    <div className="flex items-end gap-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-loaderDot rounded-full bg-primary"
          style={{ height: size * 4, width: size * 4, animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}
