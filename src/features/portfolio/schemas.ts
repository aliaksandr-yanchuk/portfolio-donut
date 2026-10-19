import { z } from "zod";

/**
 * API レスポンス(snake_case)のスキーマ。
 * 受け取った時点で検証し、アプリ内では camelCase のドメイン型に変換して扱う。
 * これにより、API の形が変わっても影響はこのファイルだけに閉じる。
 */
const holdingAssetResponseSchema = z.object({
  asset: z.object({
    name: z.string().min(1),
    ticker_symbol: z.string().min(1),
    logo_url: z.url(),
  }),
  asset_amount: z.int(),
  gain_amount: z.int(),
  gain_ratio: z.number(),
  holding_ratio: z.number().nonnegative(),
});

export const portfolioResponseSchema = z
  .object({
    total_asset_amount: z.int(),
    total_gain_amount: z.int(),
    total_gain_ratio: z.number(),
    holding_assets: z.array(holdingAssetResponseSchema),
  })
  .transform((response) => ({
    totalAssetAmount: response.total_asset_amount,
    totalGainAmount: response.total_gain_amount,
    totalGainRatio: response.total_gain_ratio,
    holdings: response.holding_assets.map((holding) => ({
      name: holding.asset.name,
      tickerSymbol: holding.asset.ticker_symbol,
      logoUrl: holding.asset.logo_url,
      assetAmount: holding.asset_amount,
      gainAmount: holding.gain_amount,
      gainRatio: holding.gain_ratio,
      holdingRatio: holding.holding_ratio,
    })),
  }));

export type PortfolioResponse = z.input<typeof portfolioResponseSchema>;
export type Portfolio = z.output<typeof portfolioResponseSchema>;
export type Holding = Portfolio["holdings"][number];
