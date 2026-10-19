"use client";

import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "@/features/portfolio/components/donut-chart";
import { HoldingList } from "@/features/portfolio/components/holding-list";
import { PortfolioSummary } from "@/features/portfolio/components/portfolio-summary";
import type { Portfolio } from "@/features/portfolio/schemas";
import { adjacentTicker } from "@/features/portfolio/utils/adjacent-holding";
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
 * - ↑↓キー(フォーカス中のみ) → 一覧の前後の銘柄にフォーカスを移す。端では止まる
 */
/**
 * 矢印キーで銘柄を移したとき、画面上の位置とキーボードのフォーカスを追従させる。
 * - キーボードのフォーカスがチャートの要素か一覧の行にあれば、同じ種類の次の要素へ移す
 *   (スクリーンリーダーで新しい銘柄が読み上げられる)
 * - 一覧の行が画面外なら、見える位置までスクロールする
 */
function moveKeyboardFocus(tickerSymbol: string) {
  // ティッカーは英数字のみなので、セレクタにそのまま埋め込める。
  const selector = `[data-holding-ticker="${tickerSymbol}"]`;
  const activeTag = document.activeElement?.closest("[data-holding-ticker]")?.tagName.toLowerCase();

  if (activeTag) {
    // スクロールは下の scrollIntoView にまとめるため、ここではスクロールさせない。
    document
      .querySelector<HTMLElement | SVGElement>(`${activeTag}${selector}`)
      ?.focus({ preventScroll: true });
  }
  // jsdom など scrollIntoView のない環境もあるため、存在するときだけ呼ぶ。
  document.querySelector<HTMLElement>(`button${selector}`)?.scrollIntoView?.({ block: "nearest" });
}

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

  // フォーカス中は、↑↓キーで一覧の前後の銘柄にフォーカスを移す。
  // フォーカスがないときは何もしない(矢印キーは通常どおりページのスクロールに使われる)。
  useEffect(() => {
    if (focusedTicker === null) return;
    const currentTicker = focusedTicker;

    function handleArrowKey(event: KeyboardEvent) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const nextTicker = adjacentTicker(
        holdings,
        currentTicker,
        event.key === "ArrowDown" ? "next" : "previous",
      );
      if (nextTicker === null) return;

      // ページのスクロールではなく、フォーカスの移動として扱う。
      event.preventDefault();
      setFocusedTicker(nextTicker);
      moveKeyboardFocus(nextTicker);
    }

    document.addEventListener("keydown", handleArrowKey);
    return () => document.removeEventListener("keydown", handleArrowKey);
  }, [focusedTicker, holdings]);

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
