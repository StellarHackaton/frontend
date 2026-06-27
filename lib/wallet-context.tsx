"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getPasskeyKit,
  loadPasskeySession,
  savePasskeySession,
  clearPasskeySession,
} from "./passkey-client";

export type WalletType = "albedo" | "freighter" | "passkey" | "other" | null;

interface WalletContextValue {
  address: string | null;
  walletType: WalletType;
  isConnected: boolean;
  isPasskey: boolean;
  userInitial: string;
  authStatus: "initializing" | "ready" | "connecting";
  connect: () => Promise<string>;
  connectPasskey: (mode?: "register" | "login") => Promise<string>;
  disconnect: () => Promise<void>;
  signXdr: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "lunas_wallet";
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

// ─── StellarWalletsKit (Albedo + Freighter) ───────────────────────────────────

async function buildKit(walletId?: string) {
  const [{ StellarWalletsKit, Networks }, { FreighterModule }, { AlbedoModule }] =
    await Promise.all([
      import("@creit.tech/stellar-wallets-kit"),
      import("@creit.tech/stellar-wallets-kit/modules/freighter"),
      import("@creit.tech/stellar-wallets-kit/modules/albedo"),
    ]);
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new AlbedoModule(), new FreighterModule()],
  });
  if (walletId) StellarWalletsKit.setWallet(walletId);
  return StellarWalletsKit;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [passkeyKeyId, setPasskeyKeyId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"initializing" | "ready" | "connecting">(
    "initializing"
  );

  // Restore session from localStorage on mount
  useEffect(() => {
    // Try passkey session first
    const pkSession = loadPasskeySession();
    if (pkSession) {
      setAddress(pkSession.contractId);
      setWalletType("passkey");
      setPasskeyKeyId(pkSession.keyIdBase64);
      setAuthStatus("ready");
      return;
    }

    // Try classic wallet session
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setAuthStatus("ready");
      return;
    }
    const { walletId, addr } = JSON.parse(saved) as { walletId: string; addr: string };
    buildKit(walletId)
      .then(async (kit) => {
        try {
          const { address: live } = await kit.getAddress();
          setAddress(live ?? addr);
          setWalletType(walletId as WalletType);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setAuthStatus("ready"));
  }, []);

  // ─── Albedo / Freighter connect ─────────────────────────────────────────────

  const connect = useCallback(async (): Promise<string> => {
    setAuthStatus("connecting");
    try {
      const kit = await buildKit();
      const { address: addr } = await kit.authModal();
      const mod = kit.selectedModule;
      const wtype = (mod?.productId ?? "other") as WalletType;
      setAddress(addr);
      setWalletType(wtype);
      setPasskeyKeyId(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ walletId: mod?.productId, addr }));
      return addr;
    } finally {
      setAuthStatus("ready");
    }
  }, []);

  // ─── PasskeyKit connect ──────────────────────────────────────────────────────

  const connectPasskey = useCallback(
    async (mode: "register" | "login" = "login"): Promise<string> => {
      setAuthStatus("connecting");
      try {
        const kit = await getPasskeyKit();

        if (mode === "register") {
          // Create a new smart wallet + register passkey credential
          const { contractId, keyIdBase64, signedTx } = await kit.createWallet(
            "Lunas",
            `user-${Date.now()}`
          );

          // Submit the deployment transaction via Launchtube (fee sponsoring)
          const xdr = (signedTx as any).toXDR?.() ?? (signedTx as any).built?.toXDR?.();
          if (xdr) {
            const res = await fetch("/api/passkey/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ xdr }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: res.statusText }));
              throw new Error(err.error ?? "Gagal deploy smart wallet");
            }
          }

          // Persist session
          savePasskeySession({ contractId, keyIdBase64 });
          localStorage.removeItem(STORAGE_KEY); // clear classic session

          setAddress(contractId);
          setWalletType("passkey");
          setPasskeyKeyId(keyIdBase64);
          return contractId;
        }

        // Login: authenticate with existing passkey credential
        const session = loadPasskeySession();
        const { contractId, keyIdBase64 } = await kit.connectWallet({
          ...(session?.keyIdBase64 ? { keyId: session.keyIdBase64 } : {}),
          getContractId: async (keyId: string) => {
            if (session && session.keyIdBase64 === keyId) return session.contractId;
            return undefined;
          },
        });

        savePasskeySession({ contractId, keyIdBase64 });
        localStorage.removeItem(STORAGE_KEY);

        setAddress(contractId);
        setWalletType("passkey");
        setPasskeyKeyId(keyIdBase64);
        return contractId;
      } finally {
        setAuthStatus("ready");
      }
    },
    []
  );

  // ─── Disconnect ──────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (walletType !== "passkey") {
      try {
        const kit = await buildKit();
        await kit.disconnect();
      } catch {
        // ignore
      }
      localStorage.removeItem(STORAGE_KEY);
    } else {
      clearPasskeySession();
    }
    setAddress(null);
    setWalletType(null);
    setPasskeyKeyId(null);
  }, [walletType]);

  // ─── Sign XDR ────────────────────────────────────────────────────────────────

  const signXdr = useCallback(
    async (xdr: string): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");

      if (walletType === "passkey") {
        if (!passkeyKeyId) throw new Error("Passkey key ID missing");
        const kit = await getPasskeyKit();
        // PasskeyKit signs the transaction and triggers biometric auth
        const signed = await kit.sign(xdr, { keyId: passkeyKeyId });
        const signedXdr = (signed as any).toXDR?.() ?? String(signed);

        // Submit via Launchtube
        const res = await fetch("/api/passkey/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xdr: signedXdr }),
        });
        if (!res.ok) throw new Error("Submission via Launchtube gagal");
        const data = await res.json();
        return data.hash ?? signedXdr;
      }

      // Classic wallet (Albedo / Freighter)
      const kit = await buildKit();
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
        address,
      });
      return signedTxXdr;
    },
    [address, walletType, passkeyKeyId]
  );

  // ─── Derived values ───────────────────────────────────────────────────────────

  const isConnected = !!address;
  const isPasskey = walletType === "passkey";
  const userInitial = address ? address.slice(0, 2).toUpperCase() : "?";

  return (
    <WalletContext.Provider
      value={{
        address,
        walletType,
        isConnected,
        isPasskey,
        userInitial,
        authStatus,
        connect,
        connectPasskey,
        disconnect,
        signXdr,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be inside WalletProvider");
  return ctx;
}
