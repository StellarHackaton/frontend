"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WebShell } from "./WebShell";
import { Skeleton } from "@/components/ui/Skeleton";
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
    <WebShell
      title="Products"
      action={
        <MetalButton onClick={() => router.push("/create")} full={false} size="sm">
          New product
        </MetalButton>
      }
    >
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-ink/[.08] bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="mt-6 h-3 w-1/3" />
            </div>
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
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {products.map((p) => (
          <motion.button
            key={p.slug}
            variants={listItem}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push(`/p/${p.slug}`)}
            className="liquid-glass rounded-[20px] p-6 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="font-display text-[17px] font-semibold">
                {p.name}
              </div>
              <div className="tnum font-display text-[17px] font-bold">
                {formatUsd(p.priceUSD)}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[13px] text-muted">
                {p.paid} paid so far
              </span>
              <span className="text-[13px] font-semibold text-primary">
                View link →
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
      )}
    </WebShell>
  );
}
