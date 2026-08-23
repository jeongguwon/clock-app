import { describe, expect, it } from "vitest";
import { evaluateTypeA, evaluateTypeB } from "../src/domain/clockScoringEngine.js";
import type { TimePoint } from "../src/domain/models.js";

const expected: TimePoint = {
  hour24: 21,
  minute: 30,
  second: 15,
  period: "PM",
};

describe("evaluateTypeA", () => {
  it("쉬움 난이도에서는 초 입력 없이 정답 처리한다", () => {
    const result = evaluateTypeA({
      difficulty: "easy",
      expected,
      answer: { hour: 9, minute: 30 },
    });

    expect(result.isCorrect).toBe(true);
    expect(result.errorCategories).toHaveLength(0);
  });

  it("어려움 난이도는 24시간 입력을 검사한다", () => {
    const wrong = evaluateTypeA({
      difficulty: "hard",
      expected,
      answer: { hour24: 9, minute: 30, second: 15 },
    });

    const correct = evaluateTypeA({
      difficulty: "hard",
      expected,
      answer: { hour24: 21, minute: 30, second: 15 },
    });

    expect(wrong.isCorrect).toBe(false);
    expect(wrong.errorCategories).toContain("HOUR_24_FORMAT_ERROR");
    expect(correct.isCorrect).toBe(true);
  });
});

describe("evaluateTypeB", () => {
  it("허용 오차 0.5 눈금 이내면 정답 처리한다", () => {
    const result = evaluateTypeB({
      expected,
      answer: {
        hourAngle: 285,
        minuteAngle: 180,
        secondAngle: 90,
      },
    });

    expect(result.isCorrect).toBe(true);
  });

  it("오차가 크면 HAND_ALIGNMENT_ERROR를 반환한다", () => {
    const result = evaluateTypeB({
      expected,
      answer: {
        hourAngle: 240,
        minuteAngle: 120,
        secondAngle: 150,
      },
    });

    expect(result.isCorrect).toBe(false);
    expect(result.errorCategories).toContain("HAND_ALIGNMENT_ERROR");
  });
});
