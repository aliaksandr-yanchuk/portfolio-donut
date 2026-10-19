"use client";

import type { KeyboardEvent, ReactNode } from "react";
import type { Holding } from "@/features/portfolio/schemas";
import { computeArcs, describeRingSegment } from "@/features/portfolio/utils/donut-geometry";
import { segmentColor } from "@/features/portfolio/utils/segment-colors";
import { formatPercent } from "@/utils/format";

// SVG 内部の座標系。実際の表示サイズは CSS で画面幅に合わせて伸縮する。
const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 108;
const INNER_RADIUS = 80;
// 要素間の隙間(ラジアン)。ワイヤーフレームの区切りに合わせる。
const GAP = 0.045;

type DonutChartProps = {
  /** 保有割合の大きい順に並べた保有銘柄 */
  holdings: readonly Holding[];
  focusedTicker: string | null;
  onSelect: (tickerSymbol: string) => void;
  /** 中央に表示する内容 */
  children: ReactNode;
};

/**
 * 保有銘柄のドーナツチャート。12時の位置から時計回りに、渡された順で描画する。
 * 各要素はボタンとして操作でき(クリック・タップ・Enter・Space)、
 * フォーカス中は他の要素を半透過にする。
 */
export function DonutChart({ holdings, focusedTicker, onSelect, children }: DonutChartProps) {
  const arcs = computeArcs(
    holdings.map((holding) => holding.holdingRatio),
    GAP,
  );

  function handleKeyDown(event: KeyboardEvent<SVGPathElement>, tickerSymbol: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(tickerSymbol);
    }
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="size-full overflow-visible"
        role="group"
        aria-label="保有銘柄の構成比チャート"
      >
        {holdings.map((holding, index) => {
          const isFocused = focusedTicker === holding.tickerSymbol;
          const isDimmed = focusedTicker !== null && !isFocused;
          return (
            <path
              key={holding.tickerSymbol}
              d={describeRingSegment(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, arcs[index])}
              fill={segmentColor(index)}
              role="button"
              tabIndex={0}
              aria-pressed={isFocused}
              aria-label={`${holding.name} (${holding.tickerSymbol}) ${formatPercent(holding.holdingRatio)}`}
              data-holding-ticker={holding.tickerSymbol}
              data-state={isFocused ? "focused" : isDimmed ? "dimmed" : "default"}
              onClick={() => onSelect(holding.tickerSymbol)}
              onKeyDown={(event) => handleKeyDown(event, holding.tickerSymbol)}
              className={[
                "origin-center cursor-pointer outline-none [transform-box:view-box]",
                "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                "focus-visible:stroke-foreground focus-visible:[stroke-width:2]",
                isFocused ? "scale-[1.05]" : "",
                isDimmed ? "opacity-25" : "opacity-100",
              ].join(" ")}
            />
          );
        })}
      </svg>
      {/* 中央の表示はクリックを透過させ、チャートの外側と同じく「背景」として扱う。 */}
      <div className="pointer-events-none absolute inset-[22%] flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
