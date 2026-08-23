type TimeAttackSummary = {
  correctCount: number;
  attemptedCount: number;
  remainingSeconds: number;
  isCompleted: boolean;
};

export class TimeAttackSession {
  private readonly durationSeconds: number;
  private readonly startedAtMs: number;
  private correctCount = 0;
  private attemptedCount = 0;

  constructor(durationSeconds = 60, startedAtMs = Date.now()) {
    this.durationSeconds = durationSeconds;
    this.startedAtMs = startedAtMs;
  }

  submit(isCorrect: boolean, submittedAtMs = Date.now()): boolean {
    if (this.isExpired(submittedAtMs)) {
      return false;
    }

    this.attemptedCount += 1;
    if (isCorrect) {
      this.correctCount += 1;
    }

    return true;
  }

  getSummary(nowMs = Date.now()): TimeAttackSummary {
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - this.startedAtMs) / 1000));
    const remainingSeconds = Math.max(0, this.durationSeconds - elapsedSeconds);

    return {
      correctCount: this.correctCount,
      attemptedCount: this.attemptedCount,
      remainingSeconds,
      isCompleted: remainingSeconds === 0,
    };
  }

  private isExpired(nowMs: number): boolean {
    return this.getSummary(nowMs).isCompleted;
  }
}
