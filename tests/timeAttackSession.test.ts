import { describe, expect, it } from "vitest";
import { TimeAttackSession } from "../src/app/timeAttackSession.js";

describe("TimeAttackSession", () => {
  it("60초 안에 정답 수를 집계한다", () => {
    const session = new TimeAttackSession(60, 1_000);

    session.submit(true, 30_000);
    session.submit(false, 40_000);
    session.submit(true, 50_000);

    const summary = session.getSummary(56_000);

    expect(summary.correctCount).toBe(2);
    expect(summary.isCompleted).toBe(false);
    expect(summary.remainingSeconds).toBe(5);
  });

  it("만료 이후 제출은 무효 처리한다", () => {
    const session = new TimeAttackSession(60, 1_000);

    session.submit(true, 61_000);
    const summary = session.getSummary(61_000);

    expect(summary.correctCount).toBe(0);
    expect(summary.isCompleted).toBe(true);
    expect(summary.remainingSeconds).toBe(0);
  });
});
