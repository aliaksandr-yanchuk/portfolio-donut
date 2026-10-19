import type { Holding } from "@/features/portfolio/schemas";

/**
 * 保有割合の大きい順に並べる。チャートと一覧は同じ順序を使う。
 * 保有割合が同じ場合も表示順が変わらないよう、保有金額 → ティッカーの順で決める。
 * 元の配列は変更しない。
 */
export function sortHoldingsByRatio(holdings: readonly Holding[]): Holding[] {
  return [...holdings].sort(
    (a, b) =>
      b.holdingRatio - a.holdingRatio ||
      b.assetAmount - a.assetAmount ||
      a.tickerSymbol.localeCompare(b.tickerSymbol),
  );
}
