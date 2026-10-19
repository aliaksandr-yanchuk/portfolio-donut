import { act, renderHook } from "@testing-library/react";
import { useDelayedLoading } from "./use-delayed-loading";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function setup() {
  return renderHook(
    ({ isLoading }) => useDelayedLoading(isLoading, { delay: 200, minDuration: 500 }),
    {
      initialProps: { isLoading: true },
    },
  );
}

const advance = (ms: number) => act(() => jest.advanceTimersByTime(ms));

describe("useDelayedLoading", () => {
  it("読み込みが待ち時間より早く終われば、一度も表示しない", () => {
    const { result, rerender } = setup();

    advance(150);
    expect(result.current).toBe(false);

    rerender({ isLoading: false });
    advance(1000);
    expect(result.current).toBe(false);
  });

  it("読み込みが長引くと、待ち時間の後に表示する", () => {
    const { result } = setup();

    advance(199);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
  });

  it("一度表示したら、読み込みが終わっても最低表示時間は出し続ける", () => {
    const { result, rerender } = setup();

    advance(200); // 表示開始
    advance(100);
    rerender({ isLoading: false }); // 表示から100msで読み込み完了

    advance(399);
    expect(result.current).toBe(true);
    advance(1); // 表示から500ms
    expect(result.current).toBe(false);
  });

  it("最低表示時間を過ぎてから読み込みが終われば、すぐに消す", () => {
    const { result, rerender } = setup();

    advance(200 + 800);
    rerender({ isLoading: false });
    advance(0);

    expect(result.current).toBe(false);
  });
});
