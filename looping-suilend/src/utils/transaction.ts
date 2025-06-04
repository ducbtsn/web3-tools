import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";

export const signAndExecuteTransaction = async (
  transaction: Transaction,
  suiClient: SuiClient,
  keypair: Ed25519Keypair
): Promise<SuiTransactionBlockResponse> => {
  const signedTx = await suiClient.signAndExecuteTransaction({
    transaction,
    signer: keypair,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });
  return signedTx;
};
