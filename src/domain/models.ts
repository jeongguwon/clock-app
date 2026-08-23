export type Difficulty = "easy" | "normal" | "hard";

export type TimePoint = {
  hour24: number;
  minute: number;
  second: number;
  period: "AM" | "PM";
};

export type ClockHandState = {
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

export type TypeAAnswer = {
  hour?: number;
  minute: number;
  second?: number;
  hour24?: number;
};

export type TypeBAnswer = {
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
};

export type TypeAEvaluationInput = {
  difficulty: Difficulty;
  expected: TimePoint;
  answer: TypeAAnswer;
};

export type TypeBEvaluationInput = {
  expected: TimePoint;
  answer: TypeBAnswer;
};

export type EvaluationResult = {
  isCorrect: boolean;
  handResult: {
    hour: boolean;
    minute: boolean;
    second: boolean;
  };
  errorCategories: string[];
};
