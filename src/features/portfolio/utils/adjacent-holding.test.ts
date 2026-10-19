import type { Holding } from "@/features/portfolio/schemas";
import { adjacentTicker } from "./adjacent-holding";

const holdings = ["VOO", "NVDA", "GOOGL"].map((tickerSymbol): Holding => ({
  name: tickerSymbol,
  tickerSymbol,
  logoUrl: `https://example.com/${tickerSymbol}.svg`,
  assetAmount: 0,
  gainAmount: 0,
  gainRatio: 0,
  holdingRatio: 0,
}));

describe("adjacentTicker", () => {
  it("次・前の銘柄を返す", () => {
    expect(adjacentTicker(holdings, "NVDA", "next")).toBe("GOOGL");
    expect(adjacentTicker(holdings, "NVDA", "previous")).toBe("VOO");
  });

  it("先頭・末尾では止まり、反対側に回り込まない", () => {
    expect(adjacentTicker(holdings, "VOO", "previous")).toBe("VOO");
    expect(adjacentTicker(holdings, "GOOGL", "next")).toBe("GOOGL");
  });

  it("見つからない銘柄には null を返す", () => {
    expect(adjacentTicker(holdings, "TSLA", "next")).toBeNull();
  });
});
