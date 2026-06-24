"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  {
    key: "home",
    label: "Home",
    href: "/dashboard",
    icon: (
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" strokeWidth="1.8" strokeLinejoin="round" />
    ),
  },
  {
    key: "orders",
    label: "Orders",
    href: "/orders",
    icon: <path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    key: "products",
    label: "Products",
    href: "/products",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth="1.8" />
        <rect x="13" y="4" width="7" height="7" rx="2" strokeWidth="1.8" />
        <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth="1.8" />
        <rect x="13" y="13" width="7" height="7" rx="2" strokeWidth="1.8" />
      </>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="glass-sheet flex h-16 flex-none items-center justify-around rounded-t-[24px] px-3">
      {TABS.map((t) => {
        const active =
          t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
        const color = active ? "#2F2A6B" : "#9b9aa1";
        return (
          <motion.button
            key={t.key}
            onClick={() => router.push(t.href)}
            whileTap={{ scale: 0.88 }}
            animate={{ y: active ? -1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex flex-col items-center gap-[3px]"
            style={{ color }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}>
              {t.icon}
            </svg>
            <span className={`text-[11px] ${active ? "font-semibold" : ""}`}>
              {t.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
