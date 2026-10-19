import {
  formatGain,
  formatPercent,
  formatSignedPercent,
  formatSignedYen,
  formatYen,
  gainTone,
} from "./format";

describe("formatYen", () => {
  it("半角の円記号と3桁区切りで表示する", () => {
    expect(formatYen(115500)).toBe("¥115,500");
    expect(formatYen(0)).toBe("¥0");
  });
});

describe("formatPercent", () => {
  it("小数第1位〜第2位で表示する", () => {
    expect(formatPercent(15.5)).toBe("15.5%");
    expect(formatPercent(12.87)).toBe("12.87%");
    // JSON の 5.0 は数値の 5 になるが、表示は 5.0% にそろえる。
    expect(formatPercent(5)).toBe("5.0%");
  });
});

describe("符号付きの表示", () => {
  it.each([
    [15500, "+¥15,500"],
    [-339, "-¥339"],
    [0, "¥0"],
  ])("formatSignedYen(%p) → %p", (amount, expected) => {
    expect(formatSignedYen(amount)).toBe(expected);
  });

  it.each([
    [15.5, "+15.5%"],
    [-2.8, "-2.8%"],
    [0, "0.0%"],
  ])("formatSignedPercent(%p) → %p", (ratio, expected) => {
    expect(formatSignedPercent(ratio)).toBe(expected);
  });

  it("評価損益を「率 (額)」の形で表示する", () => {
    expect(formatGain(15500, 15.5)).toBe("+15.5% (+¥15,500)");
    expect(formatGain(-339, -2.8)).toBe("-2.8% (-¥339)");
  });
});

describe("gainTone", () => {
  it("プラス・マイナス・ゼロを判定する", () => {
    expect(gainTone(1)).toBe("positive");
    expect(gainTone(-1)).toBe("negative");
    expect(gainTone(0)).toBe("zero");
  });
});
