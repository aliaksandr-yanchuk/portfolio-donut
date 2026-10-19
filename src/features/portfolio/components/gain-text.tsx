import { formatGain, gainTone, type GainTone } from "@/utils/format";

const toneClass: Record<GainTone, string> = {
  positive: "text-gain-positive",
  negative: "text-gain-negative",
  zero: "text-gain-zero",
};

type GainTextProps = {
  amount: number;
  ratio: number;
  className?: string;
};

/**
 * 評価損益の表示(例: +15.5% (+¥15,500))。
 * プラスは緑、マイナスは赤、ゼロはグレー。色に頼らなくても分かるよう符号も付ける。
 */
export function GainText({ amount, ratio, className = "" }: GainTextProps) {
  const tone = gainTone(amount);
  return (
    <span data-tone={tone} className={`tabular-nums ${toneClass[tone]} ${className}`}>
      {formatGain(amount, ratio)}
    </span>
  );
}
