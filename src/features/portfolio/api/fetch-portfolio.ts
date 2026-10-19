import { portfolioResponseSchema, type Portfolio } from "@/features/portfolio/schemas";

export const PORTFOLIO_ENDPOINT = "/api/portfolio";

export class PortfolioFetchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PortfolioFetchError";
  }
}

/**
 * ポートフォリオを取得し、レスポンスを検証してドメイン型に変換する。
 * 通信エラー・HTTP エラー・想定外の形のデータは、すべて PortfolioFetchError にまとめる。
 */
export async function fetchPortfolio(signal?: AbortSignal): Promise<Portfolio> {
  const response = await fetch(PORTFOLIO_ENDPOINT, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new PortfolioFetchError(`ポートフォリオの取得に失敗しました (HTTP ${response.status})`);
  }

  const parsed = portfolioResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new PortfolioFetchError("ポートフォリオのデータ形式が正しくありません", {
      cause: parsed.error,
    });
  }
  return parsed.data;
}
