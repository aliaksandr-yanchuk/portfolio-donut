import { act, renderHook } from "@testing-library/react";
import type { Holding } from "@/features/portfolio/schemas";
import { useHoldingFocus } from "./use-holding-focus";

const holdings = ["VOO", "NVDA", "GOOGL"].map((tickerSymbol): Holding => ({
  name: `${tickerSymbol} Inc.`,
  tickerSymbol,
  logoUrl: `https://example.com/${tickerSymbol}.svg`,
  assetAmount: 1000,
  gainAmount: 0,
  gainRatio: 0,
  holdingRatio: 10,
}));

function setup() {
  return renderHook(() => useHoldingFocus(holdings));
}

const pressKey = (key: string, init: KeyboardEventInit = {}) =>
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true, ...init }));
  });

const clickOn = (element: Element) =>
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useHoldingFocus", () => {
  it("最初は何もフォーカスしていない", () => {
    const { result } = setup();
    expect(result.current.focusedTicker).toBeNull();
    expect(result.current.focusedHolding).toBeNull();
  });

  it("toggleFocus でフォーカスし、同じ銘柄でもう一度呼ぶと解除する", () => {
    const { result } = setup();

    act(() => result.current.toggleFocus("NVDA"));
    expect(result.current.focusedTicker).toBe("NVDA");
    expect(result.current.focusedHolding?.name).toBe("NVDA Inc.");

    act(() => result.current.toggleFocus("NVDA"));
    expect(result.current.focusedTicker).toBeNull();
  });

  it("別の銘柄で toggleFocus を呼ぶと、フォーカスを移す", () => {
    const { result } = setup();

    act(() => result.current.toggleFocus("NVDA"));
    act(() => result.current.toggleFocus("GOOGL"));

    expect(result.current.focusedTicker).toBe("GOOGL");
  });

  it("銘柄以外のクリックで解除し、data-preserve-focus の中のクリックでは解除しない", () => {
    const { result } = setup();
    const preserved = document.createElement("button");
    preserved.setAttribute("data-preserve-focus", "");
    document.body.append(preserved);

    act(() => result.current.toggleFocus("NVDA"));
    clickOn(preserved);
    expect(result.current.focusedTicker).toBe("NVDA");

    clickOn(document.body);
    expect(result.current.focusedTicker).toBeNull();
  });

  it("Esc キーで解除する", () => {
    const { result } = setup();

    act(() => result.current.toggleFocus("VOO"));
    pressKey("Escape");

    expect(result.current.focusedTicker).toBeNull();
  });

  it("フォーカス中は↑↓キーで前後の銘柄に移り、端では止まる", () => {
    const { result } = setup();

    act(() => result.current.toggleFocus("VOO"));
    pressKey("ArrowDown");
    expect(result.current.focusedTicker).toBe("NVDA");

    pressKey("ArrowDown");
    pressKey("ArrowDown");
    expect(result.current.focusedTicker).toBe("GOOGL");

    pressKey("ArrowUp");
    expect(result.current.focusedTicker).toBe("NVDA");
  });

  it("修飾キー付きの矢印キーや、フォーカスがないときの矢印キーは扱わない", () => {
    const { result } = setup();

    pressKey("ArrowDown");
    expect(result.current.focusedTicker).toBeNull();

    act(() => result.current.toggleFocus("VOO"));
    pressKey("ArrowDown", { shiftKey: true });
    expect(result.current.focusedTicker).toBe("VOO");
  });

  it("扱った矢印キーは、ページのスクロールを止める(preventDefault)", () => {
    const { result } = setup();
    act(() => result.current.toggleFocus("VOO"));

    const event = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
  });
});
