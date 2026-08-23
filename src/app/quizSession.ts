type SubmitPayload = {
  isCorrect: boolean;
  errorCategories: string[];
};

type ErrorCount = {
  category: string;
  count: number;
};

type QuizSummary = {
  totalQuestions: number;
  answeredQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
};

export class QuizSession {
  private readonly totalQuestions: number;
  private readonly pointsPerQuestion: number;
  private answeredQuestions = 0;
  private correctCount = 0;
  private wrongCount = 0;
  private readonly errorCounts = new Map<string, number>();

  constructor(totalQuestions = 20, pointsPerQuestion = 5) {
    this.totalQuestions = totalQuestions;
    this.pointsPerQuestion = pointsPerQuestion;
  }

  submit(payload: SubmitPayload): void {
    if (this.answeredQuestions >= this.totalQuestions) {
      return;
    }

    this.answeredQuestions += 1;

    if (payload.isCorrect) {
      this.correctCount += 1;
      return;
    }

    this.wrongCount += 1;
    for (const category of payload.errorCategories) {
      const count = this.errorCounts.get(category) ?? 0;
      this.errorCounts.set(category, count + 1);
    }
  }

  getSummary(): QuizSummary {
    return {
      totalQuestions: this.totalQuestions,
      answeredQuestions: this.answeredQuestions,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      score: this.correctCount * this.pointsPerQuestion,
    };
  }

  getTopErrorCategories(limit = 3): ErrorCount[] {
    return [...this.errorCounts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
