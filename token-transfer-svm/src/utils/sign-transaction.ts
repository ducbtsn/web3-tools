import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

export const signTransaction = async (
  transaction: VersionedTransaction,
  keypair: Keypair,
  connection: Connection
): Promise<string | null> => {
  try {
    transaction.sign([keypair]);

    const serializedTx = transaction.serialize();
    const base64EncodedTransaction =
      Buffer.from(serializedTx).toString("base64");

    return base64EncodedTransaction;
  } catch (error: any) {
    console.error("Error signing transaction:", error);
    return null;
  }
};
