export type ChallengeId =
  | "timeattack_20_plus"
  | "quiz_perfect_3_streak"
  | "quiz_zero_score"
  | "study_30min";

export type SkinId = "default" | "lightning" | "exam" | "broken" | "graduate";

export type ChallengeState = Record<ChallengeId, boolean>;

export type ProgressState = {
  quizPerfectStreak: number;
};

export type UnlockResult = {
  unlockedChallenges: ChallengeId[];
  unlockedSkins: SkinId[];
};

export const createInitialChallengeState = (): ChallengeState => ({
  timeattack_20_plus: false,
  quiz_perfect_3_streak: false,
  quiz_zero_score: false,
  study_30min: false,
});

export const createInitialProgressState = (): ProgressState => ({
  quizPerfectStreak: 0,
});

const TIMEATTACK_UNLOCK_TARGET = 16;

const unlock = (
  challengeId: ChallengeId,
  skinId: SkinId,
  challenges: ChallengeState,
  unlocked: UnlockResult,
): void => {
  if (challenges[challengeId]) {
    return;
  }

  challenges[challengeId] = true;
  unlocked.unlockedChallenges.push(challengeId);
  unlocked.unlockedSkins.push(skinId);
};

export const evaluateQuizResult = (
  score: number,
  challenges: ChallengeState,
  progress: ProgressState,
): UnlockResult => {
  const unlocked: UnlockResult = { unlockedChallenges: [], unlockedSkins: [] };

  if (score === 100) {
    progress.quizPerfectStreak += 1;
  } else {
    progress.quizPerfectStreak = 0;
  }

  if (progress.quizPerfectStreak >= 3) {
    unlock("quiz_perfect_3_streak", "exam", challenges, unlocked);
  }

  if (score === 0) {
    unlock("quiz_zero_score", "broken", challenges, unlocked);
  }

  return unlocked;
};

export const evaluateTimeAttackResult = (
  correctCount: number,
  challenges: ChallengeState,
): UnlockResult => {
  const unlocked: UnlockResult = { unlockedChallenges: [], unlockedSkins: [] };

  if (correctCount >= TIMEATTACK_UNLOCK_TARGET) {
    unlock("timeattack_20_plus", "lightning", challenges, unlocked);
  }

  return unlocked;
};

export const evaluateStudyResult = (
  elapsedSeconds: number,
  challenges: ChallengeState,
): UnlockResult => {
  const unlocked: UnlockResult = { unlockedChallenges: [], unlockedSkins: [] };

  if (elapsedSeconds >= 1800) {
    unlock("study_30min", "graduate", challenges, unlocked);
  }

  return unlocked;
};
