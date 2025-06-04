import { SuiClient } from "@mysten/sui/client";
import { fetchallMarketData } from "../suilend/fetch-market-data";
import * as dotenv from "dotenv";
import { fetchUserData } from "../suilend/fetch-user-data";
import { getSignerFromPK } from "../utils/keypair";

dotenv.config();
const main = async () => {
  const suiClient = new SuiClient({
    url: process.env.RPC_URL || "https://fullnode.mainnet.sui.io",
  });
  const keypair = getSignerFromPK(process.env.SUI_PRIVATE_KEY || "");
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
  for (const [marketId, data] of Object.entries(userData)) {
    console.log(`Market ID: ${marketId}`);
    console.log("Obligation Owner Caps:", data.obligationOwnerCaps);
    console.log("Obligations:", data.obligations);
    console.log("Reward Map:", data.rewardMap);
  }
};

main();
