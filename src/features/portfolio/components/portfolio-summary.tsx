import { CopyButton } from "@/components/copy-button";
import { GainText } from "@/features/portfolio/components/gain-text";
import { formatGain, formatYen } from "@/utils/format";

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
 *
 * チャートの一部として操作される領域なので、テキストは選択できないようにし
 * (チャートの近くでのダブルクリックで選択されてしまうのを防ぐ)、
 * 代わりに金額はコピーボタンでコピーできるようにしている。
 */
export function PortfolioSummary({ label, amount, gainAmount, gainRatio }: PortfolioSummaryProps) {
  const formattedAmount = formatYen(amount);

  return (
    <div data-testid="portfolio-summary" className="flex flex-col items-center gap-1 select-none">
      <span className="text-muted line-clamp-1 text-xs sm:text-sm">{label}</span>
      {/* コピーボタンは金額の右に置き、金額自体は中央に揃えたままにする。 */}
      <span className="relative">
        <span
          data-testid="summary-amount"
          className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl"
        >
          {formattedAmount}
        </span>
        {/*
          中央の表示はクリックを透過させている(チャートの背景として扱うため)。
          ボタンだけはクリックを受け、押してもフォーカス中の銘柄は解除しない。
        */}
        <span
          data-preserve-focus=""
          className="pointer-events-auto absolute top-1/2 left-full ml-0.5 -translate-y-1/2"
        >
          <CopyButton value={formattedAmount} label="金額をコピー" />
        </span>
      </span>
      <GainText amount={gainAmount} ratio={gainRatio} className="text-xs font-medium sm:text-sm" />
      {/*
        表示が切り替わったことを読み上げる。コピーボタンの結果の読み上げと重ならないよう、
        画面には出さない別の要素にまとめている。
      */}
      <span aria-live="polite" className="sr-only">
        {`${label} ${formattedAmount} ${formatGain(gainAmount, gainRatio)}`}
      </span>
    </div>
  );
}
