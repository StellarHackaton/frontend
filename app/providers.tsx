"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { WalletProvider } from "@/lib/wallet-context";

const CROSSMINT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? "";
const hasCrossmintKey = CROSSMINT_API_KEY.startsWith("ck_") || CROSSMINT_API_KEY.startsWith("sk_");

export function Providers({ children }: { children: React.ReactNode }) {
  if (!hasCrossmintKey) {
    // No API key yet — Freighter-only mode, Crossmint providers skipped
    return <WalletProvider crossmintEnabled={false}>{children}</WalletProvider>;
  }

  return (
    <CrossmintProvider apiKey={CROSSMINT_API_KEY}>
      <CrossmintAuthProvider loginMethods={["google", "email"]}>
        <CrossmintWalletProvider>
          <WalletProvider crossmintEnabled={true}>{children}</WalletProvider>
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
