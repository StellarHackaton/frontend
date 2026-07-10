import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // passkey-kit ships TypeScript source — must transpile
  transpilePackages: ["passkey-kit", "passkey-kit-sdk", "sac-sdk"],

  // Tree-shake large packages — only import what's actually used
  experimental: {
    optimizePackageImports: [
      "@privy-io/react-auth",
      "@stellar/stellar-sdk",
      "@creit.tech/stellar-wallets-kit",
      "framer-motion",
    ],
  },

  webpack: (config, { dev }) => {
    // ── Fix: passkey-kit's nested @stellar/stellar-sdk wrong relative path ────────
    const nestedStellarRoot = path.resolve(
      __dirname,
      "node_modules/passkey-kit/node_modules/@stellar/stellar-sdk"
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.join(nestedStellarRoot, "lib", "package.json")]:
        path.join(nestedStellarRoot, "package.json"),
    };

    // ── Privy optional peer deps we don't use — stub them out ────────────────────
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": false,
      "@farcaster/frame-sdk": false,
      "@solana/web3.js": false,
      // WalletConnect / Reown — pulled in by Privy but we don't use it
      "@reown/appkit": false,
      "@walletconnect/core": false,
    };

    // ── Node.js module shims for browser bundle ───────────────────────────────────
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };

    if (dev) {
      // Polling — diperlukan di Windows untuk deteksi perubahan file
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 200,
        ignored: ["**/node_modules/**", "**/.next/**"],
      };
    }

    return config;
  },
};

export default nextConfig;
