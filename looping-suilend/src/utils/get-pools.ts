import axios from "axios";

interface DeepBookPool {
  pool_id: string;
  pool_name: string;
  base_asset_id: string;
  base_asset_decimals: number;
  base_asset_symbol: string;
  base_asset_name: string;
  quote_asset_id: string;
  quote_asset_decimals: number;
  quote_asset_symbol: string;
  quote_asset_name: string;
  min_size: number;
  lot_size: number;
  tick_size: number;
}

export class DeepBookPoolService {
  private static readonly INDEXER_URL =
    "https://deepbook-indexer.mainnet.mystenlabs.com/get_pools";

  public static async getPools(): Promise<DeepBookPool[]> {
    try {
      const response = await axios.get<DeepBookPool[]>(this.INDEXER_URL);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch DeepBook pools:", {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  public static async getPoolById(
    poolId: string
  ): Promise<DeepBookPool | undefined> {
    const pools = await this.getPools();
    return pools.find((pool) => pool.pool_id === poolId);
  }

  public static async getPoolsByBaseAsset(
    symbol: string
  ): Promise<DeepBookPool[]> {
    const pools = await this.getPools();
    return pools.filter(
      (pool) => pool.base_asset_symbol.toLowerCase() === symbol.toLowerCase()
    );
  }
}
