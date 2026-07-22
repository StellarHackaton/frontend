"use client";

import { usePathname } from "next/navigation";
import { TabBar } from "./TabBar";

const TAB_ROUTES = ["/dashboard", "/orders", "/products", "/insights", "/settings"];

// Rendered once from the root layout (a Layout, never remounted by Next.js
// navigation) rather than inside each screen — app/template.tsx sits between
// the root layout and every page, and remounts on every top-level segment
// change (dashboard -> orders counts, per Next's own template.js docs), so a
// TabBar mounted inside the page tree was torn down and rebuilt on every tab
// switch. That's why its sliding active-pill (framer-motion layoutId) was
// snapping instead of animating. Living here, above that boundary, it's a
// single continuous instance for the whole session.
export function AppTabBar() {
  const pathname = usePathname();
  if (!TAB_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) return null;
  return <TabBar />;
}
