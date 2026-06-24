"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileShell } from "./MobileShell";
import { TabBar } from "./TabBar";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { MetalButton } from "@/components/ui/MetalButton";
import { EmptyState, BoxIcon } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock";
import { formatUsd } from "@/lib/format";
import { listContainer, listItem } from "@/lib/motion";
import { useMockLoad } from "@/lib/useMockLoad";

export function Products() {
  const router = useRouter();
  const loading = useMockLoad();
  return (
    <MobileShell>
      <div className="flex h-[54px] flex-none items-center justify-between px-6">
        <Wordmark />
        <span className="font-display text-base font-semibold">Products</span>
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-4 pt-2">
        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
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
        <motion.div
          className="flex flex-col gap-2.5"
          variants={listContainer}
          initial="initial"
          animate="animate"
        >
          {products.map((p) => (
            <motion.button
              key={p.slug}
              variants={listItem}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/p/${p.slug}`)}
              className="flex items-center justify-between rounded-[18px] border border-white/65 bg-white/55 p-3.5 text-left shadow-[0_6px_18px_rgba(21,22,27,.06),inset_0_1px_0_rgba(255,255,255,.85)] backdrop-blur-[16px]"
            >
              <div>
                <div className="font-display text-[15px] font-semibold">
                  {p.name}
                </div>
                <div className="mt-[3px] text-xs text-faint">
                  {p.paid} paid so far
                </div>
              </div>
              <div className="tnum font-display text-[15px] font-bold">
                {formatUsd(p.priceUSD)}
              </div>
            </motion.button>
          ))}
        </motion.div>
        )}
      </div>

      <div className="flex-none px-[22px] pb-3 pt-3.5">
        <Button onClick={() => router.push("/create")}>
          New product
        </Button>
      </div>
      <TabBar />
    </MobileShell>
  );
}
