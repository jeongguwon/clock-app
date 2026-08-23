import { evaluateTypeA, evaluateTypeB } from "../domain/clockScoringEngine.js";
import type {
  Difficulty,
  EvaluationResult,
  TimePoint,
  TypeAAnswer,
  TypeBAnswer,
} from "../domain/models.js";
import { generateRandomTime } from "../domain/timeGenerationEngine.js";

export type QuestionType = "typeA" | "typeB";

export type Question = {
  type: QuestionType;
  difficulty: Difficulty;
  expected: TimePoint;
};

export const generateQuestion = (
  difficulty: Difficulty,
  forcedType?: QuestionType,
  rng: () => number = Math.random,
): Question => {
  const expected = generateRandomTime(difficulty, rng);
  const type = forcedType ?? (rng() < 0.5 ? "typeA" : "typeB");

  return {
    type,
    difficulty,
    expected,
  };
};

export const evaluateQuestion = (
  question: Question,
  answer: TypeAAnswer | TypeBAnswer,
): EvaluationResult => {
  if (question.type === "typeA") {
    return evaluateTypeA({
      difficulty: question.difficulty,
      expected: question.expected,
      answer: answer as TypeAAnswer,
    });
  }

  return evaluateTypeB({
    expected: question.expected,
    answer: answer as TypeBAnswer,
  });
};
