"use client";

import { useState } from "react";
import {
  EVM_CHAINS,
  TOKEN_MESSENGER_V2,
  CCTP_FORWARDER_BYTES32,
  STELLAR_DOMAIN,
  encodeHookData,
  usdcToEvmUnits,
  MIN_FINALITY_THRESHOLD,
  MAX_FEE,
  type EvmChain,
} from "@/lib/cctp";

interface Props {
  amountUsdc: string;       // e.g. "10.00"
  merchantAddress: string;  // Stellar G... address
  orderId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

type Step = "idle" | "select-chain" | "connecting" | "approving" | "burning" | "attesting" | "completing" | "done";

const STEP_LABELS: Record<Step, string> = {
  idle: "",
  "select-chain": "Pilih chain",
  connecting: "Menghubungkan MetaMask…",
  approving: "Approve USDC…",
  burning: "Mengirim ke Stellar…",
  attesting: "Menunggu konfirmasi Circle (~30 detik)…",
  completing: "Meneruskan USDC ke merchant…",
  done: "Pembayaran berhasil!",
};

export function CctpCheckout({ amountUsdc, merchantAddress, orderId, onSuccess, onError }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [selectedChain, setSelectedChain] = useState<EvmChain | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const chains = Object.values(EVM_CHAINS);

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function getProvider() {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("MetaMask tidak terdeteksi. Install MetaMask dulu.");
    return eth;
  }

  async function switchChain(eth: any, chainId: number) {
    const hexId = "0x" + chainId.toString(16);
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
    } catch (e: any) {
      if (e.code === 4902) {
        // Chain not added yet — add it
        const chain = chains.find((c) => c.chainId === chainId)!;
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: hexId,
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: [chain.explorerUrl],
          }],
        });
      } else throw e;
    }
  }

  async function callContract(eth: any, account: string, to: string, data: string): Promise<string> {
    return eth.request({ method: "eth_sendTransaction", params: [{ from: account, to, data, gas: "0x55730" }] });
  }

  async function waitForReceipt(eth: any, hash: string): Promise<any> {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const receipt = await eth.request({ method: "eth_getTransactionReceipt", params: [hash] });
      if (receipt) return receipt;
    }
    throw new Error("Transaction tidak dikonfirmasi setelah 3 menit.");
  }

  // Encode a function call manually using viem-style ABI encoding (simple approach)
  function encodeApprove(spender: string, amount: bigint): string {
    // approve(address,uint256) selector = 0x095ea7b3
    const addr = spender.slice(2).padStart(64, "0");
    const amt = amount.toString(16).padStart(64, "0");
    return "0x095ea7b3" + addr + amt;
  }

  function encodeDepositForBurnWithHook(
    amount: bigint,
    destinationDomain: number,
    mintRecipient: string,
    burnToken: string,
    maxFee: bigint,
    minFinalityThreshold: number,
    hookData: string,
  ): string {
    // depositForBurnWithHook(uint256,uint32,bytes32,address,bytes32,uint256,uint32,bytes)
    // selector = keccak256("depositForBurnWithHook(uint256,uint32,bytes32,address,bytes32,uint256,uint32,bytes)")[0:4]
    const selector = "0x779b432d";

    const pad32 = (hex: string) => hex.replace(/^0x/, "").padStart(64, "0");
    const pad32n = (n: bigint) => n.toString(16).padStart(64, "0");
    const pad32i = (n: number) => n.toString(16).padStart(64, "0");

    // hookData is dynamic bytes — encode offset + length + data
    // Static params: amount(32) + domain(32) + mintRecipient(32) + burnToken(32)
    //                + destinationCaller(32) + maxFee(32) + minFinalityThreshold(32) + offset(32) = 8 * 32 = 256 bytes
    const hookHex = hookData.replace(/^0x/, "");
    const hookLen = hookHex.length / 2;
    const hookPadded = hookHex.padEnd(Math.ceil(hookLen / 32) * 64, "0");

    const offset = (8 * 32).toString(16).padStart(64, "0"); // 256 = 0x100
    const lenHex = hookLen.toString(16).padStart(64, "0");

    return (
      selector +
      pad32n(amount) +
      pad32i(destinationDomain) +
      pad32(mintRecipient) +
      pad32(burnToken) +
      "0".repeat(64) + // destinationCaller = bytes32(0)
      pad32n(maxFee) +
      pad32i(minFinalityThreshold) +
      offset +
      lenHex +
      hookPadded
    );
  }

  // ── Main payment flow ──────────────────────────────────────────────────────

  async function pay(chain: EvmChain) {
    setSelectedChain(chain);
    try {
      setStep("connecting");
      const eth = await getProvider();
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      if (!account) throw new Error("Tidak ada akun MetaMask yang terhubung.");

      await switchChain(eth, chain.chainId);

      const amount = usdcToEvmUnits(amountUsdc);
      const hookData = encodeHookData(merchantAddress);

      // Step 1: Approve TokenMessengerV2 to spend USDC + fee
      setStep("approving");
      const approveData = encodeApprove(TOKEN_MESSENGER_V2, amount + MAX_FEE);
      const approveTx = await callContract(eth, account, chain.usdcAddress, approveData);
      await waitForReceipt(eth, approveTx);

      // Step 2: depositForBurnWithHook
      setStep("burning");
      const burnData = encodeDepositForBurnWithHook(
        amount,
        STELLAR_DOMAIN,
        CCTP_FORWARDER_BYTES32,
        chain.usdcAddress,
        MAX_FEE,
        MIN_FINALITY_THRESHOLD,
        hookData,
      );
      const burnTx = await callContract(eth, account, TOKEN_MESSENGER_V2, burnData);
      setTxHash(burnTx);
      await waitForReceipt(eth, burnTx);

      // Step 3: Poll Circle attestation
      setStep("attesting");
      let message = "";
      let attestation = "";
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const res = await fetch(
          `/api/cctp/attest?txHash=${burnTx}&sourceDomain=${chain.domain}`
        );
        const data = await res.json();
        if (data.status === "complete") {
          message = data.message;
          attestation = data.attestation;
          break;
        }
      }
      if (!message) throw new Error("Attestation timeout — Circle testnet lambat, coba submit ulang manual.");

      // Step 4: Submit to Stellar via CctpForwarder
      setStep("completing");
      const completeRes = await fetch("/api/cctp/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, attestation, merchantAddress, orderId }),
      });
      const completeData = await completeRes.json();
      if (!completeData.success) throw new Error(completeData.error ?? "Gagal menyelesaikan pembayaran.");

      setStep("done");
      onSuccess();
    } catch (e: any) {
      setStep("idle");
      onError(e.message ?? "Pembayaran CCTP gagal.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (step === "idle" || step === "select-chain") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-[13px] text-muted">
          Bayar <strong className="text-ink">{amountUsdc} USDC</strong> dari chain lain
        </p>
        <div className="grid grid-cols-2 gap-2">
          {chains.map((chain) => (
            <button
              key={chain.chainId}
              onClick={() => pay(chain)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink/10 bg-paper px-3 py-3 text-center hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 active:scale-[.97] transition-all"
            >
              <ChainIcon name={chain.name} />
              <span className="text-[12px] font-semibold text-ink">{chain.name}</span>
              <span className="text-[10px] text-muted">USDC</span>
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted">
          Butuh MetaMask dengan USDC di chain yang dipilih
        </p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="text-3xl">✅</div>
        <p className="font-display text-[16px] font-semibold text-ink">Pembayaran berhasil!</p>
        <p className="text-[12px] text-muted">
          USDC sudah masuk ke merchant via CCTP dari {selectedChain?.name}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <Spinner />
      <p className="text-[14px] font-medium text-ink">{STEP_LABELS[step]}</p>
      {txHash && (
        <a
          href={`${selectedChain?.explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-indigo-500 underline"
        >
          Lihat di explorer
        </a>
      )}
      {step === "attesting" && (
        <p className="text-[11px] text-muted">
          Circle sedang memverifikasi burn transaction…
        </p>
      )}
    </div>
  );
}

function ChainIcon({ name }: { name: string }) {
  if (name.includes("Base")) return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
      <path d="M12 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" fill="white" />
      <circle cx="12" cy="12" r="4" fill="#0052FF" />
    </svg>
  );
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#627EEA" />
      <path d="M12 4v6.5l5.5 2.5L12 4z" fill="white" fillOpacity=".6" />
      <path d="M12 4L6.5 13l5.5-2.5V4z" fill="white" />
      <path d="M12 16.5v3.5l5.5-7.5L12 16.5z" fill="white" fillOpacity=".6" />
      <path d="M12 20v-3.5L6.5 12.5 12 20z" fill="white" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
