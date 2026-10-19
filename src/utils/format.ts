/**
 * 金額・割合の表示用フォーマット。
 * 表記はワイヤーフレームに合わせる(例: ¥115,500 / +15.5% (+¥15,500))。
 */

// ja-JP だと円記号が全角(￥)になるため、半角の ¥ になる en-US を使う。
const yenFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "JPY",
});

// 割合は小数第1位〜第2位で表示する(5 → 5.0%, 12.87 → 12.87%)。
const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export type GainTone = "positive" | "negative" | "zero";

/** 損益の向き。表示色と符号の両方の判定に使う。 */
export function gainTone(value: number): GainTone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

const signFor = (value: number) => (value > 0 ? "+" : value < 0 ? "-" : "");

/** ¥115,500 */
export function formatYen(amount: number): string {
  return yenFormatter.format(amount);
}

/** 15.5% */
export function formatPercent(ratio: number): string {
  return `${percentFormatter.format(ratio)}%`;
}

/** +¥15,500 / -¥339 / ¥0 */
export function formatSignedYen(amount: number): string {
  return `${signFor(amount)}${yenFormatter.format(Math.abs(amount))}`;
}

/** +15.5% / -2.8% / 0.0% */
export function formatSignedPercent(ratio: number): string {
  return `${signFor(ratio)}${formatPercent(Math.abs(ratio))}`;
}

/** +15.5% (+¥15,500) */
export function formatGain(amount: number, ratio: number): string {
  return `${formatSignedPercent(ratio)} (${formatSignedYen(amount)})`;
}
