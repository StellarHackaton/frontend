import { Metadata } from "next";
import { Responsive } from "@/components/Responsive";
import { ProductDetail as MobileDetail } from "@/components/mobile/ProductDetail";
import { ProductDetail as WebDetail } from "@/components/web/ProductDetail";
import { getProduct, getMerchant } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let title = "Lunas — Payment Link";
  let description = "Pay quickly and securely with any balance you hold.";

  try {
    const product = await getProduct(params.slug);
    if (product) {
      const priceUSD = (product.price_stroops / 10_000_000).toFixed(2);
      const merchant = await getMerchant(product.merchant_address);
      const storeName = merchant?.store_name;

      title = storeName
        ? `${product.title} — $${priceUSD} · ${storeName}`
        : `${product.title} — $${priceUSD}`;
      description = storeName
        ? `Pay $${priceUSD} to ${storeName} for "${product.title}". Use any balance you hold — Euro, Dollar, XLM, and more.`
        : `Pay $${priceUSD} for "${product.title}". Use any balance you hold — Euro, Dollar, XLM, and more.`;
    }
  } catch { /* fallback to defaults */ }

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

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug || "sunset-a3";
  return (
    <Responsive
      mobile={<MobileDetail slug={slug} />}
      web={<WebDetail slug={slug} />}
    />
  );
}
