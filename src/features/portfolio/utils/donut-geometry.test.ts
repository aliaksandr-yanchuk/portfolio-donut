import { computeArcs, describeRingSegment, polarToCartesian } from "./donut-geometry";

const TAU = Math.PI * 2;

describe("computeArcs", () => {
  it("12時(角度0)から始まり、値の割合どおりに時計回りで一周する", () => {
    const arcs = computeArcs([50, 25, 25]);

    expect(arcs[0].startAngle).toBeCloseTo(0);
    expect(arcs[0].endAngle).toBeCloseTo(Math.PI);
    expect(arcs[1].startAngle).toBeCloseTo(Math.PI);
    expect(arcs[1].endAngle).toBeCloseTo(Math.PI * 1.5);
    expect(arcs[2].endAngle).toBeCloseTo(TAU);
  });

  it("合計が100にならない値も、合計で正規化して一周にそろえる", () => {
    const arcs = computeArcs([39.8, 15.2, 14.7, 10.2, 9.9, 5.2, 4.9]);
    expect(arcs.at(-1)!.endAngle).toBeCloseTo(TAU);
  });

  it("要素間の隙間の半分ずつを、各要素の両端から削る", () => {
    const gap = 0.1;
    const [first, second] = computeArcs([50, 50], gap);

    expect(first.startAngle).toBeCloseTo(gap / 2);
    expect(first.endAngle).toBeCloseTo(Math.PI - gap / 2);
    expect(second.startAngle - first.endAngle).toBeCloseTo(gap);
  });

  it("要素が1つのときは隙間を入れず、完全な円にする", () => {
    const [only] = computeArcs([100], 0.1);
    expect(only).toEqual({ startAngle: 0, endAngle: TAU });
  });

  it("隙間より小さい要素も消えずに幅を残す", () => {
    const tiny = computeArcs([99.9, 0.1], 0.1)[1];
    expect(tiny.endAngle - tiny.startAngle).toBeGreaterThan(0);
  });

  it("合計が0のときは、どの要素も描画しない", () => {
    expect(computeArcs([0, 0])).toEqual([
      { startAngle: 0, endAngle: 0 },
      { startAngle: 0, endAngle: 0 },
    ]);
  });
});

describe("polarToCartesian", () => {
  it("角度0は真上(12時)、π/2 は右(3時)になる", () => {
    const top = polarToCartesian(100, 100, 50, 0);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);

    const right = polarToCartesian(100, 100, 50, Math.PI / 2);
    expect(right.x).toBeCloseTo(150);
    expect(right.y).toBeCloseTo(100);
  });
});

describe("describeRingSegment", () => {
  it("外側の円弧 → 内側の円弧の順で閉じたパスを作る", () => {
    const path = describeRingSegment(100, 100, 50, 30, { startAngle: 0, endAngle: Math.PI / 2 });
    expect(path).toBe("M 100 50 A 50 50 0 0 1 150 100 L 130 100 A 30 30 0 0 0 100 70 Z");
  });

  it("半周を超える要素は large-arc フラグを立てる", () => {
    const path = describeRingSegment(100, 100, 50, 30, { startAngle: 0, endAngle: Math.PI * 1.5 });
    expect(path).toContain("A 50 50 0 1 1");
  });

  it("一周分の要素は、半円2つのパスに分けて描く", () => {
    const path = describeRingSegment(100, 100, 50, 30, { startAngle: 0, endAngle: TAU });
    expect(path.match(/M /g)).toHaveLength(2);
  });

  it("幅0の要素は空のパスを返す", () => {
    expect(describeRingSegment(100, 100, 50, 30, { startAngle: 1, endAngle: 1 })).toBe("");
  });
});
