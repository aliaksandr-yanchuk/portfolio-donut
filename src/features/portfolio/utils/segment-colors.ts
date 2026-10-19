/**
 * チャートの各要素の色。保有割合の大きい順に割り当てる。
 * 損益の緑・赤と混同しないよう、また隣り合う色が似ないように選んでいる。
 * 実際の色は globals.css の CSS 変数(--segment-1〜8)で定義し、
 * ダークモードでは明るめの色に切り替わる。
 */
const SEGMENT_COLOR_COUNT = 8;

export function segmentColor(index: number): string {
  return `var(--segment-${(index % SEGMENT_COLOR_COUNT) + 1})`;
}
