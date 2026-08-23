import { describe, expect, it } from "vitest";
import { evaluateQuestion, generateQuestion } from "../src/app/questionFlow.js";

const fixedRng = (values: number[]) => {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
};

describe("questionFlow", () => {
  it("강제 타입 지정 시 해당 문제 타입으로 생성한다", () => {
    const qA = generateQuestion("easy", "typeA", fixedRng([0.1, 0.2, 0.3]));
    const qB = generateQuestion("normal", "typeB", fixedRng([0.4, 0.5, 0.6]));

    expect(qA.type).toBe("typeA");
    expect(qB.type).toBe("typeB");
  });

  it("유형 A 쉬움은 초 입력 없이 정답 가능하다", () => {
    const q = generateQuestion("easy", "typeA", fixedRng([0.9, 0.3, 0.7]));
    const hour12 = q.expected.hour24 % 12 || 12;

    const result = evaluateQuestion(q, {
      hour: hour12,
      minute: q.expected.minute,
    });

    expect(result.isCorrect).toBe(true);
  });

  it("유형 B 오답은 HAND_ALIGNMENT_ERROR를 반환한다", () => {
    const q = generateQuestion("normal", "typeB", fixedRng([0.9, 0.3, 0.7, 0.2]));

    const result = evaluateQuestion(q, {
      hourAngle: 0,
      minuteAngle: 0,
      secondAngle: 0,
    });

    expect(result.isCorrect).toBe(false);
    expect(result.errorCategories).toContain("HAND_ALIGNMENT_ERROR");
  });
});
