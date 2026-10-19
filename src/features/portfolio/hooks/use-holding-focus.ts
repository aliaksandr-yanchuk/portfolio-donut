"use client";

import { useCallback, useEffect, useState } from "react";
import type { Holding } from "@/features/portfolio/schemas";
import { adjacentTicker } from "@/features/portfolio/utils/adjacent-holding";

/**
 * チャートと一覧で共通の「フォーカス中の銘柄」を管理する。
 *
 * フォーカスの挙動:
 * - 銘柄(チャートの要素・一覧の行)をクリック → `toggleFocus` でその銘柄をフォーカス。
 *   別の銘柄ならフォーカスを移し、フォーカス中の銘柄なら解除する
 * - 銘柄以外(背景・余白・チャート中央)をクリック → 解除
 *   (data-preserve-focus を付けた操作、例えば金額のコピーは除く)
 * - Esc キー → 解除
 * - ↑↓キー(フォーカス中のみ) → 前後の銘柄にフォーカスを移す。端では止まる
 *
 * 銘柄の要素は、data-holding-ticker 属性でティッカーを持っている前提で動く。
 *
 * @param holdings 表示順(チャート・一覧と同じ順)に並んだ保有銘柄
 */
export function useHoldingFocus(holdings: readonly Holding[]) {
  const [focusedTicker, setFocusedTicker] = useState<string | null>(null);
  const focusedHolding = holdings.find((holding) => holding.tickerSymbol === focusedTicker) ?? null;

  // 画面のどこをクリックしても判定できるよう、document で受け取る。
  // 銘柄の要素は自分の onClick で toggleFocus を呼ぶので、それ以外のクリックだけ解除する。
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("[data-holding-ticker], [data-preserve-focus]")) {
        setFocusedTicker(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFocusedTicker(null);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // フォーカス中だけ、↑↓キーで前後の銘柄に移る。
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
      followWithKeyboardFocus(nextTicker);
    }

    document.addEventListener("keydown", handleArrowKey);
    return () => document.removeEventListener("keydown", handleArrowKey);
  }, [focusedTicker, holdings]);

  const toggleFocus = useCallback((tickerSymbol: string) => {
    setFocusedTicker((current) => (current === tickerSymbol ? null : tickerSymbol));
  }, []);

  return { focusedTicker, focusedHolding, toggleFocus };
}

/**
 * 矢印キーで銘柄を移したとき、画面上の位置とキーボードのフォーカスを追従させる。
 * - キーボードのフォーカスがチャートの要素か一覧の行にあれば、同じ種類の次の要素へ移す
 *   (スクリーンリーダーで新しい銘柄が読み上げられる)
 * - 一覧の行が画面外なら、見える位置までスクロールする
 */
function followWithKeyboardFocus(tickerSymbol: string) {
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
