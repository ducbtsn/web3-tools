import fs from "fs";
import csvParser from "csv-parser";
import path from "path"; // Import path module
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { transferNativeToken } from "../utils/transfer-native-token";
import bs58 from "bs58"; // Import bs58 directly
import dotenv from "dotenv"; // Import dotenv

dotenv.config(); // Load environment variables

const BATCH_CSV_FILE = path.join(__dirname, "batch-transfers.csv"); // Resolve CSV file path relative to script folder
const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com"; // Read RPC URL from .env

const connection = new Connection(RPC_URL, "confirmed");

type TransferEntry = {
  secretKey: string;
  toAddress: string;
  amount: number;
};

const parseCsv = (filePath: string): Promise<TransferEntry[]> => {
  return new Promise((resolve, reject) => {
    const results: TransferEntry[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        results.push({
          secretKey: data.secretKey,
          toAddress: data.toAddress,
          amount: parseFloat(data.amount),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const executeBatchTransfers = async (entries: TransferEntry[]) => {
  for (const entry of entries) {
    try {
      const keypair = Keypair.fromSecretKey(
        bs58.decode(entry.secretKey) // Decode base58 secret key
      );
      const balance = await connection.getBalance(keypair.publicKey);
      console.log(
        `Current balance of from Address ${keypair.publicKey.toBase58()}: ${
          balance / LAMPORTS_PER_SOL
        } SOL`
      );
      const receiverBalance = await connection.getBalance(
        new PublicKey(entry.toAddress)
      );
      console.log(
        `Current balance of to Address ${entry.toAddress}: ${
          receiverBalance / LAMPORTS_PER_SOL
        } SOL`
      );
      // Check if the sender has enough balance
      if (balance < entry.amount * LAMPORTS_PER_SOL) {
        console.error(
          `Insufficient balance for transfer to ${entry.toAddress}.`
        );
        continue;
      }
      const success = await transferNativeToken(
        keypair,
        entry.toAddress,
        entry.amount,
        connection
      );

      if (success) {
        console.log(
          `Transfer to ${entry.toAddress} of ${entry.amount} SOL succeeded.`
        );
      } else {
        console.error(
          `Transfer to ${entry.toAddress} of ${entry.amount} SOL failed.`
        );
      }
    } catch (error) {
      console.error(`Error processing transfer to ${entry.toAddress}:`, error);
    }
  }
};

const main = async () => {
  try {
    const entries = await parseCsv(BATCH_CSV_FILE);
    console.log(`Parsed ${entries.length} entries from CSV.`);
    await executeBatchTransfers(entries);
  } catch (error) {
    console.error("Error in batch transfer script:", error);
  }
};

main();
