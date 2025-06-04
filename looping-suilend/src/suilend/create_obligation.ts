import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { initializeSuilend, initializeSuilendRewards } from "@suilend/sdk";
import { LENDING_MARKETS, SuilendClient } from "@suilend/sdk/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { signAndExecuteTransaction } from "../utils/transaction";

export const createObligation = async (
  suiClient: SuiClient,
  lendingMarketId: string,
  lendingMarketType: string,
  keypair: Ed25519Keypair
): Promise<any> => {
  const suilendClient = await SuilendClient.initialize(
    lendingMarketId,
    lendingMarketType,
    suiClient,
    true
  );
  const tx = new Transaction();
  suilendClient.createObligation(tx);
  const res = await signAndExecuteTransaction(tx, suiClient, keypair);
  console.log("createObligation res", res);
  console.log(res.objectChanges);
  if (
    !res.errors &&
    Array.isArray(res.objectChanges) &&
    res.objectChanges.length > 0
  ) {
    const obligationChange = res.objectChanges.find(
      (change) =>
        change.type === "created" &&
        change.objectType.includes(lendingMarketType)
    );
    return obligationChange;
  }
  return null;
};
