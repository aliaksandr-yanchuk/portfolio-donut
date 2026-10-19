"use client";

import { useMemo } from "react";
import { DonutChart } from "@/features/portfolio/components/donut-chart";
import { HoldingList } from "@/features/portfolio/components/holding-list";
import { PortfolioSummary } from "@/features/portfolio/components/portfolio-summary";
import { useHoldingFocus } from "@/features/portfolio/hooks/use-holding-focus";
import type { Portfolio } from "@/features/portfolio/schemas";
import { sortHoldingsByRatio } from "@/features/portfolio/utils/sort-holdings";

type PortfolioViewProps = {
  portfolio: Portfolio;
};

/**
 * チャートと一覧を組み立てる。
 * 両者は同じ並び順・同じフォーカス状態を共有する(フォーカスの挙動は useHoldingFocus を参照)。
 */
export function PortfolioView({ portfolio }: PortfolioViewProps) {
  const holdings = useMemo(() => sortHoldingsByRatio(portfolio.holdings), [portfolio.holdings]);
  const { focusedTicker, focusedHolding, toggleFocus } = useHoldingFocus(holdings);

  return (
    <div className="flex flex-1 flex-col gap-8 py-6 sm:gap-10">
      <DonutChart holdings={holdings} focusedTicker={focusedTicker} onSelect={toggleFocus}>
        {focusedHolding ? (
          <PortfolioSummary
            label={focusedHolding.name}
            amount={focusedHolding.assetAmount}
            gainAmount={focusedHolding.gainAmount}
            gainRatio={focusedHolding.gainRatio}
          />
        ) : (
          <PortfolioSummary
            label="資産総額"
            amount={portfolio.totalAssetAmount}
            gainAmount={portfolio.totalGainAmount}
            gainRatio={portfolio.totalGainRatio}
          />
        )}
      </DonutChart>
      <HoldingList holdings={holdings} focusedTicker={focusedTicker} onSelect={toggleFocus} />
    </div>
  );
}
