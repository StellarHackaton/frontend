export function StatusPill({ status }: { status: "paid" | "pending" | "expired" }) {
  const label = status === "paid" ? "Paid ✓" : status === "expired" ? "Expired" : "Pending";
  const tone =
    status === "paid"
      ? "bg-success/[.14] text-success"
      : status === "expired"
      ? "bg-red-500/[.12] text-red-500"
      : "bg-ink/[.06] text-muted";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1.5 text-[13px] font-semibold ${tone}`}
    >
      {label}
    </span>
  );
}
