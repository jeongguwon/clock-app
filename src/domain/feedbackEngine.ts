const feedbackTemplates: Record<string, string> = {
  MINUTE_READING_ERROR: "분침이 가리키는 숫자는 5분 단위예요. 예를 들어 6은 30분을 의미해요.",
  SECOND_IGNORED_ERROR: "초침도 함께 확인해 주세요. 초는 0부터 59까지예요.",
  AM_PM_COLOR_MISREAD: "파랑 원은 오전(AM), 빨강 원은 오후(PM)를 의미해요.",
  HOUR_24_FORMAT_ERROR: "어려움 난이도는 24시간 형식으로 입력해야 해요. 예: 오후 9시 = 21시",
  HAND_ALIGNMENT_ERROR: "각 바늘이 정확한 눈금을 가리키는지 다시 확인해 주세요.",
  HOUR_READING_ERROR: "시침은 분의 위치에 따라 중간 위치를 가리킬 수 있어요.",
};

const defaultMessage = "입력한 값을 다시 확인해 주세요.";

export const buildFeedbackMessages = (errorCategories: string[]): string[] => {
  if (errorCategories.length === 0) {
    return [];
  }

  return errorCategories.map((category) => feedbackTemplates[category] ?? defaultMessage);
};
