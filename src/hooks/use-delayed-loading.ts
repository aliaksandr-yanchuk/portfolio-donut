"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** 読み込みがこの時間(ms)より早く終われば、読み込み中の表示を出さない */
  delay?: number;
  /** 一度出した読み込み中の表示は、この時間(ms)は出し続ける */
  minDuration?: number;
};

/**
 * 読み込み中の表示(スケルトンなど)を出すかどうかを返す。
 *
 * 読み込みがすぐ終わる場合に、スケルトンが一瞬だけ出てちらつくのを防ぐ。
 * - 読み込みが `delay` 以内に終われば、スケルトンを一度も出さない
 * - 一度出したら、少なくとも `minDuration` は出し続ける(出てすぐ消えるのを防ぐ)
 */
export function useDelayedLoading(
  isLoading: boolean,
  { delay = 200, minDuration = 500 }: Options = {},
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }

    // 一度も出していなければ、何もしない。
    if (shownAt.current === null) return;

    const remaining = Math.max(minDuration - (Date.now() - shownAt.current), 0);
    const timer = setTimeout(() => {
      shownAt.current = null;
      setIsVisible(false);
    }, remaining);
    return () => clearTimeout(timer);
  }, [isLoading, delay, minDuration]);

  return isVisible;
}
