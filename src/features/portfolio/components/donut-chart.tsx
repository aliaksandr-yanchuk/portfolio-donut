"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
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

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, tickerSymbol: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(tickerSymbol);
    }
  }

  // すばやく続けてクリックすると、ブラウザの「ダブルクリックで単語選択・トリプルクリックで行選択」が働く。
  // チャートの要素にはテキストがないため、最も近いチャート中央のテキストが選択されてしまう。
  // 2回目以降のクリックだけ既定の動作(テキスト選択)を止める。クリック自体の処理は変わらない。
  function preventMultiClickSelection(event: MouseEvent<SVGGElement>) {
    if (event.detail > 1) event.preventDefault();
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
          const d = describeRingSegment(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, arcs[index]);
          return (
            // 1要素 = 1ボタン。見た目の図形と、クリックを受ける図形を分けている(下記)。
            <g
              key={holding.tickerSymbol}
              role="button"
              tabIndex={0}
              aria-pressed={isFocused}
              aria-label={`${holding.name} (${holding.tickerSymbol}) ${formatPercent(holding.holdingRatio)}`}
              data-holding-ticker={holding.tickerSymbol}
              data-state={isFocused ? "focused" : isDimmed ? "dimmed" : "default"}
              onMouseDown={preventMultiClickSelection}
              onClick={() => onSelect(holding.tickerSymbol)}
              onKeyDown={(event) => handleKeyDown(event, holding.tickerSymbol)}
              className={[
                "group cursor-pointer outline-none",
                "transition-opacity duration-200 ease-out motion-reduce:transition-none",
                // 半透過中の要素も、ホバーで少し濃くして選び直せることを示す。
                isDimmed ? "opacity-25 hover:opacity-60" : "opacity-100",
              ].join(" ")}
            >
              {/* 見た目の図形。フォーカスやホバーで拡大する。 */}
              <path
                d={d}
                fill={segmentColor(index)}
                data-segment-shape=""
                className={[
                  "pointer-events-none origin-center [transform-box:view-box]",
                  // Tailwind v4 の scale-* は transform ではなく CSS の scale プロパティを使うため、
                  // トランジション対象にも scale を指定する(transform だと拡大がアニメーションしない)。
                  "transition-[scale,filter] duration-200 ease-out motion-reduce:transition-none",
                  "group-focus-visible:stroke-foreground group-focus-visible:[stroke-width:2]",
                  // ホバーで少し浮かせて、クリックできることを示す。Tailwind の hover: は
                  // マウスなどホバーできる環境でだけ効くため、タップ後に強調が残ることはない。
                  isFocused
                    ? "scale-[1.05]"
                    : "group-hover:scale-[1.03] group-hover:brightness-110",
                ].join(" ")}
              />
              {/*
                クリック・ホバーを受ける透明な図形。拡大しないので、当たり判定は常に元の形のまま。
                見た目の図形で判定すると、内側の縁で拡大 → カーソルが外れる → 縮小 を繰り返してちらつく。
              */}
              <path d={d} fill="transparent" />
            </g>
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
