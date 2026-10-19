import portfolio from "@/features/portfolio/mocks/portfolio.json";

/**
 * GET /api/portfolio
 * 課題で提供されたダミーレスポンスを返すモック API。
 * 画面からは本物の API と同じく HTTP で取得するため、
 * 実 API に差し替える場合も取得側のコードは変わらない。
 */
export function GET() {
  return Response.json(portfolio);
}
