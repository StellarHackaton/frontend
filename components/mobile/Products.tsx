"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Fab } from "@/components/ui/Fab";
import { MobileHeader } from "@/components/ui/MobileHeader";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, BoxIcon } from "@/components/ui/EmptyState";
import { formatUsd } from "@/lib/format";
import { listContainer, listItem } from "@/lib/motion";
import { useWalletContext } from "@/lib/wallet-context";
import { useDashboard } from "@/lib/useDashboard";

export function Products() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { products, loading } = useDashboard(address);

  return (
    <MobileShell>
      <MobileHeader title="Products" />

      <div className="flex-1 overflow-y-auto px-[22px] pb-[120px] pt-2">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={BoxIcon}
            title="No products yet"
            body="Create your first product to get a payment link."
            action={
              <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
                New product
              </MetalButton>
            }
          />
        ) : (
          <motion.div className="liquid-glass overflow-hidden rounded-[20px]" variants={listContainer} initial="initial" animate="animate">
            {products.map((p, i) => (
              <motion.button
                key={p.id}
                variants={listItem}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/p/${p.orderId}`)}
                className={`flex w-full items-center gap-3.5 px-4 py-3 text-left ${i > 0 ? "border-t border-ink/[.06]" : ""}`}
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink font-display text-base font-bold text-white">
                  {p.title[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[15px] font-semibold">{p.title}</div>
                  <div className="mt-0.5 text-xs text-faint">{p.paidCount} paid so far</div>
                </div>
                <div className="tnum flex-none font-display text-[15px] font-bold">{formatUsd(p.priceUSD)}</div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <Fab onClick={() => router.push("/create")} label="New product" />
      <TabBar />
    </MobileShell>
  );
}
