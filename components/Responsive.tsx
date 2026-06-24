import { ReactNode } from "react";

/**
 * Renders the mobile tree below the `lg` breakpoint and the web tree at/above it.
 * Both mount; CSS toggles visibility — SSR-safe, no hydration flash, adapts live
 * on resize. Web = desktop browser experience, mobile = Liquid-Glass full screen.
 */
export function Responsive({
  mobile,
  web,
}: {
  mobile: ReactNode;
  web: ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden">{mobile}</div>
      <div className="hidden lg:block">{web}</div>
    </>
  );
}
