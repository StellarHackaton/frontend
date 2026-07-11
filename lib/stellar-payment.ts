const IS_MAINNET = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet";

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ??
  (IS_MAINNET ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org");

export const NETWORK_PASSPHRASE = IS_MAINNET
  ? "Public Global Stellar Network ; September 2015"
  : "Test SDF Network ; September 2015";

export const USDC_ISSUER =
  process.env.NEXT_PUBLIC_USDC_ISSUER ??
  (IS_MAINNET
    ? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    : "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");

export async function buildUsdcPaymentXdr(
  sourceAddress: string,
  destinationAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const { Asset, Account, Memo: MemoClass, Operation, TransactionBuilder } =
    await import("@stellar/stellar-sdk");

  const res = await fetch(`${HORIZON_URL}/accounts/${encodeURIComponent(sourceAddress)}`);
  if (!res.ok) throw new Error("Gagal fetch akun Stellar sumber");
  const data = await res.json();

  const account = new Account(data.id, data.sequence);
  const usdc = new Asset("USDC", USDC_ISSUER);

  const txBuilder = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.payment({ destination: destinationAddress, asset: usdc, amount }))
    .setTimeout(300);

  if (memo?.trim()) txBuilder.addMemo(MemoClass.text(memo.trim()));

  return txBuilder.build().toEnvelope().toXDR("base64");
}

export async function submitToHorizon(signedXdr: string): Promise<string> {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `tx=${encodeURIComponent(signedXdr)}`,
  });
  const data = await res.json();
  if (!res.ok) {
    const codes = data.extras?.result_codes;
    const detail = codes?.operations?.join(", ") ?? codes?.transaction ?? data.detail ?? "gagal";
    throw new Error(`Transaksi ditolak: ${detail}`);
  }
  return data.hash as string;
}

export const SEND_DESTINATIONS = [
  {
    id: "binance", name: "Binance",
    iconBg: "#F0B90B", iconText: "#fff", iconLabel: "B",
    brandColor: "#F0B90B", needsMemo: true,
    steps: [
      "Buka Binance → menu Dompet → Deposit",
      "Pilih koin USDC, lalu pilih jaringan Stellar",
      "Salin Deposit Address dan Memo ke form di bawah",
    ],
  },
  {
    id: "okx", name: "OKX",
    iconBg: "#000", iconText: "#fff", iconLabel: "OKX",
    brandColor: "#000", needsMemo: true,
    steps: [
      "Buka OKX → menu Aset → Deposit",
      "Cari dan pilih USDC, pilih jaringan Stellar",
      "Salin Deposit Address dan Memo ke form di bawah",
    ],
  },
  {
    id: "bybit", name: "Bybit",
    iconBg: "#F7A600", iconText: "#fff", iconLabel: "By",
    brandColor: "#F7A600", needsMemo: true,
    steps: [
      "Buka Bybit → menu Aset → Deposit",
      "Pilih USDC, pilih blockchain Stellar (XLM)",
      "Salin Deposit Address dan Memo ke form di bawah",
    ],
  },
  {
    id: "freighter", name: "Freighter",
    iconBg: "#5B4CDB", iconText: "#fff", iconLabel: "⬡",
    brandColor: "#5B4CDB", needsMemo: false,
    steps: [
      "Buka extension Freighter di browser",
      "Pastikan network sudah set ke Testnet",
      "Salin alamat G... kamu ke form di bawah",
    ],
  },
];

export type SendDestination = (typeof SEND_DESTINATIONS)[number];
