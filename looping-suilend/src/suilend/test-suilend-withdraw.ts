import { SuiClient } from "@mysten/sui/client";
import { getSignerFromPK } from "../utils/keypair";
import { getObligationOwnerCaps } from "../suilend/get_obligation";
import { SuilendClient } from "@suilend/sdk/client";
import { Transaction } from "@mysten/sui/transactions";

import * as dotenv from "dotenv";
import { signAndExecuteTransaction } from "../utils/transaction";
import { fetchallMarketData } from "../suilend/fetch-market-data";
import { fetchUserData } from "../suilend/fetch-user-data";
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

  const suilendClient = await SuilendClient.initialize(
    lendingMarketId,
    lendingMarketType,
    suiClient,
    true
  );

  const markets = await fetchallMarketData(suiClient);
  console.log(
    "Fetched market data for",
    Object.keys(markets).length,
    "markets"
  );
  console.log(markets);
  const userData = await fetchUserData(
    suiClient,
    keypair.getPublicKey().toSuiAddress(),
    markets
  );

  const tx = new Transaction();
  const coinObjects = [];
  for (const [marketId, data] of Object.entries(userData)) {
    console.log(`Market ID: ${marketId}`);
    console.log("Obligation Owner Caps:", data.obligationOwnerCaps);
    console.log("Obligations:", data.obligations);
    console.log("Reward Map:", data.rewardMap);

    if (data.obligations.length === 0) {
      console.log("No obligations found for the user in this market.");
      continue;
    }
    for (const obligation of data.obligations) {
      console.log(`Obligation ID: ${obligation.id}`);
      console.log("Deposits:", obligation.deposits);
      console.log("Borrows:", obligation.borrows);

      // Here you can add logic to withdraw from the obligation
      for (const deposit of obligation.deposits) {
        console.log(
          `Preparing to withdraw ${deposit.reserve.symbol}in obligation ${
            obligation.id
          }, amount ${deposit.depositedAmount.toString()}`
        );
        const ownerCapId = data.obligationOwnerCaps.find(
          (cap) => cap.obligationId === obligation.id
        )?.id;
        if (!ownerCapId) {
          console.log(
            `No owner cap found for obligation ${obligation.id}. Skipping withdrawal.`
          );
          continue;
        }
        const [withdrawCoin] = await suilendClient.withdraw(
          ownerCapId,
          obligation.id,
          deposit.reserve.coinType,
          deposit.depositedCtokenAmount.toString(),
          tx
        );
        coinObjects.push(withdrawCoin);
      }
    }
  }
  tx.transferObjects(coinObjects, keypair.getPublicKey().toSuiAddress());
  tx.setGasBudget(100000000); // Set a gas budget for the transaction

  const res = await signAndExecuteTransaction(tx, suiClient, keypair);

  console.log("Lending transaction result:", res);
};

main();
