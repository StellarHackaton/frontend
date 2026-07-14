"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "id";

const STORAGE_KEY = "lunas.lang";

// Flat, namespaced dictionary. Default is always English — Indonesian is an
// opt-in switch from Settings, never the starting language.
const dict = {
  en: {
    "login.tagline": "Get paid in any balance. Receive exact dollars.",
    "login.easiest": "Easiest — no wallet needed",
    "login.emailCta": "Continue with Email",
    "login.opening": "Opening…",
    "login.emailHelper": "Sign in with email or Google. Your Stellar wallet is created automatically.",
    "login.or": "or use biometrics / wallet",
    "login.newUser": "For new users",
    "login.registerPasskey": "Sign up with Fingerprint",
    "login.preparing": "Preparing…",
    "login.loginPasskey": "Sign in with Fingerprint",
    "login.verifying": "Verifying…",
    "login.passkeyHelper": "No crypto knowledge needed. Just touch your fingerprint.",
    "login.haveWallet": "Already have a Stellar wallet",
    "login.connectWallet": "Connect Wallet",
    "login.connectWalletFull": "Connect Wallet (Albedo / Freighter)",
    "login.connecting": "Connecting…",
    "login.albedoHelper": "no install, opens in browser.",
    "login.freighterHelper": "if you already have the extension.",
    "login.terms": "By continuing, you agree to Lunas' Terms & Conditions.",
    "login.errWallet": "Wallet connection failed. Try again.",
    "login.errPasskey": "Passkey failed. Try again.",
    "login.errEmail": "Email sign-in failed. Try again.",

    "settings.language": "Language",
    "settings.storeName": "Store name",
    "settings.save": "Save",
    "settings.cancel": "Cancel",
    "settings.wallet": "Wallet",
    "settings.walletAddress": "Wallet address",
    "settings.memberSince": "Member since",
    "settings.payoutBalance": "Payout balance",
    "settings.receives": "Receives",
    "settings.network": "Network",
    "settings.storeStatus": "Store status",
    "settings.verified": "Verified",
    "settings.verifyStore": "Verify store",
    "settings.close": "Close",
    "settings.stakeInstructions": "Send exactly 10 USDC to the address below, then enter the TX hash.",
    "settings.txHashPlaceholder": "Stellar TX hash...",
    "settings.sendAndVerify": "Send & Verify",
    "settings.sendUsdcTitle": "Send USDC to Exchange / Wallet",
    "settings.sendUsdcSub": "Direct transfer via Stellar",
    "settings.send": "Send",
    "settings.step1": "Choose destination",
    "settings.step2GetAddress": "How to get a deposit address",
    "settings.step2GetAddressFrom": "Get a deposit address from",
    "settings.step3": "Fill in send details",
    "settings.freighterAddress": "Freighter address",
    "settings.depositAddress": "Deposit address",
    "settings.memo": "Memo",
    "settings.required": "Required",
    "settings.memoPlaceholder": "Memo number from the exchange",
    "settings.memoHelper": "Wrong memo = funds won't reach your account.",
    "settings.usdcAmount": "USDC amount",
    "settings.max": "Max",
    "settings.balance": "Balance",
    "settings.sentSuccess": "Sent successfully!",
    "settings.onWayTo": "USDC is on its way to",
    "settings.sendAgain": "Send again",
    "settings.sendUsdcTo": "Send USDC to",
    "settings.sending": "Sending…",
    "settings.errSend": "Failed to send USDC.",
    "settings.errVerify": "Verification failed.",
    "settings.errGeneric": "Something went wrong. Try again.",
    "settings.signOut": "Sign out",
    "settings.signOutConfirmTitle": "Sign out?",
    "settings.signOutConfirmBody": "You'll need to sign in again to access your dashboard.",

    "common.saving": "Saving…",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.errSave": "Failed to save",
    "common.errDelete": "Failed to delete",
    "common.linkCopied": "Link copied",
    "orders.amount": "Amount",
    "orders.paidWith": "Paid with",
    "orders.paidAt": "Paid at",
    "orders.noTransactions": "No transactions yet.",
    "orders.paidPrefix": "Paid",
    "orders.createdPrefix": "Created",
    "orders.emptyTitle": "No orders yet",
    "orders.emptyBody": "Share a payment link and your first order lands here.",
    "orders.item": "Item",
    "orders.time": "Time",
    "orders.status": "Status",
    "orders.viewQr": "View QR →",
    "nav.newProduct": "New product",

    "products.editTitle": "Edit product",
    "products.name": "Product name",
    "products.price": "Price (USD)",
    "products.deleteTitle": "Delete product?",
    "products.deleteBody": "will be permanently deleted. Existing orders are not affected.",
    "products.deleting": "Deleting…",
    "products.delete": "Delete",
    "products.deleteProduct": "Delete product",
    "products.edit": "Edit",
    "products.description": "Description",
    "products.optional": "optional",
    "products.emptyTitle": "No products yet",
    "products.emptyBody": "Add a product to your catalog. You can generate a payment QR anytime from an existing product.",
    "products.addProduct": "+ Add product",
    "products.noDescription": "No description yet",
    "products.soldSuffix": "x sold",
    "products.generateQR": "Generate QR",
    "products.errCreateQR": "Failed to create QR",

    "onboarding.title": "Name your store",
    "onboarding.subtitle": "This name is shown to buyers when they pay.",
    "onboarding.label": "Store name",
    "onboarding.placeholder": "e.g. Sunrise Coffee",
    "onboarding.continue": "Continue →",
    "onboarding.helper": "You can change this anytime in Settings",
    "onboarding.errEmpty": "Store name can't be empty",
    "onboarding.errShort": "At least 2 characters",
    "onboarding.errNoWallet": "Wallet not connected yet",

    "create.paymentType": "Payment type",
    "create.oneTime": "1× (custom)",
    "create.recurring": "Store (recurring)",
    "create.oneTimeHelperWeb": "One-time link for 1 buyer — great for freelancers.",
    "create.recurringHelperWeb": "Permanent product page — buyers can pay multiple times.",
    "create.oneTimeHelperMobile": "One-time link — great for custom client invoices.",
    "create.recurringHelperMobile": "Permanent link — buyers can pay repeatedly, great for store products.",
    "create.createPage": "Create product page",
    "create.createLink": "Create payment link",
    "create.creating": "Creating…",
    "create.saveToCatalog": "Save to catalog",
  },
  id: {
    "login.tagline": "Terima bayaran dalam bentuk apapun. Dapat dolar pas.",
    "login.easiest": "Cara termudah — tanpa wallet",
    "login.emailCta": "Masuk dengan Email",
    "login.opening": "Membuka…",
    "login.emailHelper": "Masuk pakai email atau Google. Wallet Stellar dibuat otomatis.",
    "login.or": "atau pakai biometrik / wallet",
    "login.newUser": "Untuk pengguna baru",
    "login.registerPasskey": "Daftar dengan Sidik Jari",
    "login.preparing": "Menyiapkan…",
    "login.loginPasskey": "Masuk dengan Sidik Jari",
    "login.verifying": "Memverifikasi…",
    "login.passkeyHelper": "Tidak perlu tahu crypto. Cukup sentuh sidik jari.",
    "login.haveWallet": "Sudah punya wallet Stellar",
    "login.connectWallet": "Hubungkan Wallet",
    "login.connectWalletFull": "Hubungkan Wallet (Albedo / Freighter)",
    "login.connecting": "Menghubungkan…",
    "login.albedoHelper": "tanpa install, buka di browser.",
    "login.freighterHelper": "jika sudah punya extension.",
    "login.terms": "Dengan masuk, kamu setuju dengan Syarat & Ketentuan Lunas.",
    "login.errWallet": "Koneksi wallet gagal. Coba lagi.",
    "login.errPasskey": "Passkey gagal. Coba lagi.",
    "login.errEmail": "Login email gagal. Coba lagi.",

    "settings.language": "Bahasa",
    "settings.storeName": "Nama toko",
    "settings.save": "Simpan",
    "settings.cancel": "Batal",
    "settings.wallet": "Wallet",
    "settings.walletAddress": "Alamat wallet",
    "settings.memberSince": "Bergabung sejak",
    "settings.payoutBalance": "Saldo",
    "settings.receives": "Diterima sebagai",
    "settings.network": "Jaringan",
    "settings.storeStatus": "Status toko",
    "settings.verified": "Terverifikasi",
    "settings.verifyStore": "Verifikasi toko",
    "settings.close": "Tutup",
    "settings.stakeInstructions": "Kirim tepat 10 USDC ke alamat berikut, lalu masukkan TX Hash di bawah.",
    "settings.txHashPlaceholder": "TX Hash Stellar...",
    "settings.sendAndVerify": "Kirim & Verifikasi",
    "settings.sendUsdcTitle": "Kirim USDC ke Exchange / Wallet",
    "settings.sendUsdcSub": "Transfer langsung via Stellar",
    "settings.send": "Kirim",
    "settings.step1": "Pilih tujuan pengiriman",
    "settings.step2GetAddress": "Cara dapat deposit address",
    "settings.step2GetAddressFrom": "Dapatkan deposit address dari",
    "settings.step3": "Isi detail pengiriman",
    "settings.freighterAddress": "Alamat Freighter",
    "settings.depositAddress": "Deposit Address",
    "settings.memo": "Memo",
    "settings.required": "Wajib diisi",
    "settings.memoPlaceholder": "Nomor memo dari exchange",
    "settings.memoHelper": "Salah memo = dana tidak masuk ke akunmu.",
    "settings.usdcAmount": "Jumlah USDC",
    "settings.max": "Maks",
    "settings.balance": "Saldo",
    "settings.sentSuccess": "Berhasil Dikirim!",
    "settings.onWayTo": "USDC dalam perjalanan ke",
    "settings.sendAgain": "Kirim lagi",
    "settings.sendUsdcTo": "Kirim USDC ke",
    "settings.sending": "Mengirim…",
    "settings.errSend": "Gagal mengirim USDC.",
    "settings.errVerify": "Verifikasi gagal.",
    "settings.errGeneric": "Terjadi kesalahan. Coba lagi.",
    "settings.signOut": "Keluar",
    "settings.signOutConfirmTitle": "Keluar dari akun?",
    "settings.signOutConfirmBody": "Kamu perlu masuk lagi untuk mengakses dashboard.",

    "common.saving": "Menyimpan…",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.errSave": "Gagal menyimpan",
    "common.errDelete": "Gagal menghapus",
    "common.linkCopied": "Link disalin",
    "orders.amount": "Jumlah",
    "orders.paidWith": "Dibayar dengan",
    "orders.paidAt": "Waktu bayar",
    "orders.noTransactions": "Belum ada transaksi.",
    "orders.paidPrefix": "Dibayar",
    "orders.createdPrefix": "Dibuat",
    "orders.emptyTitle": "Belum ada pesanan",
    "orders.emptyBody": "Bagikan link pembayaran dan pesanan pertamamu akan muncul di sini.",
    "orders.item": "Item",
    "orders.time": "Waktu",
    "orders.status": "Status",
    "orders.viewQr": "Lihat QR →",
    "nav.newProduct": "Produk baru",

    "products.editTitle": "Edit produk",
    "products.name": "Nama produk",
    "products.price": "Harga (USD)",
    "products.deleteTitle": "Hapus produk?",
    "products.deleteBody": "akan dihapus permanen. Pesanan yang sudah ada tidak terpengaruh.",
    "products.deleting": "Menghapus…",
    "products.delete": "Hapus",
    "products.deleteProduct": "Hapus produk",
    "products.edit": "Edit",
    "products.description": "Deskripsi",
    "products.optional": "opsional",
    "products.emptyTitle": "Belum ada produk",
    "products.emptyBody": "Tambah produk ke katalog kamu. QR pembayaran bisa dibuat kapan saja dari produk yang sudah ada.",
    "products.addProduct": "+ Tambah produk",
    "products.noDescription": "Belum ada deskripsi",
    "products.soldSuffix": "x terjual",
    "products.generateQR": "Buat QR",
    "products.errCreateQR": "Gagal membuat QR",

    "onboarding.title": "Beri nama tokomu",
    "onboarding.subtitle": "Nama ini akan tampil ke buyer saat mereka melakukan pembayaran.",
    "onboarding.label": "Nama toko",
    "onboarding.placeholder": "contoh: Warung Kopi Maju",
    "onboarding.continue": "Lanjutkan →",
    "onboarding.helper": "Nama bisa diubah kapan saja di Settings",
    "onboarding.errEmpty": "Nama toko tidak boleh kosong",
    "onboarding.errShort": "Minimal 2 karakter",
    "onboarding.errNoWallet": "Wallet belum terkoneksi",

    "create.paymentType": "Tipe pembayaran",
    "create.oneTime": "1× (custom)",
    "create.recurring": "Toko (berulang)",
    "create.oneTimeHelperWeb": "Link sekali pakai untuk 1 buyer — cocok untuk freelancer.",
    "create.recurringHelperWeb": "Halaman produk permanen — buyer bisa bayar berkali-kali.",
    "create.oneTimeHelperMobile": "Link sekali pakai — cocok untuk invoice custom ke klien.",
    "create.recurringHelperMobile": "Link permanen — buyer bisa bayar berkali-kali, cocok untuk produk toko.",
    "create.createPage": "Buat halaman produk",
    "create.createLink": "Buat link pembayaran",
    "create.creating": "Membuat…",
    "create.saveToCatalog": "Simpan ke katalog",
  },
} as const;

export type Key = keyof typeof dict["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key) => string;
}

const LangCtx = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict.en[key] ?? key,
});

export function useLang() {
  return useContext(LangCtx);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);

  // Keep <html lang> in sync — screen readers and search crawlers rely on it,
  // and it never reflects the client-only language choice otherwise.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: Key) => dict[lang][key] ?? dict.en[key] ?? key;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}
