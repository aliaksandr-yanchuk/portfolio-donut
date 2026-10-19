"use client";

import { AssetLogo } from "@/components/asset-logo";
import { GainText } from "@/features/portfolio/components/gain-text";
import type { Holding } from "@/features/portfolio/schemas";
import { formatPercent, formatYen } from "@/utils/format";

type HoldingListItemProps = {
  holding: Holding;
  color: string;
  isFocused: boolean;
  isDimmed: boolean;
  onSelect: (tickerSymbol: string) => void;
};

/**
 * 保有銘柄一覧の1行。行全体がボタンで、クリックするとチャートと同じくフォーカスを切り替える。
 * 左端の色はチャート上の要素の色と対応している。
 */
export function HoldingListItem({
  holding,
  color,
  isFocused,
  isDimmed,
  onSelect,
}: HoldingListItemProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={isFocused}
        data-holding-ticker={holding.tickerSymbol}
        data-state={isFocused ? "focused" : isDimmed ? "dimmed" : "default"}
        onClick={() => onSelect(holding.tickerSymbol)}
        className={[
          "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left",
          "transition-[opacity,background-color] duration-200 motion-reduce:transition-none",
          "hover:bg-surface-muted focus-visible:outline-accent focus-visible:outline-2",
          isFocused ? "bg-surface-muted" : "",
          isDimmed ? "opacity-35" : "opacity-100",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <AssetLogo src={holding.logoUrl} tickerSymbol={holding.tickerSymbol} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium sm:text-base">{holding.name}</span>
          <span className="text-muted text-xs tabular-nums sm:text-sm">
            {holding.tickerSymbol} / {formatPercent(holding.holdingRatio)}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-sm font-medium tabular-nums sm:text-base">
            {formatYen(holding.assetAmount)}
          </span>
          <GainText
            amount={holding.gainAmount}
            ratio={holding.gainRatio}
            className="text-xs sm:text-sm"
          />
        </span>
      </button>
    </li>
  );
}
