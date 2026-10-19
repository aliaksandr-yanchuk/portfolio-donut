"use client";

import { PortfolioView } from "@/features/portfolio/components/portfolio-view";
import { usePortfolio } from "@/features/portfolio/hooks/use-portfolio";
import { useDelayedLoading } from "@/hooks/use-delayed-loading";

/**
 * ポートフォリオ画面。クライアント側で API からデータを取得し(SPA)、
 * 読み込み中・エラー・表示の3つの状態を出し分ける。
 */
export function PortfolioScreen() {
  const { state, retry } = usePortfolio();
  // 読み込みがすぐ終わる場合はスケルトンを出さず、ちらつきを防ぐ。
  const showSkeleton = useDelayedLoading(state.status === "loading");

  if (showSkeleton) return <PortfolioSkeleton />;

  // スケルトンを出す前の短い待ち時間は、レイアウトだけ確保して何も表示しない。
  if (state.status === "loading") {
    return <div aria-busy="true" aria-label="読み込み中" className="flex-1" />;
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center motion-reduce:animate-none"
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

  // 表示に切り替わるときは、ふわっと表示して変化をなめらかにする。
  return (
    <div className="animate-fade-in flex flex-1 flex-col motion-reduce:animate-none">
      <PortfolioView portfolio={state.portfolio} />
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="読み込み中"
      className="animate-fade-in flex flex-col gap-8 py-6 motion-reduce:animate-none sm:gap-10"
    >
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
