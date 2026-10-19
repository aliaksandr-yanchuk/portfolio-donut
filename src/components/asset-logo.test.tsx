import { fireEvent, render, screen } from "@testing-library/react";
import { AssetLogo } from "./asset-logo";

describe("AssetLogo", () => {
  it("ロゴ画像を表示する", () => {
    const { container } = render(
      <AssetLogo src="https://example.com/VOO.svg" tickerSymbol="VOO" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/VOO.svg");
  });

  it("画像を読み込めなかった場合は、ティッカーの頭文字を代わりに表示する", () => {
    const { container } = render(
      <AssetLogo src="https://example.com/missing.svg" tickerSymbol="GOOGL" />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("asset-logo-fallback")).toHaveTextContent("GO");
  });
});
