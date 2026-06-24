import { ReactNode } from "react";

// Centered card surface for web buyer/create/detail screens. Real web — no fake
// browser chrome; the card sits on the warm canvas.
export function WebCard({
  children,
  width = 460,
}: {
  children: ReactNode;
  width?: number;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div
        className="liquid-glass w-full rounded-[28px] p-8 sm:p-10"
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </main>
  );
}
