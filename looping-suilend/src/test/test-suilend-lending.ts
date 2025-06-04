import { SuiClient } from "@mysten/sui/client";
import { getSignerFromPK } from "../utils/keypair";
import { getObligationOwnerCaps } from "../suilend/get_obligation";
import { SuilendClient } from "@suilend/sdk/client";
import { Transaction } from "@mysten/sui/transactions";

import * as dotenv from "dotenv";
import { signAndExecuteTransaction } from "../utils/transaction";
dotenv.config();
const main = async () => {
  const suiClient = new SuiClient({
    url: process.env.RPC_URL || "https://fullnode.mainnet.sui.io",
  });

  // configuration
  const keypair = getSignerFromPK(process.env.SUI_PRIVATE_KEY_TEST || "");
  const lendingMarketId = process.env.SUILEND_MAIN_MARKET_ID || "";
  const lendingMarketType = process.env.SUILEND_MAIN_MARKET_TYPE || "";

  console.log("Lending Market ID:", lendingMarketId);
  console.log("Lending Market Type:", lendingMarketType);
  console.log("Keypair Address:", keypair.getPublicKey().toSuiAddress());
  const amount = BigInt(1000000000); // 1 SUI

  const suilendClient = await SuilendClient.initialize(
    lendingMarketId,
    lendingMarketType,
    suiClient,
    true
  );

  const obligationOwnerCapIds = await getObligationOwnerCaps(
    suiClient,
    lendingMarketType,
    keypair
  );

  const tx = new Transaction();

  let obligationOwnerCapId =
    obligationOwnerCapIds.length > 0 ? obligationOwnerCapIds[0].id : null;

  let didCreateObligation = false;
  if (obligationOwnerCapIds.length === 0) {
    console.log("No obligation owner caps found, creating a new obligation.");
    obligationOwnerCapId = suilendClient.createObligation(tx);
    didCreateObligation = true;
  }

  await suilendClient.depositIntoObligation(
    keypair.getPublicKey().toSuiAddress(),
    "0x2::sui::SUI",
    amount.toString(),
    tx,
    obligationOwnerCapId
  );

  if (didCreateObligation) {
    // If we created a new obligation, transfer to the user
    tx.transferObjects(
      [obligationOwnerCapId],
      keypair.getPublicKey().toSuiAddress()
    );
  }

  const res = await signAndExecuteTransaction(tx, suiClient, keypair);

  console.log("Lending transaction result:", res);
};

main();
