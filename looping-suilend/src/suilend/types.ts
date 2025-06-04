import {
  ParsedLendingMarket,
  ParsedReserve,
  SuilendClient,
  ParsedObligation,
  RewardMap,
} from "@suilend/sdk";
import { CoinMetadata } from "@mysten/sui/client";
import { Reserve } from "@suilend/sdk/_generated/suilend/reserve/structs";
import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";

export interface AppData {
  suilendClient: SuilendClient;

  lendingMarket: ParsedLendingMarket;
  coinMetadataMap: Record<string, CoinMetadata>;

  refreshedRawReserves: Reserve<string>[];
  reserveMap: Record<string, ParsedReserve>;
  reserveCoinTypes: string[];
  reserveCoinMetadataMap: Record<string, CoinMetadata>;

  rewardPriceMap: Record<string, BigNumber | undefined>;
  rewardCoinTypes: string[];
  activeRewardCoinTypes: string[];
  rewardCoinMetadataMap: Record<string, CoinMetadata>;
}
export interface AllAppData {
  allLendingMarketData: Record<string, AppData>;
  //   lstAprPercentMap: Record<string, BigNumber>;
}

export interface UserData {
  obligationOwnerCaps: ObligationOwnerCap<string>[];
  obligations: ParsedObligation[];
  rewardMap: RewardMap;
}
