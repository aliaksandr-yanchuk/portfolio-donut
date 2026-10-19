import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockResponse from "@/features/portfolio/mocks/portfolio.json";
import { PortfolioScreen } from "./portfolio-screen";

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

/** 呼び出し側が任意のタイミングで応答を返せる fetch のモック */
function deferredFetch() {
  let respond: (response: Response) => void = () => {};
  global.fetch = jest.fn(() => new Promise<Response>((resolve) => (respond = resolve)));
  return (response: Response) => act(async () => respond(response));
}

const skeleton = () => document.querySelector('[aria-busy="true"] .animate-pulse');

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("PortfolioScreen", () => {
  it("すぐに取得できた場合は、スケルトンを出さずにポートフォリオを表示する(ちらつき防止)", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(mockResponse));

    render(<PortfolioScreen />);

    expect(skeleton()).toBeNull();
    expect(await screen.findByText("¥115,500")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/portfolio", expect.anything());
  });

  it("取得に時間がかかる場合は、スケルトンを表示してから、ポートフォリオを表示する", async () => {
    jest.useFakeTimers();
    const respond = deferredFetch();

    render(<PortfolioScreen />);
    expect(screen.getByLabelText("読み込み中")).toHaveAttribute("aria-busy", "true");
    expect(skeleton()).toBeNull();

    act(() => jest.advanceTimersByTime(200));
    expect(skeleton()).not.toBeNull();

    await respond(jsonResponse(mockResponse));
    // スケルトンは最低表示時間(500ms)が過ぎるまで残る。
    expect(skeleton()).not.toBeNull();
    act(() => jest.advanceTimersByTime(500));

    expect(screen.getByText("¥115,500")).toBeInTheDocument();
    expect(skeleton()).toBeNull();
  });

  it("取得に失敗したらエラーを表示し、再読み込みで再取得する", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse(mockResponse));
    const user = userEvent.setup();

    render(<PortfolioScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent("HTTP 500");
    await user.click(screen.getByRole("button", { name: "再読み込み" }));

    expect(await screen.findByText("¥115,500")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
