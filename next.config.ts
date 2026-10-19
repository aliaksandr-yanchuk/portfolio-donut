import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // 開発用の Next.js バッジが一覧の左下に重なるため、表示しない。
  devIndicators: false,
};

export default nextConfig;
