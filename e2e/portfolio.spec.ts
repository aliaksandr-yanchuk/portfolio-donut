import { expect, test, type Page } from "@playwright/test";

// 本番ビルドを実際のブラウザで開き、PC とスマートフォンの両方で確認する。

const segment = (page: Page, ticker: string) => page.locator(`g[data-holding-ticker="${ticker}"]`);
// 拡大などの見た目の変化は、ボタン(g)の中の図形に付く。
const segmentShape = (page: Page, ticker: string) =>
  segment(page, ticker).locator("[data-segment-shape]");
const row = (page: Page, ticker: string) => page.locator(`button[data-holding-ticker="${ticker}"]`);

/**
 * チャートの要素の上にある画面上の点を返す。
 * Playwright の hover() などは要素の外接矩形の中心を狙うが、円弧状の要素では
 * その点がドーナツの穴に落ちることがある。そのため、実際に塗られている点を探して使う。
 */
function pointOnSegment(page: Page, ticker: string) {
  return segment(page, ticker).evaluate((element) => {
    // 拡大しない、クリックを受ける側の図形で判定する。
    const path = element.querySelector("path:last-of-type") as SVGPathElement;
    const box = path.getBBox();
    const matrix = path.getScreenCTM()!;
    for (let fy = 0.1; fy < 1; fy += 0.1) {
      for (let fx = 0.1; fx < 1; fx += 0.1) {
        const local = new DOMPoint(box.x + box.width * fx, box.y + box.height * fy);
        if (path.isPointInFill(local)) {
          const screen = local.matrixTransform(matrix);
          return { x: screen.x, y: screen.y };
        }
      }
    }
    throw new Error(`No filled point found for ${ticker}`);
  });
}

async function hoverSegment(page: Page, ticker: string) {
  const point = await pointOnSegment(page, ticker);
  await page.mouse.move(point.x, point.y);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(segment(page, "VOO")).toBeVisible();
});

test("API から取得したポートフォリオを、チャートと一覧で表示する", async ({ page }) => {
  await expect(page.getByTestId("summary-amount")).toHaveText("¥115,500");
  await expect(page.getByText("+15.5% (+¥15,500)", { exact: true })).toBeVisible();
  await expect(page.locator("g[data-holding-ticker]")).toHaveCount(7);
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

test("マウスでホバーすると要素が少し拡大し、クリックできることがわかる", async ({
  page,
  isMobile,
}) => {
  // スマートフォンにはホバーがないため、PC のみで確認する。
  test.skip(isMobile, "ホバーはマウス操作のある環境のみ");

  await hoverSegment(page, "NVDA");
  await expect(segmentShape(page, "NVDA")).toHaveCSS("scale", "1.03");
  // 拡大はトランジションで滑らかに変化する。
  await expect(segmentShape(page, "NVDA")).toHaveCSS("transition-property", /scale/);

  // フォーカス中は、ホバーより少し大きく強調する。
  await segment(page, "NVDA").click();
  await expect(segmentShape(page, "NVDA")).toHaveCSS("scale", "1.05");

  // 半透過中の要素は、ホバーで少し濃くなる。
  await hoverSegment(page, "VOO");
  await expect(segment(page, "VOO")).toHaveCSS("opacity", "0.6");
});

// 不具合の再発防止: 要素をすばやく続けてクリックすると、ブラウザの「ダブルクリックで単語を選択」
// 「トリプルクリックで行を選択」が働き、チャートにはテキストがないため、
// 最も近いチャート中央のテキスト(銘柄名など)が選択されてしまっていた。
test("要素をすばやく続けてクリックしても、チャート中央のテキストが選択されない", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "連続クリックはマウス操作のある環境のみ");

  const point = await pointOnSegment(page, "VOO");
  for (const clickCount of [2, 3]) {
    await page.mouse.click(point.x, point.y, { clickCount });
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
  }
});

test("チャート中央のテキストは、ダブルクリックしても選択されない", async ({ page, isMobile }) => {
  test.skip(isMobile, "ダブルクリックはマウス操作のある環境のみ");

  // 中央の表示はクリックを透過させているため(背景扱い)、要素ではなく画面上の座標をダブルクリックする。
  for (const target of [
    page.getByText("資産総額", { exact: true }),
    page.getByTestId("summary-amount"),
  ]) {
    const box = (await target.boundingBox())!;
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
  }

  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
});

test("金額のコピーボタンで、表示中の金額をクリップボードにコピーする", async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(isMobile, "クリップボードの読み取り権限は PC の Chrome でのみ付与できる");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  // フォーカス中は、その銘柄の金額をコピーする。コピーしてもフォーカスは外れない。
  await segment(page, "NVDA").click();
  await page.getByRole("button", { name: "金額をコピー" }).click();

  await expect(page.getByRole("status")).toHaveText("コピーしました");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("¥17,556");
  await expect(segment(page, "NVDA")).toHaveAttribute("aria-pressed", "true");
});

test("スマートフォンでは、タップ後にホバーの強調が残らない", async ({ page, isMobile }) => {
  test.skip(!isMobile, "タッチ操作の環境のみ");

  await segment(page, "NVDA").tap();
  await segment(page, "NVDA").tap();
  await expect(segmentShape(page, "NVDA")).toHaveCSS("scale", "none");
});

test("一覧の行をタップしてもフォーカスでき、もう一度タップすると解除する", async ({ page }) => {
  await row(page, "AAPL").click();
  await expect(segment(page, "AAPL")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("summary-amount")).toHaveText("¥11,781");

  await row(page, "AAPL").click();
  await expect(segment(page, "AAPL")).toHaveAttribute("aria-pressed", "false");
});

test("フォーカス中は↑↓キーで銘柄を移動でき、画面外の行は見える位置までスクロールする", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "キーボード操作は PC のみ");

  // VOO は大きな円弧のため、外接矩形の中心(ドーナツの穴)ではなく、塗られた点をクリックする。
  const voo = await pointOnSegment(page, "VOO");
  await page.mouse.click(voo.x, voo.y);
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowDown");

  // 一番下の銘柄までフォーカスが移り、その行が画面内に表示されている。
  await expect(segment(page, "NET")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("summary-amount")).toHaveText("¥5,774");
  await expect(row(page, "NET")).toBeInViewport();

  // 末尾では止まる。
  await page.keyboard.press("ArrowDown");
  await expect(segment(page, "NET")).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("ArrowUp");
  await expect(segment(page, "PLTR")).toHaveAttribute("aria-pressed", "true");
});

test("API の応答が遅い場合は、スケルトンを表示してからポートフォリオを表示する", async ({
  page,
}) => {
  // 応答を 1 秒遅らせる。
  await page.route("**/api/portfolio", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await page.reload();

  const skeleton = page.locator('[aria-busy="true"] .animate-pulse').first();
  await expect(skeleton).toBeVisible();
  await expect(page.getByTestId("summary-amount")).toHaveText("¥115,500");
  await expect(skeleton).toHaveCount(0);
});

test("画面幅に収まり、横スクロールが発生しない", async ({ page }) => {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});
