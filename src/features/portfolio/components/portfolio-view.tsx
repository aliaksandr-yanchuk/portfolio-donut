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

  // 中央に表示する値は、フォーカス中の銘柄か全体かを一度だけ判定し、4つの値をまとめて決める。
  // 値ごとに `a || b` で切り替えると、損益が 0 の銘柄で 0 が「値なし」とみなされ、
  // 全体の値が混ざって表示されてしまう(銘柄名と全体の損益の組み合わせになる)。
  const summary = focusedHolding
    ? {
        label: focusedHolding.name,
        amount: focusedHolding.assetAmount,
        gainAmount: focusedHolding.gainAmount,
        gainRatio: focusedHolding.gainRatio,
      }
    : {
        label: "資産総額",
        amount: portfolio.totalAssetAmount,
        gainAmount: portfolio.totalGainAmount,
        gainRatio: portfolio.totalGainRatio,
      };

  return (
    <div className="flex flex-1 flex-col gap-8 py-6 sm:gap-10">
      <DonutChart holdings={holdings} focusedTicker={focusedTicker} onSelect={toggleFocus}>
        <PortfolioSummary {...summary} />
      </DonutChart>
      <HoldingList holdings={holdings} focusedTicker={focusedTicker} onSelect={toggleFocus} />
    </div>
  );
}
