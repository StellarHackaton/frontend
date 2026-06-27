import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // passkey-kit and its companion packages ship TypeScript source — must transpile
  transpilePackages: ["passkey-kit", "passkey-kit-sdk", "sac-sdk"],

  webpack: (config, { dev }) => {
    // ── Fix: passkey-kit's nested @stellar/stellar-sdk has a wrong relative path ──
    // lib/minimal/bindings/config.js does require('../../package.json')
    // which resolves to lib/package.json (doesn't exist).
    // Alias it to the actual root package.json (3 levels up from bindings/).
    const nestedStellarRoot = path.resolve(
      __dirname,
      "node_modules/passkey-kit/node_modules/@stellar/stellar-sdk"
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.join(nestedStellarRoot, "lib", "package.json")]:
        path.join(nestedStellarRoot, "package.json"),
    };

    // ── Windows dev polling (fixes slow hot-reload on WSL/NTFS) ──────────────────
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.next/**"],
      };
    }

    // ── Node.js module shims for browser bundle ───────────────────────────────────
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };

    return config;
  },
};

export default nextConfig;
