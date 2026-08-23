const STUDY_STEPS = ["시침", "분침", "초침", "오전/오후"] as const;

export type StudyStep = (typeof STUDY_STEPS)[number];

export class StudySession {
  private readonly startedAtMs: number;
  private stepIndex = 0;

  constructor(startedAtMs = Date.now()) {
    this.startedAtMs = startedAtMs;
  }

  getCurrentStep(): StudyStep {
    return STUDY_STEPS[this.stepIndex] ?? STUDY_STEPS[0];
  }

  nextStep(): StudyStep {
    if (this.stepIndex < STUDY_STEPS.length - 1) {
      this.stepIndex += 1;
    }
    return this.getCurrentStep();
  }

  getSummary(nowMs = Date.now()): { elapsedSeconds: number; challengeUnlocked: boolean } {
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - this.startedAtMs) / 1000));
    return {
      elapsedSeconds,
      challengeUnlocked: elapsedSeconds >= 1800,
    };
  }
}
