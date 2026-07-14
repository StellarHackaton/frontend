"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/lib/wallet-context";
import { LanguageProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
        config={{
          loginMethods: ["email", "google"],
          appearance: {
            theme: "light",
            accentColor: "#2F2A6B",
            // Privy's login popup fetches this from its own context, so a
            // relative path 404s — it needs a full absolute URL.
            logo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/icons/icon-192.png`,
          },
          embeddedWallets: { createOnLogin: "off" } as any,
        }}
      >
        <WalletProvider>{children}</WalletProvider>
      </PrivyProvider>
    </LanguageProvider>
  );
}
