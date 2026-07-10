import * as StellarSdk from "@stellar/stellar-sdk";

const SECRET = "SACOF5M7DQVQEQBCDRLE5T6H4A43SKHWBJLLIRNE6RSP7NPMU42F2LKX"; // ← paste secret key kamu di sini
const USDC_ISSUER = "GDUTNTK3AA5RUV3QCFYD3REH4MP7ET6BMIRYH5NGI6SOY6HZUPCINXZ3";

const kp = StellarSdk.Keypair.fromSecret(SECRET);
const horizon = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

console.log("Public key:", kp.publicKey());

const account = await horizon.loadAccount(kp.publicKey());
const tx = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET,
})
  .addOperation(StellarSdk.Operation.changeTrust({
    asset: new StellarSdk.Asset("USDC", USDC_ISSUER),
  }))
  .setTimeout(30)
  .build();

tx.sign(kp);
const result = await horizon.submitTransaction(tx);
console.log("Trustline berhasil! TX:", result.hash);
