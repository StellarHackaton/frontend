import { Responsive } from "@/components/Responsive";
import { Login as MobileLogin } from "@/components/mobile/Login";
import { Login as WebLogin } from "@/components/web/Login";

export default function LoginPage() {
  return <Responsive mobile={<MobileLogin />} web={<WebLogin />} />;
}
