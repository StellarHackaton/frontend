import { DotLoader } from "@/components/ui/DotLoader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <DotLoader />
    </div>
  );
}
