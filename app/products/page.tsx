import { Responsive } from "@/components/Responsive";
import { Products as MobileProducts } from "@/components/mobile/Products";
import { Products as WebProducts } from "@/components/web/Products";

export default function ProductsPage() {
  return <Responsive mobile={<MobileProducts />} web={<WebProducts />} />;
}
