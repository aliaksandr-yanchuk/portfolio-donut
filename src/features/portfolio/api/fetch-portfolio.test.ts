/**
 * @jest-environment node
 */
import mockResponse from "@/features/portfolio/mocks/portfolio.json";
import { fetchPortfolio, PortfolioFetchError } from "./fetch-portfolio";

function mockFetch(body: unknown, status = 200) {
  jest.spyOn(global, "fetch").mockImplementation(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("fetchPortfolio", () => {
  it("API のレスポンスを検証し、camelCase のドメイン型に変換する", async () => {
    mockFetch(mockResponse);

    const portfolio = await fetchPortfolio();

    expect(portfolio.totalAssetAmount).toBe(115500);
    expect(portfolio.totalGainRatio).toBe(15.5);
    expect(portfolio.holdings).toHaveLength(7);
    expect(portfolio.holdings[0]).toEqual({
      name: "S&P 500 ETF (Vanguard)",
      tickerSymbol: "VOO",
      logoUrl: "https://storage.googleapis.com/brooklyn-asset-logo/alpaca/VOO.svg",
      assetAmount: 45969,
      gainAmount: 5242,
      gainRatio: 12.87,
      holdingRatio: 39.8,
    });
  });

  it("HTTP エラーは PortfolioFetchError にする", async () => {
    mockFetch({ message: "error" }, 500);

    await expect(fetchPortfolio()).rejects.toThrow(PortfolioFetchError);
    await expect(fetchPortfolio()).rejects.toThrow("HTTP 500");
  });

  it("想定外の形のデータは PortfolioFetchError にする", async () => {
    // 金額が数値でない(仕様では Int)
    mockFetch({ ...mockResponse, total_asset_amount: "115500" });

    await expect(fetchPortfolio()).rejects.toThrow("データ形式が正しくありません");
  });
});
