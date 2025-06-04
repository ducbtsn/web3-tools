import { SuiClient } from "@mysten/sui/client";
import { SuilendClient } from "@suilend/sdk/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const getObligationOwnerCaps = async (
  suiClient: SuiClient,
  lendingMarketType: string,
  keypair: Ed25519Keypair
): Promise<any> => {
  const tx = new Transaction();
  const ownerCapIds = await SuilendClient.getObligationOwnerCaps(
    keypair.getPublicKey().toSuiAddress(),
    [lendingMarketType],
    suiClient
  );
  return ownerCapIds;
};
