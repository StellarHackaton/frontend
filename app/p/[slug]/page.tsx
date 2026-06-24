import { Responsive } from "@/components/Responsive";
import { ProductDetail as MobileDetail } from "@/components/mobile/ProductDetail";
import { ProductDetail as WebDetail } from "@/components/web/ProductDetail";

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
