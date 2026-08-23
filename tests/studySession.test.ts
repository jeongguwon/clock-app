import { describe, expect, it } from "vitest";
import { StudySession } from "../src/app/studySession.js";

describe("StudySession", () => {
  it("설명 순서가 시침-분침-초침-오전/오후 순서로 진행된다", () => {
    const session = new StudySession(0);

    expect(session.getCurrentStep()).toBe("시침");
    expect(session.nextStep()).toBe("분침");
    expect(session.nextStep()).toBe("초침");
    expect(session.nextStep()).toBe("오전/오후");
  });

  it("30분 연속 체류 시 도전과제 달성 상태가 된다", () => {
    const session = new StudySession(1_000);

    expect(session.getSummary(1_000).challengeUnlocked).toBe(false);
    expect(session.getSummary(1_000 + 29 * 60 * 1000).challengeUnlocked).toBe(false);
    expect(session.getSummary(1_000 + 30 * 60 * 1000).challengeUnlocked).toBe(true);
  });
});
