import type { ClockHandState, TimePoint } from "./models.js";

export const normalizeAngle = (angle: number): number => {
  const normalized = angle % 360;
  return normalized >= 0 ? normalized : normalized + 360;
};

export const circularDiff = (
  actual: number,
  expected: number,
  maxValue: number,
): number => {
  const rawDiff = Math.abs(actual - expected);
  return Math.min(rawDiff, maxValue - rawDiff);
};

export const timeToClockHandState = (time: TimePoint): ClockHandState => {
  const hour12 = time.hour24 % 12;
  const hourTick = hour12 + time.minute / 60;

  return {
    hourAngle: hourTick * 30,
    minuteAngle: time.minute * 6,
    secondAngle: time.second * 6,
  };
};
