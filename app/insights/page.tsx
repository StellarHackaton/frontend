import { Responsive } from "@/components/Responsive";
import { Insights as MobileInsights } from "@/components/mobile/Insights";
import { Dashboard as WebDashboard } from "@/components/web/Dashboard";

export default function InsightsPage() {
  return <Responsive mobile={<MobileInsights />} web={<WebDashboard />} />;
}
