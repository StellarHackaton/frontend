// Mock data for the UI prototype. No Stellar wiring yet — see CLAUDE_Lunas_Stellar.md
// for the real money-layer (path payment) + registry-layer (Soroban) design.

export type OrderStatus = "paid" | "pending";

export interface MockOrder {
  id: string;
  item: string;
  time: string;
  amount: string;
  status: OrderStatus;
}

export const orders: MockOrder[] = [
  { id: "o1", item: "Sunset print A3", time: "2m ago", amount: "$5.00", status: "paid" },
  { id: "o2", item: "Coffee subscription", time: "18m ago", amount: "$12.00", status: "pending" },
  { id: "o3", item: "Sticker pack", time: "1h ago", amount: "$3.00", status: "paid" },
  { id: "o4", item: "Logo design", time: "3h ago", amount: "$40.00", status: "paid" },
  { id: "o5", item: "Zine preorder", time: "Yesterday", amount: "$8.00", status: "pending" },
];

// A "balance" is a friendly money name the buyer can pay with. The crypto asset
// behind it (USDC/EURC/PYUSD/XLM) is never surfaced — see North Star §1.
export interface Balance {
  key: string;
  name: string;
  emoji: string;
  approx: string;
  enabled: boolean;
  helper?: string;
}

export const balances: Balance[] = [
  { key: "euro", name: "Euro", emoji: "💶", approx: "≈ €4.60", enabled: true },
  { key: "dollar", name: "Dollar", emoji: "💵", approx: "≈ $5.00", enabled: true },
  { key: "paypal", name: "PayPal Dollar", emoji: "💳", approx: "≈ $5.02", enabled: true },
  {
    key: "stellar",
    name: "Stellar Balance",
    emoji: "🪙",
    approx: "",
    enabled: false,
    helper: "Short by Rp19,000",
  },
];

export interface MockProduct {
  slug: string;
  name: string;
  seller: string;
  sellerInitial: string;
  priceUSD: number;
}

export const product: MockProduct = {
  slug: "sunset-a3",
  name: "Sunset print A3",
  seller: "Studio Mawar",
  sellerInitial: "M",
  priceUSD: 5,
};

// Catalog for the Products screen.
export interface CatalogProduct {
  slug: string;
  name: string;
  priceUSD: number;
  paid: number;
}

export const products: CatalogProduct[] = [
  { slug: "sunset-a3", name: "Sunset print A3", priceUSD: 5, paid: 3 },
  { slug: "coffee-subscription", name: "Coffee subscription", priceUSD: 12, paid: 0 },
  { slug: "sticker-pack", name: "Sticker pack", priceUSD: 3, paid: 9 },
  { slug: "logo-design", name: "Logo design", priceUSD: 40, paid: 1 },
  { slug: "zine-preorder", name: "Zine preorder", priceUSD: 8, paid: 0 },
];

// Merchant profile shown on the Settings screen.
export const merchant = {
  name: "Anya Rahmadi",
  business: "Studio Mawar",
  initial: "A",
  joined: "Jun 2026",
  payoutBalance: "$240.00",
};
