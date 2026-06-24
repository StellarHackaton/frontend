import { ReactNode } from "react";

// Calm, directional empty state — invites action, never dead-ends (spec §9).
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary-soft text-primary">
        {icon}
      </div>
      <div className="font-display text-xl font-bold">{title}</div>
      <div className="mt-2 max-w-[260px] text-[15px] leading-[1.5] text-muted">
        {body}
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const BoxIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 8l8-4 8 4v8l-8 4-8-4V8z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M4 8l8 4 8-4M12 12v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const ReceiptIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
