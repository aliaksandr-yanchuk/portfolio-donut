"use client";

import { PortfolioView } from "@/features/portfolio/components/portfolio-view";
import { usePortfolio } from "@/features/portfolio/hooks/use-portfolio";

/**
 * ポートフォリオ画面。クライアント側で API からデータを取得し(SPA)、
 * 読み込み中・エラー・表示の3つの状態を出し分ける。
 */
export function PortfolioScreen() {
  const { state, retry } = usePortfolio();

  if (state.status === "loading") return <PortfolioSkeleton />;

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <p className="font-medium">ポートフォリオを読み込めませんでした</p>
        <p className="text-muted text-sm">{state.message}</p>
        <button
          type="button"
          onClick={retry}
          className="bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return <PortfolioView portfolio={state.portfolio} />;
}

function PortfolioSkeleton() {
  return (
    <div aria-busy="true" aria-label="読み込み中" className="flex flex-col gap-8 py-6 sm:gap-10">
      <div className="border-surface-muted mx-auto aspect-square w-full max-w-[320px] animate-pulse rounded-full border-[36px] motion-reduce:animate-none" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="bg-surface-muted h-16 animate-pulse rounded-2xl motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
