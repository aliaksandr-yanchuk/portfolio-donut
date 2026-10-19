import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockResponse from "@/features/portfolio/mocks/portfolio.json";
import { PortfolioScreen } from "./portfolio-screen";

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("PortfolioScreen", () => {
  it("読み込み中はスケルトンを表示し、取得後にポートフォリオを表示する", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(mockResponse));

    render(<PortfolioScreen />);

    expect(screen.getByLabelText("読み込み中")).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText("¥115,500")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/portfolio", expect.anything());
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
