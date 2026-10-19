"use client";

import { HoldingListItem } from "@/features/portfolio/components/holding-list-item";
import type { Holding } from "@/features/portfolio/schemas";
import { segmentColor } from "@/features/portfolio/utils/segment-colors";

type HoldingListProps = {
  /** チャートと同じ順序(保有割合の大きい順)に並べた保有銘柄 */
  holdings: readonly Holding[];
  focusedTicker: string | null;
  onSelect: (tickerSymbol: string) => void;
};

export function HoldingList({ holdings, focusedTicker, onSelect }: HoldingListProps) {
  return (
    <section aria-labelledby="holdings-heading" className="flex flex-col gap-2">
      <h2 id="holdings-heading" className="text-muted px-3 text-sm font-medium">
        保有銘柄
      </h2>
      <ul className="flex flex-col">
        {holdings.map((holding, index) => (
          <HoldingListItem
            key={holding.tickerSymbol}
            holding={holding}
            color={segmentColor(index)}
            isFocused={focusedTicker === holding.tickerSymbol}
            isDimmed={focusedTicker !== null && focusedTicker !== holding.tickerSymbol}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  );
}
