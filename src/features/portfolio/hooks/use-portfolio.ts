"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPortfolio } from "@/features/portfolio/api/fetch-portfolio";
import type { Portfolio } from "@/features/portfolio/schemas";

export type PortfolioState =
  | { status: "loading" }
  | { status: "success"; portfolio: Portfolio }
  | { status: "error"; message: string };

/**
 * ポートフォリオの取得状態(読み込み中・成功・エラー)を管理する。
 * `retry` で再取得できる。画面を離れた後に届いたレスポンスは破棄する。
 */
export function usePortfolio() {
  const [state, setState] = useState<PortfolioState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchPortfolio(controller.signal)
      .then((portfolio) => setState({ status: "success", portfolio }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "ポートフォリオの取得に失敗しました",
        });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
}
