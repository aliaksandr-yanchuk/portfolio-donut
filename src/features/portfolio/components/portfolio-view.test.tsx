import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockResponse from "@/features/portfolio/mocks/portfolio.json";
import { portfolioResponseSchema } from "@/features/portfolio/schemas";
import { PortfolioView } from "./portfolio-view";

const portfolio = portfolioResponseSchema.parse(mockResponse);

function setup() {
  const user = userEvent.setup();
  render(<PortfolioView portfolio={portfolio} />);
  return { user };
}

// チャートの要素(SVG の g)と一覧の行は、どちらも data-holding-ticker を持つ。
const segment = (ticker: string) =>
  document.querySelector<SVGGElement>(`g[data-holding-ticker="${ticker}"]`)!;
const row = (ticker: string) =>
  document.querySelector<HTMLButtonElement>(`button[data-holding-ticker="${ticker}"]`)!;
const stateOf = (element: Element) => element.getAttribute("data-state");
const summary = () => screen.getByTestId("portfolio-summary");

describe("PortfolioView", () => {
  describe("初期表示", () => {
    it("チャート中央に資産総額と評価損益を表示し、プラスの損益は緑の区分にする", () => {
      setup();

      expect(within(summary()).getByText("資産総額")).toBeInTheDocument();
      expect(screen.getByTestId("summary-amount")).toHaveTextContent("¥115,500");
      const gain = within(summary()).getByText("+15.5% (+¥15,500)");
      expect(gain).toHaveAttribute("data-tone", "positive");
      expect(gain).toHaveClass("text-gain-positive");
    });

    it("チャートの要素と一覧を、保有割合の大きい順に並べる", () => {
      setup();
      const expected = ["VOO", "NVDA", "GOOGL", "AAPL", "TSLA", "PLTR", "NET"];

      const segmentOrder = [...document.querySelectorAll("g[data-holding-ticker]")].map((el) =>
        el.getAttribute("data-holding-ticker"),
      );
      const rowOrder = [...document.querySelectorAll("button[data-holding-ticker]")].map((el) =>
        el.getAttribute("data-holding-ticker"),
      );
      expect(segmentOrder).toEqual(expected);
      expect(rowOrder).toEqual(expected);
    });

    it("一覧の各行に、銘柄名・ティッカー・保有割合・保有金額・評価損益を表示する", () => {
      setup();
      const voo = within(row("VOO"));

      expect(voo.getByText("S&P 500 ETF (Vanguard)")).toBeInTheDocument();
      expect(voo.getByText("VOO / 39.8%")).toBeInTheDocument();
      expect(voo.getByText("¥45,969")).toBeInTheDocument();
      expect(voo.getByText("+12.87% (+¥5,242)")).toHaveAttribute("data-tone", "positive");
    });

    it("マイナスの損益は赤の区分で表示する", () => {
      setup();
      expect(within(row("AAPL")).getByText("-2.8% (-¥339)")).toHaveAttribute(
        "data-tone",
        "negative",
      );
    });

    it("フォーカスがない間は、どの要素も半透過にしない", () => {
      setup();
      expect(stateOf(segment("VOO"))).toBe("default");
      expect(stateOf(row("NET"))).toBe("default");
    });
  });

  describe("フォーカス", () => {
    it("チャートの要素をクリックすると、その銘柄をフォーカスし、他はチャート・一覧とも半透過にする", async () => {
      const { user } = setup();

      await user.click(segment("NVDA"));

      expect(segment("NVDA")).toHaveAttribute("aria-pressed", "true");
      expect(stateOf(segment("NVDA"))).toBe("focused");
      expect(stateOf(segment("VOO"))).toBe("dimmed");
      expect(stateOf(row("NVDA"))).toBe("focused");
      expect(stateOf(row("VOO"))).toBe("dimmed");
    });

    it("フォーカス中は、チャート中央にその銘柄の数値を表示する", async () => {
      const { user } = setup();

      await user.click(segment("AAPL"));

      expect(within(summary()).getByText("Apple")).toBeInTheDocument();
      expect(screen.getByTestId("summary-amount")).toHaveTextContent("¥11,781");
      expect(within(summary()).getByText("-2.8% (-¥339)")).toHaveAttribute("data-tone", "negative");
    });

    it("フォーカス中の要素をもう一度クリックすると、フォーカスを外す", async () => {
      const { user } = setup();

      await user.click(segment("NVDA"));
      await user.click(segment("NVDA"));

      expect(stateOf(segment("NVDA"))).toBe("default");
      expect(screen.getByTestId("summary-amount")).toHaveTextContent("¥115,500");
    });

    it("別の要素をクリックすると、フォーカスがその要素に移る", async () => {
      const { user } = setup();

      await user.click(segment("NVDA"));
      await user.click(segment("TSLA"));

      expect(stateOf(segment("TSLA"))).toBe("focused");
      expect(stateOf(segment("NVDA"))).toBe("dimmed");
    });

    it("要素以外(背景)をクリックすると、フォーカスを外す", async () => {
      const { user } = setup();

      await user.click(segment("NVDA"));
      await user.click(document.body);

      expect(stateOf(segment("NVDA"))).toBe("default");
      expect(stateOf(row("VOO"))).toBe("default");
    });

    it("チャート中央の表示をクリックしても、背景と同じくフォーカスを外す", async () => {
      const { user } = setup();

      await user.click(segment("NVDA"));
      await user.click(screen.getByTestId("summary-amount"));

      expect(stateOf(segment("NVDA"))).toBe("default");
    });

    it("一覧の行をクリックしても、チャートと同じくフォーカスする", async () => {
      const { user } = setup();

      await user.click(row("GOOGL"));

      expect(stateOf(segment("GOOGL"))).toBe("focused");
      expect(stateOf(row("GOOGL"))).toBe("focused");
    });

    it("金額のコピーボタンを押しても、フォーカスは外れず、その銘柄の金額をコピーする", async () => {
      const { user } = setup();
      const writeText = jest.spyOn(navigator.clipboard, "writeText");

      await user.click(segment("NVDA"));
      await user.click(screen.getByRole("button", { name: "金額をコピー" }));

      expect(writeText).toHaveBeenCalledWith("¥17,556");
      expect(stateOf(segment("NVDA"))).toBe("focused");
    });

    describe("↑↓キーでの移動", () => {
      it("フォーカス中は、↓で次・↑で前の銘柄にフォーカスを移し、中央の表示も切り替える", async () => {
        const { user } = setup();

        await user.click(segment("NVDA"));
        await user.keyboard("{ArrowDown}");
        expect(stateOf(segment("GOOGL"))).toBe("focused");
        expect(stateOf(row("GOOGL"))).toBe("focused");
        expect(screen.getByTestId("summary-amount")).toHaveTextContent("¥16,979");

        await user.keyboard("{ArrowUp}{ArrowUp}");
        expect(stateOf(segment("VOO"))).toBe("focused");
      });

      it("先頭・末尾では止まる", async () => {
        const { user } = setup();

        await user.click(segment("VOO"));
        await user.keyboard("{ArrowUp}");
        expect(stateOf(segment("VOO"))).toBe("focused");

        await user.click(row("NET"));
        await user.keyboard("{ArrowDown}");
        expect(stateOf(segment("NET"))).toBe("focused");
      });

      it("フォーカスがないときは、矢印キーで何も選ばない", async () => {
        const { user } = setup();

        await user.keyboard("{ArrowDown}");

        expect(document.querySelector('[data-state="focused"]')).toBeNull();
      });

      it("キーボードのフォーカスも、同じ種類の次の要素(一覧の行)へ移る", async () => {
        const { user } = setup();

        row("TSLA").focus();
        await user.keyboard("{Enter}");
        await user.keyboard("{ArrowDown}");

        expect(row("PLTR")).toHaveFocus();
        expect(stateOf(row("PLTR"))).toBe("focused");
      });

      it("キーボードのフォーカスも、同じ種類の次の要素(チャートの要素)へ移る", async () => {
        const { user } = setup();

        segment("NVDA").focus();
        await user.keyboard("{Enter}");
        await user.keyboard("{ArrowUp}");

        expect(segment("VOO")).toHaveFocus();
      });
    });

    it("キーボードでも操作でき、Esc キーでフォーカスを外す", async () => {
      const { user } = setup();

      segment("PLTR").focus();
      await user.keyboard("{Enter}");
      expect(stateOf(segment("PLTR"))).toBe("focused");

      await user.keyboard("{Escape}");
      expect(stateOf(segment("PLTR"))).toBe("default");
    });

    it("チャートの各要素は、銘柄名と保有割合を読み上げられるボタンになっている", () => {
      setup();
      expect(
        screen.getByRole("button", { name: "S&P 500 ETF (Vanguard) (VOO) 39.8%" }),
      ).toBeInTheDocument();
    });
  });
});
