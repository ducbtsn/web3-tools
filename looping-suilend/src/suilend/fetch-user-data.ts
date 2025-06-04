import { formatRewards, initializeObligations } from "@suilend/sdk";
import { AppData, UserData } from "./types";
import { SuiClient } from "@mysten/sui/client";

export const fetchUserData = async (
  suiClient: SuiClient,
  walletAddress: string,
  allLendingMarketData: Record<string, AppData>
) => {
  const result: Record<string, UserData> = {};

  for (const appData of Object.values(allLendingMarketData)) {
    const { obligations, obligationOwnerCaps } = await initializeObligations(
      suiClient,
      appData.suilendClient,
      appData.refreshedRawReserves,
      appData.reserveMap,
      walletAddress
    );
    const rewardMap = formatRewards(
      appData.reserveMap,
      appData.rewardCoinMetadataMap,
      appData.rewardPriceMap,
      obligations
    );

    result[appData.lendingMarket.id] = {
      obligationOwnerCaps,
      obligations,
      rewardMap,
    };
  }

  return result;
};
