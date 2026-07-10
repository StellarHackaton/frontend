import { Responsive } from "@/components/Responsive";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default function OnboardingPage() {
  return <Responsive mobile={<OnboardingFlow />} web={<OnboardingFlow />} />;
}
