import { describe, expect, it } from "vitest";
import { generateRandomTime } from "../src/domain/timeGenerationEngine.js";

const fixedRng = (values: number[]) => {
  let idx = 0;
  return () => {
    const value = values[idx] ?? values[values.length - 1] ?? 0;
    idx += 1;
    return value;
  };
};

describe("generateRandomTime", () => {
  it("쉬움 난이도에서는 초를 0으로 고정한다", () => {
    const time = generateRandomTime("easy", fixedRng([0.5, 0.5, 0.9]));

    expect(time.second).toBe(0);
  });

  it("보통 난이도에서는 초가 0~59 범위로 생성된다", () => {
    const time = generateRandomTime("normal", fixedRng([0.1, 0.2, 0.3]));

    expect(time.second).toBeGreaterThanOrEqual(0);
    expect(time.second).toBeLessThanOrEqual(59);
  });

  it("어려움 난이도에서는 hour24와 period가 일치한다", () => {
    const amTime = generateRandomTime("hard", fixedRng([0, 0, 0]));
    const pmTime = generateRandomTime("hard", fixedRng([0.9, 0.2, 0.1]));

    expect(amTime.hour24).toBeGreaterThanOrEqual(0);
    expect(amTime.hour24).toBeLessThanOrEqual(23);
    expect(amTime.period).toBe("AM");

    expect(pmTime.hour24).toBeGreaterThanOrEqual(0);
    expect(pmTime.hour24).toBeLessThanOrEqual(23);
    expect(pmTime.period).toBe("PM");
  });
});
