import { describe, expect, it } from "vitest";
import {
  createInitialChallengeState,
  createInitialProgressState,
  evaluateQuizResult,
  evaluateStudyResult,
  evaluateTimeAttackResult,
} from "../src/app/challengeEngine.js";

describe("challengeEngine", () => {
  it("타임어택 16개 이상 정답 시 번개 스킨 도전과제가 해금된다", () => {
    const challenges = createInitialChallengeState();

    const result = evaluateTimeAttackResult(16, challenges);

    expect(result.unlockedChallenges).toContain("timeattack_20_plus");
    expect(result.unlockedSkins).toContain("lightning");
  });

  it("문제풀기 100점을 3회 연속 달성하면 시험지 스킨이 해금된다", () => {
    const challenges = createInitialChallengeState();
    const progress = createInitialProgressState();

    evaluateQuizResult(100, challenges, progress);
    evaluateQuizResult(100, challenges, progress);
    const result = evaluateQuizResult(100, challenges, progress);

    expect(result.unlockedChallenges).toContain("quiz_perfect_3_streak");
    expect(result.unlockedSkins).toContain("exam");
  });

  it("문제풀기 0점이면 부서진 스킨 도전과제가 해금된다", () => {
    const challenges = createInitialChallengeState();
    const progress = createInitialProgressState();

    const result = evaluateQuizResult(0, challenges, progress);

    expect(result.unlockedChallenges).toContain("quiz_zero_score");
    expect(result.unlockedSkins).toContain("broken");
  });

  it("공부하기 30분 이상 체류 시 학사모 스킨 도전과제가 해금된다", () => {
    const challenges = createInitialChallengeState();

    const result = evaluateStudyResult(1800, challenges);

    expect(result.unlockedChallenges).toContain("study_30min");
    expect(result.unlockedSkins).toContain("graduate");
  });

  it("이미 달성한 도전과제는 중복 해금되지 않는다", () => {
    const challenges = createInitialChallengeState();

    const first = evaluateTimeAttackResult(25, challenges);
    const second = evaluateTimeAttackResult(30, challenges);

    expect(first.unlockedChallenges.length).toBe(1);
    expect(second.unlockedChallenges.length).toBe(0);
  });
});
