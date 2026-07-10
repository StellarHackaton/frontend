import * as StellarSdk from "@stellar/stellar-sdk";

const ISSUER_SECRET = "SDRIHJPCFMJUFRPZCLWB3TNBBVO7YR4TUHZ5ZKOZVUTUWEGEYC76DXOR";
const DESTINATION  = "GAYOVAQXABLG5CBBQARSZM3JQWFGZ2V7HFGBRTWFBYJB2QU5V5SYTVEG";
const AMOUNT       = "100"; // 100 USDC testnet

const issuerKp = StellarSdk.Keypair.fromSecret(ISSUER_SECRET);
const USDC     = new StellarSdk.Asset("USDC", issuerKp.publicKey());
const horizon  = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

const account = await horizon.loadAccount(issuerKp.publicKey());
const tx = new StellarSdk.TransactionBuilder(account, {
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET,
})
  .addOperation(StellarSdk.Operation.payment({
    destination: DESTINATION,
    asset: USDC,
    amount: AMOUNT,
  }))
  .setTimeout(30)
  .build();

tx.sign(issuerKp);
const result = await horizon.submitTransaction(tx);
console.log(`Berhasil kirim ${AMOUNT} USDC ke ${DESTINATION}`);
console.log("TX:", result.hash);
