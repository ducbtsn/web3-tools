import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import bs58 from "bs58";

export const generateWallets = (count: number): Keypair[] => {
  const wallets: Keypair[] = [];
  for (let i = 0; i < count; i++) {
    wallets.push(Keypair.generate());
  }
  return wallets;
};

export const exportWallets = (fileName: string, walletCount: number) => {
  const wallets = generateWallets(walletCount);
  const csvHeader = "Wallet Address,Private Key";
  const csvData = wallets
    .map(
      (wallet) =>
        `${wallet.publicKey.toBase58()},${bs58.encode(wallet.secretKey)}`
    )
    .join("\n");
  fs.writeFileSync(fileName, `${csvHeader}\n${csvData}`, "utf-8");
};

exportWallets("wallets.csv", 100);
