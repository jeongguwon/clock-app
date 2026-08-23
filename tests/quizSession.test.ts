import { describe, expect, it } from "vitest";
import { QuizSession } from "../src/app/quizSession.js";

describe("QuizSession", () => {
  it("20문제 기준으로 정답 수에 맞게 점수를 계산한다", () => {
    const session = new QuizSession();

    for (let i = 0; i < 12; i += 1) {
      session.submit({ isCorrect: true, errorCategories: [] });
    }

    for (let i = 0; i < 8; i += 1) {
      session.submit({ isCorrect: false, errorCategories: ["MINUTE_READING_ERROR"] });
    }

    const summary = session.getSummary();

    expect(summary.totalQuestions).toBe(20);
    expect(summary.correctCount).toBe(12);
    expect(summary.wrongCount).toBe(8);
    expect(summary.score).toBe(60);
  });

  it("오답 유형을 집계해 상위 유형을 반환한다", () => {
    const session = new QuizSession();

    session.submit({ isCorrect: false, errorCategories: ["MINUTE_READING_ERROR"] });
    session.submit({ isCorrect: false, errorCategories: ["MINUTE_READING_ERROR"] });
    session.submit({ isCorrect: false, errorCategories: ["HAND_ALIGNMENT_ERROR"] });

    const top = session.getTopErrorCategories(2);

    expect(top[0]).toEqual({ category: "MINUTE_READING_ERROR", count: 2 });
    expect(top[1]).toEqual({ category: "HAND_ALIGNMENT_ERROR", count: 1 });
  });
});
