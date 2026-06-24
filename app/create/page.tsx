import { Responsive } from "@/components/Responsive";
import { CreateForm as MobileCreate } from "@/components/mobile/CreateForm";
import { CreateForm as WebCreate } from "@/components/web/CreateForm";

export default function CreatePage() {
  return <Responsive mobile={<MobileCreate />} web={<WebCreate />} />;
}
