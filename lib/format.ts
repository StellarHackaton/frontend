// USD → IDR display rate. Display-only; real settlement is exact USDC.
export const USD_TO_IDR = 15700;

export function formatRp(usd: number | string): string {
  const n = typeof usd === "string" ? parseFloat(usd) : usd;
  if (!isFinite(n)) return "";
  return "Rp" + Math.round(n * USD_TO_IDR).toLocaleString("en-US");
}

export function formatUsd(usd: number | string): string {
  const n = typeof usd === "string" ? parseFloat(usd) : usd;
  if (!isFinite(n)) return "$0";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export function formatUsdCents(usd: number | string): string {
  const n = typeof usd === "string" ? parseFloat(usd) : usd;
  if (!isFinite(n)) return "$0.00";
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
