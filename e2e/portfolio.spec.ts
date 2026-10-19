import { expect, test, type Page } from "@playwright/test";

// 本番ビルドを実際のブラウザで開き、PC とスマートフォンの両方で確認する。

const segment = (page: Page, ticker: string) =>
  page.locator(`path[data-holding-ticker="${ticker}"]`);
const row = (page: Page, ticker: string) => page.locator(`button[data-holding-ticker="${ticker}"]`);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(segment(page, "VOO")).toBeVisible();
});

test("API から取得したポートフォリオを、チャートと一覧で表示する", async ({ page }) => {
  await expect(page.getByTestId("summary-amount")).toHaveText("¥115,500");
  await expect(page.getByText("+15.5% (+¥15,500)")).toBeVisible();
  await expect(page.locator("path[data-holding-ticker]")).toHaveCount(7);
  await expect(page.locator("button[data-holding-ticker]")).toHaveCount(7);
});

test("最大の銘柄(VOO)は12時の位置から時計回りに描かれる", async ({ page }) => {
  const chart = (await page.locator("svg").first().boundingBox())!;
  const voo = (await segment(page, "VOO").boundingBox())!;
  const centerX = chart.x + chart.width / 2;

  // 12時から時計回りに 39.8%(約143°)なので、要素は中心線の右側に収まり、上端はチャートの上端に接する。
  expect(voo.x).toBeGreaterThanOrEqual(centerX - 2);
  expect(voo.y).toBeLessThanOrEqual(chart.y + chart.height * 0.08);
});

test("クリックでフォーカスし、他の要素を半透過にし、背景クリックで解除する", async ({ page }) => {
  await segment(page, "NVDA").click();

  await expect(segment(page, "VOO")).toHaveCSS("opacity", "0.25");
  await expect(row(page, "VOO")).toHaveCSS("opacity", "0.35");
  await expect(segment(page, "NVDA")).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("summary-amount")).toHaveText("¥17,556");

  // 見出し(銘柄以外の場所)をクリックすると解除される。
  await page.getByRole("heading", { name: "ポートフォリオ" }).click();

  await expect(segment(page, "VOO")).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("summary-amount")).toHaveText("¥115,500");
});

test("一覧の行をタップしてもフォーカスでき、もう一度タップすると解除する", async ({ page }) => {
  await row(page, "AAPL").click();
  await expect(segment(page, "AAPL")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("summary-amount")).toHaveText("¥11,781");

  await row(page, "AAPL").click();
  await expect(segment(page, "AAPL")).toHaveAttribute("aria-pressed", "false");
});

test("画面幅に収まり、横スクロールが発生しない", async ({ page }) => {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});
