import { Responsive } from "@/components/Responsive";
import { Dashboard as MobileDashboard } from "@/components/mobile/Dashboard";
import { Dashboard as WebDashboard } from "@/components/web/Dashboard";

export default function DashboardPage() {
  return <Responsive mobile={<MobileDashboard />} web={<WebDashboard />} />;
}
