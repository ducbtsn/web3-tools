import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { sendTransaction } from "./send-transaction";

export const transferNativeToken = async (
  keypair: Keypair,
  toAddress: string,
  amount: number,
  connection: Connection
): Promise<boolean> => {
  try {
    const transferIx = SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    });

    const blockhash = await connection
      .getLatestBlockhash({ commitment: "max" })
      .then((res) => res.blockhash);
    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(keypair.publicKey),
      recentBlockhash: blockhash,
      instructions: [transferIx],
    }).compileToV0Message();

    const transferTx = new VersionedTransaction(messageV0);

    transferTx.sign([keypair]);

    const simulateResult = await connection.simulateTransaction(transferTx);
    if (simulateResult?.value?.err) {
      throw new Error("Failed to simulate transaction");
    }

    const serializedTransaction = transferTx.serialize();
    const base64EncodedTransaction = Buffer.from(
      serializedTransaction
    ).toString("base64");

    const blockhashWithExpiryBlockHeight = await connection.getLatestBlockhash({
      commitment: "max",
    });

    const signature = await sendTransaction({
      connection,
      serializedTransaction: base64EncodedTransaction,
      blockhashWithExpiryBlockHeight,
      commitment: "confirmed",
    });

    console.log("Transaction signature:", signature);

    return !!signature;
  } catch (error) {
    console.error("Error during token transfer:", error);
    return false;
  }
};
