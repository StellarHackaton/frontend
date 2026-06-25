"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";

const NAV = [
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

export function WebShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* sidebar */}
      <aside className="flex w-[240px] flex-none flex-col border-r border-ink/[.06] bg-white px-[18px] py-7">
        <div className="pl-2.5">
          <Wordmark size={20} />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((n) => {
            const active =
              n.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(n.href);
            return (
              <button
                key={n.key}
                onClick={() => router.push(n.href)}
                className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] transition-colors ${
                  active
                    ? "liquid-nav font-semibold text-primary"
                    : "text-muted hover:bg-ink/[.04]"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={active ? "#2F2A6B" : "#6B6A73"}
                >
                  {n.icon}
                </svg>
                {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-[68px] items-center justify-between border-b border-ink/[.06] px-9">
          <div className="font-display text-[22px] font-bold tracking-[-.02em]">
            {title}
          </div>
          <div className="flex items-center gap-4">
            {action}
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary-soft font-display font-bold text-primary">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 p-9">{children}</div>
      </div>
    </div>
  );
}
