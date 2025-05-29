import { retry, wait } from "./retry";
import {
  Finality,
  TransactionExpiredBlockheightExceededError,
  VersionedTransactionResponse,
} from "@solana/web3.js";

import { BlockhashWithExpiryBlockHeight, Connection } from "@solana/web3.js";

const sendOptions = {
  skipPreflight: true,
};
const intervalResendMs = 2_000;
const intervalGetConfirmation = 1_000;
const limitGetConfirmation = 3;

export type TransactionSenderAndConfirmationWaiterArgs = {
  connection: Connection;
  serializedTransaction: string; // Base64 string
  blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight;
  commitment?: Finality;
};

export const sendTransaction = async (
  params: TransactionSenderAndConfirmationWaiterArgs
): Promise<VersionedTransactionResponse | null> => {
  try {
    return await transactionSenderAndConfirmationWaiter(params);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const sendTransactionWithRetry = async (
  params: TransactionSenderAndConfirmationWaiterArgs,
  attempts: number
): Promise<VersionedTransactionResponse | null> => {
  try {
    const res = await retry(
      () => transactionSenderAndConfirmationWaiter(params),
      intervalResendMs,
      attempts
    );
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const transactionSenderAndConfirmationWaiter = async ({
  connection,
  serializedTransaction,
  blockhashWithExpiryBlockHeight,
  commitment,
}: TransactionSenderAndConfirmationWaiterArgs): Promise<VersionedTransactionResponse | null> => {
  const txBuffer = Buffer.from(serializedTransaction, "base64");

  const txid = await connection.sendRawTransaction(txBuffer, sendOptions);

  const controller = new AbortController();
  const abortSignal = controller.signal;

  const abortableResender = async () => {
    while (true) {
      await wait(intervalResendMs);
      if (abortSignal.aborted) return;
      try {
        await connection.sendRawTransaction(txBuffer, sendOptions);
      } catch (e) {
        console.warn(`Failed to resend transaction: ${e}`);
      }
    }
  };

  try {
    abortableResender(); // Ensure the function is awaited
    const lastValidBlockHeight =
      blockhashWithExpiryBlockHeight.lastValidBlockHeight - 150;

    // this would throw TransactionExpiredBlockheightExceededError
    await Promise.race([
      connection.confirmTransaction(
        {
          ...blockhashWithExpiryBlockHeight,
          lastValidBlockHeight,
          signature: txid,
          abortSignal,
        },
        "confirmed"
      ),
      new Promise(async (resolve) => {
        // in case ws socket died
        while (!abortSignal.aborted) {
          await wait(2_000);
          const tx = await connection.getSignatureStatus(txid, {
            searchTransactionHistory: false,
          });
          if (
            tx?.value?.confirmationStatus == "confirmed" ||
            tx?.value?.confirmationStatus == "finalized"
          ) {
            resolve(tx);
          } else if (tx?.value?.err) {
            console.error(tx?.value?.err);
            throw Error("Send transaction error");
          }
          console.log("get tx", tx);
        }
      }),
    ]);
  } catch (e) {
    if (e instanceof TransactionExpiredBlockheightExceededError) {
      // Throw error
      throw e;
    } else {
      // Failed; no need to retry here
      return null;
    }
  } finally {
    controller.abort();
  }

  // in case rpc is not synced yet, we add some retries
  const response = await retry(
    async () => {
      const response = await connection.getTransaction(txid, {
        commitment,
        maxSupportedTransactionVersion: 0,
      });
      if (!response) {
        throw Error("Error get transaction confirmation");
      }
      return response;
    },
    intervalGetConfirmation,
    limitGetConfirmation
  );

  if (response.meta?.err) {
    console.error(
      `Tx Signature: ${response.transaction?.signatures?.[0]}`,
      response.meta.err
    );
    return null;
  }

  return response;
};
