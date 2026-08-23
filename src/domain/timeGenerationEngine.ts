import type { Difficulty, TimePoint } from "./models.js";

type RandomFn = () => number;

const randomInt = (min: number, max: number, rng: RandomFn): number => {
  return Math.floor(rng() * (max - min + 1)) + min;
};

const periodFromHour24 = (hour24: number): "AM" | "PM" => {
  return hour24 < 12 ? "AM" : "PM";
};

export const generateRandomTime = (
  difficulty: Difficulty,
  rng: RandomFn = Math.random,
): TimePoint => {
  const hour24 = randomInt(0, 23, rng);
  const minute = randomInt(0, 59, rng);
  const second = difficulty === "easy" ? 0 : randomInt(0, 59, rng);

  return {
    hour24,
    minute,
    second,
    period: periodFromHour24(hour24),
  };
};
