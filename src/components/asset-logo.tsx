"use client";

import { useState } from "react";

type AssetLogoProps = {
  src: string;
  tickerSymbol: string;
  size?: number;
};

/**
 * 銘柄ロゴ。画像を読み込めなかった場合は、ティッカーの頭文字を代わりに表示する。
 * ロゴは外部の SVG なので next/image の最適化は使わず、そのまま <img> で表示する。
 */
export function AssetLogo({ src, tickerSymbol, size = 40 }: AssetLogoProps) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (failed) {
    return (
      <span
        aria-hidden="true"
        data-testid="asset-logo-fallback"
        className="bg-surface-muted text-muted flex shrink-0 items-center justify-center rounded-xl text-xs font-semibold"
        style={style}
      >
        {tickerSymbol.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外部 SVG のため最適化は不要
    <img
      src={src}
      // 銘柄名が隣に表示されるため、読み上げは不要(装飾扱い)。
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="border-border shrink-0 rounded-xl border bg-white object-contain p-1"
      style={style}
    />
  );
}
