import { SuiClient } from "@mysten/sui/client";
import { SuilendClient } from "@suilend/sdk/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { signAndExecuteTransaction } from "../utils/transaction";

export const borrow = async (
  suiClient: SuiClient,
  lendingMarketId: string,
  lendingMarketType: string,
  amount: bigint,
  coinType: string,
  obligationOwnerCapId: string,
  obligationId: string,
  keypair: Ed25519Keypair
): Promise<any> => {
  const suilendClient = await SuilendClient.initialize(
    lendingMarketId,
    lendingMarketType,
    suiClient,
    true
  );
  const tx = new Transaction();
  await suilendClient.borrow(
    obligationOwnerCapId,
    obligationId,
    coinType,
    amount.toString(),
    tx
  );
  return await signAndExecuteTransaction(tx, suiClient, keypair);
};
