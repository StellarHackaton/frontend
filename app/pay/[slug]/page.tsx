import { Metadata } from "next";
import { Responsive } from "@/components/Responsive";
import { CheckoutFlow as MobileCheckout } from "@/components/mobile/CheckoutFlow";
import { WebCheckoutFlow } from "@/components/web/WebCheckoutFlow";
import { getOrder, getProduct } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let title = "Pay with Lunas";
  let description = "Pay quickly and securely with any balance you hold.";
  let priceUSD: number | null = null;
  let productName: string | null = null;

  try {
    const order = await getOrder(params.slug);
    if (order) {
      priceUSD = order.amount_stroops / 10_000_000;
      if (order.product_id) {
        const product = await getProduct(order.product_id);
        if (product) productName = product.title;
      }
    } else {
      const product = await getProduct(params.slug);
      if (product) {
        productName = product.title;
        priceUSD = product.price_stroops / 10_000_000;
      }
    }
  } catch { /* fallback to defaults */ }

  if (productName && priceUSD !== null) {
    title = `Pay $${priceUSD.toFixed(2)} for ${productName}`;
    description = `Complete your payment for "${productName}" — $${priceUSD.toFixed(2)}. Pay with Euro, Dollar, or any balance you already hold.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Lunas",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function PayPage({ params }: { params: { slug: string } }) {
  const orderId = params.slug;
  return (
    <Responsive
      mobile={<MobileCheckout orderId={orderId} />}
      web={<WebCheckoutFlow orderId={orderId} />}
    />
  );
}
