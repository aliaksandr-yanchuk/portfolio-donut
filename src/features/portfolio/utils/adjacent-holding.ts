import type { Holding } from "@/features/portfolio/schemas";

/**
 * 並び順で隣にある銘柄のティッカーを返す(矢印キーでの移動用)。
 * 一覧と同じく端で止まり、先頭・末尾を越えて反対側には回り込まない。
 * 現在の銘柄が見つからない場合は null を返す。
 */
export function adjacentTicker(
  holdings: readonly Holding[],
  currentTicker: string,
  direction: "next" | "previous",
): string | null {
  const index = holdings.findIndex((holding) => holding.tickerSymbol === currentTicker);
  if (index === -1) return null;

  const nextIndex = direction === "next" ? index + 1 : index - 1;
  const clamped = Math.min(Math.max(nextIndex, 0), holdings.length - 1);
  return holdings[clamped].tickerSymbol;
}
