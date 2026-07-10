/**
 * CCTP v2 utilities — EVM burn → Stellar mint flow.
 *
 * Source chain:  Base Sepolia / Ethereum Sepolia  (EVM, buyer's wallet)
 * Dest chain:    Stellar Testnet                  (merchant receives USDC)
 *
 * Key contracts (testnet):
 *   TokenMessengerV2  (EVM, all testnets): 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
 *   CctpForwarder     (Stellar testnet):   CA66Q2WFBND6V4UEB7RD4SAXSVIWMD6RA4X3U32ELVFGXV5PJK4T4VSZ
 */

// ─── Chain configs ────────────────────────────────────────────────────────────

export interface EvmChain {
  name: string;
  chainId: number;
  domain: number;          // CCTP domain ID
  rpcUrl: string;
  usdcAddress: `0x${string}`;
  explorerUrl: string;
}

export const EVM_CHAINS: Record<string, EvmChain> = {
  "base-sepolia": {
    name: "Base Sepolia",
    chainId: 84532,
    domain: 6,
    rpcUrl: "https://sepolia.base.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    explorerUrl: "https://sepolia.basescan.org",
  },
  "eth-sepolia": {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    domain: 0,
    rpcUrl: "https://rpc.ankr.com/eth_sepolia",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    explorerUrl: "https://sepolia.etherscan.io",
  },
};

// ─── CCTP contract addresses (testnet) ───────────────────────────────────────

/** TokenMessengerV2 address — same on all EVM testnets */
export const TOKEN_MESSENGER_V2 = "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as const;

/** Stellar testnet domain ID */
export const STELLAR_DOMAIN = 27;

/** CctpForwarder Soroban contract ID on Stellar testnet */
export const CCTP_FORWARDER_CONTRACT = "CA66Q2WFBND6V4UEB7RD4SAXSVIWMD6RA4X3U32ELVFGXV5PJK4T4VSZ";

/**
 * bytes32 of CctpForwarder — used as mintRecipient in depositForBurnWithHook.
 * Derived by decoding the C... StrKey and stripping version+checksum bytes.
 */
export const CCTP_FORWARDER_BYTES32 =
  "0x3de86ac50b47eaf2840fe23e48179551660fd1072fba6f445d4a6bd7af4ab93e" as const;

/** Circle's USDC issuer on Stellar testnet (used by CCTP) */
export const CIRCLE_USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

/** Circle attestation API (sandbox = testnet) */
export const ATTESTATION_API = "https://iris-api-sandbox.circle.com";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

/** Minimal ERC-20 ABI — approve only */
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** TokenMessengerV2 ABI — depositForBurnWithHook only */
export const TOKEN_MESSENGER_V2_ABI = [
  {
    name: "depositForBurnWithHook",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

// ─── Encoding helpers ─────────────────────────────────────────────────────────

/**
 * Encode the merchant's Stellar address into CctpForwarder hookData.
 *
 * Layout (from stellar-cctp/contracts/cctp-forwarder/src/message.rs):
 *   [0..24]  magic = "cctp-forward" (12 bytes) + zero-padding to 24 bytes
 *   [24..28] version = uint32 BE = 0
 *   [28..32] length  = uint32 BE = byte length of recipient string
 *   [32..]   recipient = UTF-8 encoded Stellar address (G... / C... / M...)
 */
export function encodeHookData(merchantStellarAddress: string): `0x${string}` {
  const magic = "cctp-forward";
  const magicBytes = new TextEncoder().encode(magic);
  const magicPadded = new Uint8Array(24);
  magicPadded.set(magicBytes);

  const recipientBytes = new TextEncoder().encode(merchantStellarAddress);
  const version = new Uint8Array([0, 0, 0, 0]);

  const lenBuf = new ArrayBuffer(4);
  new DataView(lenBuf).setUint32(0, recipientBytes.length, false); // big-endian
  const lenBytes = new Uint8Array(lenBuf);

  const combined = new Uint8Array(
    magicPadded.length + version.length + lenBytes.length + recipientBytes.length
  );
  let offset = 0;
  combined.set(magicPadded, offset); offset += magicPadded.length;
  combined.set(version, offset);     offset += version.length;
  combined.set(lenBytes, offset);    offset += lenBytes.length;
  combined.set(recipientBytes, offset);

  return ("0x" + Array.from(combined).map((b) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;
}

/**
 * Convert USDC amount in dollars (string) to EVM uint256 (6 decimals).
 * e.g. "1.50" → 1_500_000n
 */
export function usdcToEvmUnits(amountUsd: string): bigint {
  const [whole, frac = ""] = amountUsd.split(".");
  const fracPadded = (frac + "000000").slice(0, 6);
  return BigInt(whole) * 1_000_000n + BigInt(fracPadded);
}

/** Fast transfer: minFinalityThreshold=0 + maxFee>0 → Circle attests in ~30s */
export const MIN_FINALITY_THRESHOLD = 0;
/** 0.01 USDC fee (10_000 units at 6 decimals) — paid to Circle attester */
export const MAX_FEE = 10_000n;
