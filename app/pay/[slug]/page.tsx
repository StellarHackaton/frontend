import { Responsive } from "@/components/Responsive";
import { CheckoutFlow as MobileCheckout } from "@/components/mobile/CheckoutFlow";
import { WebCheckoutFlow } from "@/components/web/WebCheckoutFlow";
import { product } from "@/lib/mock";

export type CheckoutState = "normal" | "nobalance" | "expired" | "paid";

const VALID: CheckoutState[] = ["normal", "nobalance", "expired", "paid"];

export default function PayPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { state?: string };
}) {
  // Mock: every slug resolves to the demo product. Real build resolves the slug
  // to an on-chain order via /api/orders/:id — see CLAUDE_Lunas_Stellar.md §8.
  // ?state= drives the demo edge screens (no-balance / expired / already-paid).
  const p = { ...product, slug: params.slug || product.slug };
  const raw = (searchParams?.state ?? "normal") as CheckoutState;
  const state = VALID.includes(raw) ? raw : "normal";
  return (
    <Responsive
      mobile={<MobileCheckout product={p} state={state} />}
      web={<WebCheckoutFlow product={p} state={state} />}
    />
  );
}
