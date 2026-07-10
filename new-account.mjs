import * as StellarSdk from "@stellar/stellar-sdk";
import StellarHDWallet from "stellar-hd-wallet";

const USDC_ISSUER   = "GDUTNTK3AA5RUV3QCFYD3REH4MP7ET6BMIRYH5NGI6SOY6HZUPCINXZ3";
const ISSUER_SECRET = "SDRIHJPCFMJUFRPZCLWB3TNBBVO7YR4TUHZ5ZKOZVUTUWEGEYC76DXOR";
const horizon       = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

// 1. Generate mnemonic + keypair
const mnemonic = StellarHDWallet.generateMnemonic();
const wallet   = StellarHDWallet.fromMnemonic(mnemonic);
const kp       = StellarSdk.Keypair.fromSecret(wallet.getSecret(0));

console.log("========================================");
console.log("RECOVERY PHRASE (import ke Freighter):");
console.log(mnemonic);
console.log("========================================");
console.log("Public key:", kp.publicKey());

// 2. Fund via friendbot
console.log("\nFunding...");
await fetch(`https://friendbot.stellar.org?addr=${kp.publicKey()}`);
await new Promise(r => setTimeout(r, 3000));

// 3. Add USDC trustline
console.log("Adding USDC trustline...");
const account = await horizon.loadAccount(kp.publicKey());
const trustTx = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET,
})
  .addOperation(StellarSdk.Operation.changeTrust({
    asset: new StellarSdk.Asset("USDC", USDC_ISSUER),
  }))
  .setTimeout(30)
  .build();
trustTx.sign(kp);
await horizon.submitTransaction(trustTx);

// 4. Send 100 USDC dari issuer
console.log("Sending 100 USDC...");
const issuerKp  = StellarSdk.Keypair.fromSecret(ISSUER_SECRET);
const issuerAcc = await horizon.loadAccount(issuerKp.publicKey());
const sendTx = new StellarSdk.TransactionBuilder(issuerAcc, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET,
})
  .addOperation(StellarSdk.Operation.payment({
    destination: kp.publicKey(),
    asset: new StellarSdk.Asset("USDC", USDC_ISSUER),
    amount: "100",
  }))
  .setTimeout(30)
  .build();
sendTx.sign(issuerKp);
await horizon.submitTransaction(sendTx);

console.log("\n========================================");
console.log("SELESAI! Account siap dipakai.");
console.log("Public key :", kp.publicKey());
console.log("USDC balance: 100 USDC testnet");
console.log("\nRECOVERY PHRASE (import ke Freighter):");
console.log(mnemonic);
console.log("========================================");
