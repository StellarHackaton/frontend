import { OrderStatus } from "@/lib/mock";

export function StatusPill({ status }: { status: OrderStatus }) {
  const paid = status === "paid";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1.5 text-[13px] font-semibold ${
        paid
          ? "bg-success/[.14] text-success"
          : "bg-ink/[.06] text-muted"
      }`}
    >
      {paid ? "Paid ✓" : "Pending"}
    </span>
  );
}
