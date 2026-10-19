"use client";

import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "@/features/portfolio/components/donut-chart";
import { HoldingList } from "@/features/portfolio/components/holding-list";
import { PortfolioSummary } from "@/features/portfolio/components/portfolio-summary";
import type { Portfolio } from "@/features/portfolio/schemas";
import { sortHoldingsByRatio } from "@/features/portfolio/utils/sort-holdings";

type PortfolioViewProps = {
  portfolio: Portfolio;
};

/**
 * チャートと一覧をまとめ、フォーカス状態を一元管理する。
 *
 * フォーカスの挙動:
 * - 銘柄(チャートの要素・一覧の行)をクリック → その銘柄をフォーカス。別の銘柄ならフォーカスを移す
 * - フォーカス中の銘柄をもう一度クリック → 解除
 * - 銘柄以外(背景・余白・チャート中央)をクリック → 解除
 * - Esc キー → 解除
 */
export function PortfolioView({ portfolio }: PortfolioViewProps) {
  const [focusedTicker, setFocusedTicker] = useState<string | null>(null);
  const holdings = useMemo(() => sortHoldingsByRatio(portfolio.holdings), [portfolio.holdings]);
  const focusedHolding = holdings.find((holding) => holding.tickerSymbol === focusedTicker);

  // 画面のどこをクリックしても判定できるよう、document で受け取る。
  // 銘柄の要素は自分の onClick でフォーカスを切り替えるので、それ以外のクリックだけ解除する。
  // data-preserve-focus を付けた操作(金額のコピーなど)は、フォーカスを保ったままにする。
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("[data-holding-ticker], [data-preserve-focus]")) {
        setFocusedTicker(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFocusedTicker(null);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleFocus(tickerSymbol: string) {
    setFocusedTicker((current) => (current === tickerSymbol ? null : tickerSymbol));
  }

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
