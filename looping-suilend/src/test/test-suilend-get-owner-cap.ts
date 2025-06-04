import { SuiClient } from "@mysten/sui/client";
import * as dotenv from "dotenv";
import { getSignerFromPK } from "../utils/keypair";
import { getObligationOwnerCaps } from "../suilend/get_obligation";

dotenv.config();

const main = async () => {
  const suiClient = new SuiClient({
    url: process.env.RPC_URL || "https://fullnode.mainnet.sui.io",
  });
  const keypair = getSignerFromPK(process.env.SUI_PRIVATE_KEY || "");
  const lendingMarketType = process.env.SUILEND_MAIN_MARKET_TYPE || "";
  console.log("Lending Market Type:", lendingMarketType);
  console.log("Keypair Address:", keypair.getPublicKey().toSuiAddress());
  const res = await getObligationOwnerCaps(
    suiClient,
    lendingMarketType,
    keypair
  );
  console.log("Get obligation owner caps result:", res);
};

main();
