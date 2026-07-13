"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet, useSignRawHash } from "@privy-io/react-auth/extended-chains";
import {
  getPasskeyKit,
  loadPasskeySession,
  savePasskeySession,
  clearPasskeySession,
} from "./passkey-client";

export type WalletType = "albedo" | "freighter" | "passkey" | "privy" | "other" | null;

interface WalletContextValue {
  address: string | null;
  walletType: WalletType;
  isConnected: boolean;
  isPasskey: boolean;
  userInitial: string;
  authStatus: "initializing" | "ready" | "connecting";
  storeName: string | null | undefined; // undefined = masih loading, null = sudah fetch & tidak ada
  setStoreName: (name: string) => void;
  connect: () => Promise<string>;
  connectPasskey: (mode?: "register" | "login") => Promise<string>;
  connectPrivy: () => Promise<void>;
  disconnect: () => Promise<void>;
  signXdr: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "lunas_wallet";
const PRIVY_STORAGE_KEY = "lunas_privy";
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
  const [storeName, setStoreName] = useState<string | null | undefined>(undefined);

  // ─── Privy hooks ────────────────────────────────────────────────────────────
  const { ready: privyReady, authenticated, user, login, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signRawHash } = useSignRawHash();
  const privyHandled = useRef(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    // 1. Passkey session
    const pkSession = loadPasskeySession();
    if (pkSession) {
      setAddress(pkSession.contractId);
      setWalletType("passkey");
      setPasskeyKeyId(pkSession.keyIdBase64);
      setAuthStatus("ready");
      fetchStoreName(pkSession.contractId);
      return;
    }

    // 2. Classic wallet (Freighter/Albedo)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { walletId, addr } = JSON.parse(saved) as { walletId: string; addr: string };
      buildKit(walletId)
        .then(async (kit) => {
          try {
            const { address: live } = await kit.getAddress();
            const finalAddr = live ?? addr;
            setAddress(finalAddr);
            setWalletType(walletId as WalletType);
            fetchStoreName(finalAddr);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        })
        .catch(() => localStorage.removeItem(STORAGE_KEY))
        .finally(() => setAuthStatus("ready"));
      return;
    }

    // 3. Privy session — wait for Privy to initialize (handled in effect below)
    if (localStorage.getItem(PRIVY_STORAGE_KEY)) return;

    setAuthStatus("ready");
  }, []);

  // Fetch store name from backend after wallet connects
  const fetchStoreName = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/merchant/profile?address=${encodeURIComponent(addr)}`);
      const { merchant } = await res.json();
      // null = sudah fetch, tidak ada store name → redirect ke onboarding
      setStoreName(merchant?.store_name ?? null);
    } catch {
      setStoreName(null);
    }
  }, []);

  // Fund & add USDC trustline for a newly created Privy Stellar wallet
  const setupPrivyAccount = useCallback(async (stellarAddress: string) => {
    try {
      const prepRes = await fetch("/api/onboard-privy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: stellarAddress }),
      });
      const prep = await prepRes.json();
      if (prep.alreadySetup) return;
      if (!prep.xdr || !prep.txHash) return;

      // Sign the changeTrust transaction hash with Privy
      const { signature } = await signRawHash({
        address: stellarAddress,
        chainType: "stellar" as any,
        hash: `0x${prep.txHash}` as `0x${string}`,
      });

      // Submit the signed transaction via our server
      await fetch("/api/onboard-privy/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xdr: prep.xdr, address: stellarAddress, signature }),
      });
    } catch (e) {
      console.warn("Privy account setup failed (non-fatal):", e);
    }
  }, [signRawHash]);

  // Privy session restore — runs when Privy finishes initializing
  useEffect(() => {
    if (!privyReady) return;
    const hasPrivyFlag = !!localStorage.getItem(PRIVY_STORAGE_KEY);

    if (!authenticated || !user) {
      // Was previously authenticated but session expired → clean up
      if (hasPrivyFlag) {
        localStorage.removeItem(PRIVY_STORAGE_KEY);
        setAuthStatus("ready");
      }
      return;
    }
    if (!hasPrivyFlag) return; // Not a Privy session
    if (privyHandled.current) return; // Already processed this session
    privyHandled.current = true;

    // Find existing Stellar wallet in linked accounts
    const stellarWallet = (user.linkedAccounts ?? []).find(
      (acc: any) => acc.type === "wallet" && acc.chainType === "stellar"
    ) as any;

    if (stellarWallet?.address) {
      const addr = stellarWallet.address as string;
      setAddress(addr);
      setWalletType("privy");
      setAuthStatus("ready");
      setupPrivyAccount(addr);
      fetchStoreName(addr);
    } else {
      // Auto-create Stellar wallet for new Privy users
      createWallet({ chainType: "stellar" } as any)
        .then(async ({ wallet }: any) => {
          const addr = wallet.address as string;
          setAddress(addr);
          setWalletType("privy");
          await setupPrivyAccount(addr);
          fetchStoreName(addr);
        })
        .catch(() => {/* wallet might already exist; effect re-runs via user change */})
        .finally(() => setAuthStatus("ready"));
    }
  }, [privyReady, authenticated, user?.id]);

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
      fetchStoreName(addr);
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
              throw new Error(err.error ?? "Failed to deploy smart wallet");
            }
          }

          // Persist session
          savePasskeySession({ contractId, keyIdBase64 });
          localStorage.removeItem(STORAGE_KEY); // clear classic session

          setAddress(contractId);
          setWalletType("passkey");
          setPasskeyKeyId(keyIdBase64);
          fetchStoreName(contractId);
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
        fetchStoreName(contractId);
        return contractId;
      } finally {
        setAuthStatus("ready");
      }
    },
    []
  );

  // ─── Connect via Privy (email / Google) ──────────────────────────────────────

  const connectPrivy = useCallback(async (): Promise<void> => {
    setAuthStatus("connecting");
    // Clear other sessions so Privy takes over
    clearPasskeySession();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(PRIVY_STORAGE_KEY, "1");
    privyHandled.current = false; // allow the effect to run again

    try {
      await login(); // opens Privy auth modal; resolves after user authenticates
      // The Privy session effect will pick up `authenticated=true` and create/fetch wallet
    } catch {
      localStorage.removeItem(PRIVY_STORAGE_KEY);
      setAuthStatus("ready");
      throw new Error("Login failed or cancelled");
    }
    // Safety timeout: if Privy effect didn't resolve in 10s, reset status
    setTimeout(() => setAuthStatus((s) => (s === "connecting" ? "ready" : s)), 10_000);
  }, [login]);

  // ─── Disconnect ──────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (walletType === "privy") {
      try { await logout(); } catch { /* ignore */ }
      localStorage.removeItem(PRIVY_STORAGE_KEY);
      privyHandled.current = false;
    } else if (walletType !== "passkey") {
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
    setStoreName(undefined);
  }, [walletType, logout]);

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
        if (!res.ok) throw new Error("Submission via Launchtube failed");
        const data = await res.json();
        return data.hash ?? signedXdr;
      }

      if (walletType === "privy") {
        // Parse XDR → hash → sign dengan Privy signRawHash → rekonstruksi signed XDR
        const { TransactionBuilder } = await import("@stellar/stellar-sdk");
        const tx = TransactionBuilder.fromXDR(xdr, TESTNET_PASSPHRASE) as any;
        const hashHex = (tx.hash() as Buffer).toString("hex");

        const { signature } = await signRawHash({
          address,
          chainType: "stellar" as any,
          hash: `0x${hashHex}` as `0x${string}`,
        });

        const sigHex = (signature as string).startsWith("0x")
          ? (signature as string).slice(2)
          : (signature as string);
        const sigBase64 = Buffer.from(sigHex, "hex").toString("base64");

        tx.addSignature(address, sigBase64);
        return tx.toEnvelope().toXDR("base64");
      }

      // Classic wallet (Albedo / Freighter)
      const kit = await buildKit();
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
        address,
      });
      return signedTxXdr;
    },
    [address, walletType, passkeyKeyId, signRawHash]
  );

  // ─── Derived values ───────────────────────────────────────────────────────────

  const isConnected = !!address;
  const isPasskey = walletType === "passkey";

  const privyEmailRaw = walletType === "privy"
    ? (user?.email?.address ?? (user as any)?.google?.email
        ?? ((user?.linkedAccounts ?? []).find((a: any) => a.type === "google_oauth") as any)?.email
        ?? null)
    : null;
  const userInitial = privyEmailRaw
    ? privyEmailRaw.split("@")[0].split(/[.\-_]/).filter(Boolean).map((s: string) => s[0].toUpperCase()).join("").slice(0, 2)
    : (address ? address.slice(0, 2).toUpperCase() : "?");

  return (
    <WalletContext.Provider
      value={{
        address,
        walletType,
        isConnected,
        isPasskey,
        userInitial,
        authStatus,
        storeName,
        setStoreName,
        connect,
        connectPasskey,
        connectPrivy,
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
