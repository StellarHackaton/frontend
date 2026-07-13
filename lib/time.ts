import type { Lang } from "./i18n";

/** Relative time ("2m ago" / "2 mnt lalu") — shared across Dashboard/Orders. */
export function timeAgo(iso: string, lang: Lang): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (lang === "id") {
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  }
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Full date+time — shared across Dashboard/Orders detail views. */
export function formatDT(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
