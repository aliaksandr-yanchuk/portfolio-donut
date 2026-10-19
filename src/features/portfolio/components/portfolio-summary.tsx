import { GainText } from "@/features/portfolio/components/gain-text";
import { formatYen } from "@/utils/format";

type PortfolioSummaryProps = {
  /** 金額の上に表示する見出し(例: 資産総額、銘柄名) */
  label: string;
  amount: number;
  gainAmount: number;
  gainRatio: number;
};

/**
 * チャート中央の表示。通常はポートフォリオ全体、
 * 銘柄をフォーカスしている間はその銘柄の数値を表示する。
 */
export function PortfolioSummary({ label, amount, gainAmount, gainRatio }: PortfolioSummaryProps) {
  return (
    // 表示が切り替わったことを読み上げる。
    <div aria-live="polite" className="flex flex-col items-center gap-1">
      <span className="text-muted line-clamp-1 text-xs sm:text-sm">{label}</span>
      <span
        data-testid="summary-amount"
        className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl"
      >
        {formatYen(amount)}
      </span>
      <GainText amount={gainAmount} ratio={gainRatio} className="text-xs font-medium sm:text-sm" />
    </div>
  );
}
