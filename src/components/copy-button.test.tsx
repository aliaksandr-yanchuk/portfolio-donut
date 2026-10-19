import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./copy-button";

function setup() {
  // userEvent.setup() はテスト用のクリップボードを用意するため、writeText はその後に差し替える。
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const writeText = jest.spyOn(navigator.clipboard, "writeText");
  render(<CopyButton value="¥115,500" label="金額をコピー" />);
  return { user, writeText, button: screen.getByRole("button", { name: "金額をコピー" }) };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("CopyButton", () => {
  it("クリックすると値をクリップボードにコピーし、完了を表示・読み上げる", async () => {
    const { user, writeText, button } = setup();

    await user.click(button);

    expect(writeText).toHaveBeenCalledWith("¥115,500");
    // コピーは非同期のため、表示の更新を待つ。
    await waitFor(() => expect(button).toHaveAttribute("data-copy-status", "copied"));
    expect(screen.getByRole("status")).toHaveTextContent("コピーしました");
  });

  it("しばらくすると元の表示に戻る", async () => {
    const { user, button } = setup();

    await user.click(button);
    await waitFor(() => expect(button).toHaveAttribute("data-copy-status", "copied"));
    act(() => jest.advanceTimersByTime(1500));

    expect(button).toHaveAttribute("data-copy-status", "idle");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("コピーできなかった場合は、失敗を表示・読み上げる", async () => {
    const { user, writeText, button } = setup();
    writeText.mockRejectedValue(new Error("denied"));

    await user.click(button);

    await waitFor(() => expect(button).toHaveAttribute("data-copy-status", "failed"));
    expect(screen.getByRole("status")).toHaveTextContent("コピーできませんでした");
  });
});
