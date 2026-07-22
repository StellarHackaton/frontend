"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  {
    key: "home",
    label: "Home",
    href: "/dashboard",
    icon: (
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" strokeWidth="1.9" strokeLinejoin="round" />
    ),
  },
  {
    key: "orders",
    label: "Orders",
    href: "/orders",
    icon: <path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.9" strokeLinecap="round" />,
  },
  {
    key: "products",
    label: "Products",
    href: "/products",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth="1.9" />
        <rect x="13" y="4" width="7" height="7" rx="2" strokeWidth="1.9" />
        <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth="1.9" />
        <rect x="13" y="13" width="7" height="7" rx="2" strokeWidth="1.9" />
      </>
    ),
  },
  {
    key: "insights",
    label: "Insights",
    href: "/insights",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" strokeWidth="1.9" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeWidth="1.9" strokeLinecap="round" />
      </>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    // Floating capsule, centered, detached from edges — Apple-style.
    // lg:hidden because this now lives in a shared layout above the
    // mobile/web split, not inside the mobile-only tree.
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-50 flex justify-center lg:hidden">
      <nav
        data-tour="mobile-tabbar"
        className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink/80 p-1.5 shadow-[0_18px_40px_rgba(21,22,27,.4)] backdrop-blur-2xl ring-1 ring-white/10"
      >
        {TABS.map((t) => {
          const active =
            t.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(t.href);
          return (
            <motion.button
              key={t.key}
              onClick={() => router.push(t.href)}
              whileTap={{ scale: 0.86 }}
              aria-label={t.label}
              className="relative flex h-12 w-12 items-center justify-center rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="navpill"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,.25)]"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "#15161B" : "rgba(255,255,255,.78)"}
                className="relative z-[1]"
              >
                {t.icon}
              </svg>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
