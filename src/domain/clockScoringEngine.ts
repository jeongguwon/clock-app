import { circularDiff, normalizeAngle, timeToClockHandState } from "./clockMath.js";
import type {
  EvaluationResult,
  TypeAEvaluationInput,
  TypeBEvaluationInput,
} from "./models.js";

const buildResult = (
  hour: boolean,
  minute: boolean,
  second: boolean,
  categories: string[],
): EvaluationResult => {
  return {
    isCorrect: hour && minute && second,
    handResult: { hour, minute, second },
    errorCategories: categories,
  };
};

export const evaluateTypeA = (input: TypeAEvaluationInput): EvaluationResult => {
  const { difficulty, expected, answer } = input;

  const minuteOk = answer.minute === expected.minute;
  const secondOk = difficulty === "easy" ? true : answer.second === expected.second;

  const hourOk =
    difficulty === "hard"
      ? answer.hour24 === expected.hour24
      : answer.hour === expected.hour24 % 12 ||
        (expected.hour24 % 12 === 0 && answer.hour === 12);

  const categories: string[] = [];
  if (!hourOk) {
    categories.push(difficulty === "hard" ? "HOUR_24_FORMAT_ERROR" : "HOUR_READING_ERROR");
  }
  if (!minuteOk) {
    categories.push("MINUTE_READING_ERROR");
  }
  if (!secondOk) {
    categories.push("SECOND_IGNORED_ERROR");
  }

  return buildResult(hourOk, minuteOk, secondOk, categories);
};

export const evaluateTypeB = (input: TypeBEvaluationInput): EvaluationResult => {
  const toleranceTick = 0.5;
  const expectedState = timeToClockHandState(input.expected);

  const expectedHourTick = normalizeAngle(expectedState.hourAngle) / 30;
  const expectedMinuteTick = normalizeAngle(expectedState.minuteAngle) / 6;
  const expectedSecondTick = normalizeAngle(expectedState.secondAngle) / 6;

  const userHourTick = normalizeAngle(input.answer.hourAngle) / 30;
  const userMinuteTick = normalizeAngle(input.answer.minuteAngle) / 6;
  const userSecondTick = normalizeAngle(input.answer.secondAngle) / 6;

  const hourOk = circularDiff(userHourTick, expectedHourTick, 12) <= toleranceTick;
  const minuteOk = circularDiff(userMinuteTick, expectedMinuteTick, 60) <= toleranceTick;
  const secondOk = circularDiff(userSecondTick, expectedSecondTick, 60) <= toleranceTick;

  const categories: string[] = [];
  if (!hourOk || !minuteOk || !secondOk) {
    categories.push("HAND_ALIGNMENT_ERROR");
  }

  return buildResult(hourOk, minuteOk, secondOk, categories);
};
