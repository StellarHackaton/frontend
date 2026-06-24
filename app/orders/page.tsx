import { Responsive } from "@/components/Responsive";
import { Orders as MobileOrders } from "@/components/mobile/Orders";
import { Orders as WebOrders } from "@/components/web/Orders";

export default function OrdersPage() {
  return <Responsive mobile={<MobileOrders />} web={<WebOrders />} />;
}
