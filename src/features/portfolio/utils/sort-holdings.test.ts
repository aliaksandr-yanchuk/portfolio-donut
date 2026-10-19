import type { Holding } from "@/features/portfolio/schemas";
import { sortHoldingsByRatio } from "./sort-holdings";

const holding = (tickerSymbol: string, holdingRatio: number, assetAmount = 1000): Holding => ({
  name: tickerSymbol,
  tickerSymbol,
  logoUrl: `https://example.com/${tickerSymbol}.svg`,
  assetAmount,
  gainAmount: 0,
  gainRatio: 0,
  holdingRatio,
});

describe("sortHoldingsByRatio", () => {
  it("保有割合の大きい順に並べる", () => {
    const sorted = sortHoldingsByRatio([holding("A", 10), holding("B", 40), holding("C", 25)]);
    expect(sorted.map((h) => h.tickerSymbol)).toEqual(["B", "C", "A"]);
  });

  it("保有割合が同じ場合は、保有金額 → ティッカーの順で並びを固定する", () => {
    const sorted = sortHoldingsByRatio([
      holding("Z", 10, 500),
      holding("B", 10, 900),
      holding("A", 10, 500),
    ]);
    expect(sorted.map((h) => h.tickerSymbol)).toEqual(["B", "A", "Z"]);
  });

  it("元の配列を変更しない", () => {
    const original = [holding("A", 10), holding("B", 40)];
    sortHoldingsByRatio(original);
    expect(original.map((h) => h.tickerSymbol)).toEqual(["A", "B"]);
  });
});
