import { Responsive } from "@/components/Responsive";
import { Settings as MobileSettings } from "@/components/mobile/Settings";
import { Settings as WebSettings } from "@/components/web/Settings";

export default function SettingsPage() {
  return <Responsive mobile={<MobileSettings />} web={<WebSettings />} />;
}
