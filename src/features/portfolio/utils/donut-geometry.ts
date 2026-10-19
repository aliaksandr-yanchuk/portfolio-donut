/**
 * ドーナツチャートの形状計算。
 * 角度は「12時の位置を0として時計回り」のラジアンで扱い、
 * SVG の座標(y 軸が下向き)への変換はこのファイルの中だけで行う。
 */

const FULL_CIRCLE = Math.PI * 2;

export type Arc = {
  /** 開始角度(12時 = 0、時計回り) */
  startAngle: number;
  /** 終了角度 */
  endAngle: number;
};

/**
 * 各要素の値(保有割合)から、要素ごとの角度範囲を求める。
 * 値の合計で正規化するため、合計が100にならないデータでも円が一周ぴったりになる。
 * `gap` は要素間の隙間(ラジアン)で、各要素の両端から半分ずつ削る。
 */
export function computeArcs(values: readonly number[], gap = 0): Arc[] {
  const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0);
  if (total === 0) return values.map(() => ({ startAngle: 0, endAngle: 0 }));

  // 要素が1つ(全体の100%)のときは隙間を入れず、完全な円にする。
  const visibleCount = values.filter((value) => value > 0).length;
  const effectiveGap = visibleCount > 1 ? gap : 0;

  let cursor = 0;
  return values.map((value) => {
    const span = (Math.max(value, 0) / total) * FULL_CIRCLE;
    const start = cursor;
    cursor += span;
    // 隙間より小さい要素は消えないよう、最低限の幅を残す。
    const trim = Math.min(effectiveGap / 2, span / 4);
    return { startAngle: start + trim, endAngle: start + span - trim };
  });
}

/** 12時起点・時計回りの角度を SVG 座標に変換する。 */
export function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * ドーナツの1要素(扇形のリング)を表す SVG パスを作る。
 * 外側の円弧を時計回りに描き、内側の円弧を反時計回りに戻って閉じる。
 */
export function describeRingSegment(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  { startAngle, endAngle }: Arc,
): string {
  const span = endAngle - startAngle;
  if (span <= 0) return "";

  // 一周分の円弧は始点と終点が重なって描けないため、半円2つに分けて描く。
  if (span >= FULL_CIRCLE - 1e-6) {
    const middle = startAngle + Math.PI;
    return [
      describeRingSegment(cx, cy, outerRadius, innerRadius, { startAngle, endAngle: middle }),
      describeRingSegment(cx, cy, outerRadius, innerRadius, { startAngle: middle, endAngle }),
    ].join(" ");
  }

  const largeArc = span > Math.PI ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

  return [
    `M ${round(outerStart.x)} ${round(outerStart.y)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${round(outerEnd.x)} ${round(outerEnd.y)}`,
    `L ${round(innerEnd.x)} ${round(innerEnd.y)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${round(innerStart.x)} ${round(innerStart.y)}`,
    "Z",
  ].join(" ");
}
