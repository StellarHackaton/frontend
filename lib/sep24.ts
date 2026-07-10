/**
 * SEP-10 + SEP-24 withdrawal helper.
 *
 * Flow:
 * 1. Fetch anchor TOML → get TRANSFER_SERVER_SEP0024 + WEB_AUTH_ENDPOINT
 * 2. SEP-10: GET challenge XDR → sign with merchant key → POST → get JWT
 * 3. SEP-24: POST /transactions/withdraw/interactive → get interactive URL
 * 4. Caller opens the URL in a new tab
 */

import * as StellarSdk from "@stellar/stellar-sdk";

export interface AnchorInfo {
  transferServer: string;
  webAuthEndpoint: string;
  networkPassphrase: string;
}

async function fetchToml(anchorDomain: string): Promise<AnchorInfo> {
  const url = `https://${anchorDomain}/.well-known/stellar.toml`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot fetch TOML from ${anchorDomain}`);
  const text = await res.text();

  const get = (key: string) => {
    const m = text.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"));
    return m?.[1] ?? null;
  };

  const transferServer = get("TRANSFER_SERVER_SEP0024");
  const webAuthEndpoint = get("WEB_AUTH_ENDPOINT");
  const networkPassphrase = get("NETWORK_PASSPHRASE") ?? StellarSdk.Networks.TESTNET;

  if (!transferServer || !webAuthEndpoint) {
    throw new Error(`${anchorDomain} does not advertise SEP-24 endpoints in TOML`);
  }

  return { transferServer, webAuthEndpoint, networkPassphrase };
}

async function sep10Auth(
  info: AnchorInfo,
  address: string,
  signXdr: (xdr: string) => Promise<string>
): Promise<string> {
  // 1. GET challenge
  const challengeRes = await fetch(
    `${info.webAuthEndpoint}?account=${address}&memo=0`
  );
  if (!challengeRes.ok) throw new Error("SEP-10 challenge request failed");
  const { transaction: challengeXdr, network_passphrase } = await challengeRes.json();

  if (
    network_passphrase &&
    network_passphrase !== info.networkPassphrase
  ) {
    throw new Error("Network passphrase mismatch");
  }

  // 2. Sign challenge XDR
  const signedXdr = await signXdr(challengeXdr);

  // 3. POST signed XDR → get JWT
  const tokenRes = await fetch(info.webAuthEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: signedXdr }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(err.error ?? "SEP-10 token request failed");
  }
  const { token } = await tokenRes.json();
  if (!token) throw new Error("No JWT token returned by anchor");
  return token;
}

export async function startSep24Withdrawal(
  anchorDomain: string,
  address: string,
  signXdr: (xdr: string) => Promise<string>,
  amountUsd?: string
): Promise<string> {
  const info = await fetchToml(anchorDomain);
  const jwt = await sep10Auth(info, address, signXdr);

  const body: Record<string, string> = {
    asset_code: "USDC",
    account: address,
  };
  if (amountUsd) body.amount = amountUsd;

  const url = `${info.transferServer}/transactions/withdraw/interactive`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "SEP-24 withdrawal initiation failed");
  }
  const data = await res.json();
  if (!data.url) throw new Error("No interactive URL returned by anchor");
  return data.url as string;
}

export const KNOWN_ANCHORS: { label: string; domain: string; net: "testnet" | "mainnet" }[] = [
  { label: "Test Anchor (Testnet)", domain: "testanchor.stellar.org", net: "testnet" },
  { label: "MoneyGram (Mainnet)", domain: "extstellar.moneygram.com", net: "mainnet" },
];
