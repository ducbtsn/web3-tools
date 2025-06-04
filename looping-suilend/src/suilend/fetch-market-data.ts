import { SuiClient } from "@mysten/sui/client";
import { initializeSuilend, initializeSuilendRewards } from "@suilend/sdk";
import { LENDING_MARKETS, SuilendClient } from "@suilend/sdk/client";
import { AllAppData, AppData } from "./types";

export const fetchallMarketData = async (
  suiClient: SuiClient
): Promise<Record<string, AppData>> => {
  const result: AllAppData["allLendingMarketData"] = {};
  for (const LENDING_MARKET of LENDING_MARKETS) {
    result[LENDING_MARKET.id] = await fetchMarketData(
      suiClient,
      LENDING_MARKET.id,
      LENDING_MARKET.type
    );
  }
  return result;
};

export const fetchMarketData = async (
  suiClient: SuiClient,
  lendingMarketId: string,
  lendingMarketType: string
): Promise<AppData> => {
  const suilendClient = await SuilendClient.initialize(
    lendingMarketId,
    lendingMarketType,
    suiClient,
    true
  );

  const {
    lendingMarket,
    coinMetadataMap,

    refreshedRawReserves,
    reserveMap,
    reserveCoinTypes,
    reserveCoinMetadataMap,

    rewardCoinTypes,
    activeRewardCoinTypes,
    rewardCoinMetadataMap,
  } = await initializeSuilend(suiClient, suilendClient);

  const { rewardPriceMap } = await initializeSuilendRewards(
    reserveMap,
    activeRewardCoinTypes
  );

  const marketData = {
    suilendClient,

    lendingMarket,
    coinMetadataMap,

    refreshedRawReserves,
    reserveMap,
    reserveCoinTypes,
    reserveCoinMetadataMap,

    rewardPriceMap,
    rewardCoinTypes,
    activeRewardCoinTypes,
    rewardCoinMetadataMap,
  } as AppData;
  return marketData;
};
