"use client";

import type { PasskeyKit } from "passkey-kit";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

// Testnet smart wallet WASM hash (SDF's deployed factory)
const WALLET_WASM_HASH =
  process.env.NEXT_PUBLIC_PASSKEY_WASM_HASH ??
  "ecd990f0b45ca6817149b6175f79b32efb442f35731985a084131e8265c4cd90";

let _kit: PasskeyKit | null = null;

export async function getPasskeyKit(): Promise<PasskeyKit> {
  if (_kit) return _kit;
  const { PasskeyKit } = await import("passkey-kit");
  _kit = new PasskeyKit({
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    walletWasmHash: WALLET_WASM_HASH,
  });
  return _kit;
}

export const PASSKEY_STORAGE_KEY = "lunas_passkey";

export interface PasskeySession {
  contractId: string;
  keyIdBase64: string;
}

export function loadPasskeySession(): PasskeySession | null {
  try {
    const raw = localStorage.getItem(PASSKEY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PasskeySession;
  } catch {
    return null;
  }
}

export function savePasskeySession(session: PasskeySession): void {
  localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(session));
}

export function clearPasskeySession(): void {
  localStorage.removeItem(PASSKEY_STORAGE_KEY);
}
