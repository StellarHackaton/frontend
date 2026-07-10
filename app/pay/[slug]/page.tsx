import { Responsive } from "@/components/Responsive";
import { CheckoutFlow as MobileCheckout } from "@/components/mobile/CheckoutFlow";
import { WebCheckoutFlow } from "@/components/web/WebCheckoutFlow";

export default function PayPage({
  params,
}: {
  params: { slug: string };
}) {
  const orderId = params.slug;
  return (
    <Responsive
      mobile={<MobileCheckout orderId={orderId} />}
      web={<WebCheckoutFlow orderId={orderId} />}
    />
  );
}
