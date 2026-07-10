"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/lib/wallet-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "light",
          accentColor: "#2F2A6B",
          logo: "/icon-192.png",
        },
        embeddedWallets: { createOnLogin: "off" },
      }}
    >
      <WalletProvider>{children}</WalletProvider>
    </PrivyProvider>
  );
}
