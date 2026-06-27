"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";

export type WalletType = "crossmint" | "freighter" | null;

interface WalletContextValue {
  address: string | null;
  walletType: WalletType;
  isConnected: boolean;
  crossmintEnabled: boolean;
  userInitial: string;
  authStatus: "initializing" | "logged-in" | "logged-out" | "in-progress";
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email?: string) => void;
  connectFreighter: () => Promise<string>;
  disconnect: () => Promise<void>;
  signXdr: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Freighter helpers (shared by both providers) ───────────────────────────

async function initAndOpenFreighter() {
  const [{ StellarWalletsKit, Networks }, { FreighterModule }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit"),
    import("@creit.tech/stellar-wallets-kit/modules/freighter"),
  ]);
  StellarWalletsKit.init({ network: Networks.TESTNET, modules: [new FreighterModule()] });
  return StellarWalletsKit;
}

// ─── With Crossmint ─────────────────────────────────────────────────────────
// Only rendered when CrossmintProvider tree is present (API key exists)

function WithCrossmint({ children }: { children: React.ReactNode }) {
  const { loginWithOAuth, login, logout, status: authStatus, user } = useCrossmintAuth();
  const { wallet: crossmintWallet, getWallet, createWallet } = useWallet();
  const [freighterAddress, setFreighterAddress] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "logged-in" || crossmintWallet) return;
    getWallet({ chain: "stellar" })
      .then((w) => {
        if (!w) createWallet({ chain: "stellar", recovery: { type: "email" } }).catch(console.error);
      })
      .catch(console.error);
  }, [authStatus, crossmintWallet, getWallet, createWallet]);

  const crossmintAddress = crossmintWallet?.address ?? null;
  const address = crossmintAddress ?? freighterAddress;
  const walletType: WalletType = crossmintAddress ? "crossmint" : freighterAddress ? "freighter" : null;

  const email = (user as { email?: string } | undefined)?.email;
  const userInitial = email
    ? email[0].toUpperCase()
    : address
    ? address.slice(0, 2).toUpperCase()
    : authStatus === "logged-in" || authStatus === "in-progress"
    ? "…"
    : "?";

  const loginWithGoogle = useCallback(async () => {
    await loginWithOAuth("google");
  }, [loginWithOAuth]);

  const loginWithEmail = useCallback((email?: string) => { login(email); }, [login]);

  const connectFreighter = useCallback(async (): Promise<string> => {
    const kit = await initAndOpenFreighter();
    const { address: addr } = await kit.authModal();
    setFreighterAddress(addr);
    return addr;
  }, []);

  const disconnect = useCallback(async () => {
    if (walletType === "crossmint") {
      await logout();
    } else if (walletType === "freighter") {
      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
      await StellarWalletsKit.disconnect();
      setFreighterAddress(null);
    }
  }, [walletType, logout]);

  const signXdr = useCallback(async (xdr: string): Promise<string> => {
    if (walletType !== "freighter" || !freighterAddress) throw new Error("No wallet for signing");
    const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: freighterAddress,
    });
    return signedTxXdr;
  }, [walletType, freighterAddress]);

  return (
    <WalletContext.Provider value={{
      address, walletType, isConnected: !!address, crossmintEnabled: true,
      userInitial, authStatus, loginWithGoogle, loginWithEmail, connectFreighter, disconnect, signXdr,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── Freighter only (no Crossmint, no API key needed) ───────────────────────

function FreighterOnly({ children }: { children: React.ReactNode }) {
  const [freighterAddress, setFreighterAddress] = useState<string | null>(null);

  const connectFreighter = useCallback(async (): Promise<string> => {
    const kit = await initAndOpenFreighter();
    const { address: addr } = await kit.authModal();
    setFreighterAddress(addr);
    return addr;
  }, []);

  const disconnect = useCallback(async () => {
    const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
    await StellarWalletsKit.disconnect();
    setFreighterAddress(null);
  }, []);

  const signXdr = useCallback(async (xdr: string): Promise<string> => {
    if (!freighterAddress) throw new Error("Freighter not connected");
    const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address: freighterAddress,
    });
    return signedTxXdr;
  }, [freighterAddress]);

  const notEnabled = async () => { alert("Tambahkan NEXT_PUBLIC_CROSSMINT_API_KEY di .env.local untuk login Google/Email"); };

  return (
    <WalletContext.Provider value={{
      address: freighterAddress,
      walletType: freighterAddress ? "freighter" : null,
      isConnected: !!freighterAddress,
      crossmintEnabled: false,
      userInitial: freighterAddress ? freighterAddress.slice(0, 2).toUpperCase() : "?",
      authStatus: "logged-out",
      loginWithGoogle: notEnabled,
      loginWithEmail: () => { notEnabled(); },
      connectFreighter,
      disconnect,
      signXdr,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function WalletProvider({
  children,
  crossmintEnabled,
}: {
  children: React.ReactNode;
  crossmintEnabled: boolean;
}) {
  if (crossmintEnabled) return <WithCrossmint>{children}</WithCrossmint>;
  return <FreighterOnly>{children}</FreighterOnly>;
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be inside WalletProvider");
  return ctx;
}
