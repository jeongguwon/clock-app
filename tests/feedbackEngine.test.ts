import { describe, expect, it } from "vitest";
import { buildFeedbackMessages } from "../src/domain/feedbackEngine.js";

describe("buildFeedbackMessages", () => {
  it("오답 카테고리에 대응하는 피드백 메시지를 반환한다", () => {
    const messages = buildFeedbackMessages([
      "MINUTE_READING_ERROR",
      "AM_PM_COLOR_MISREAD",
    ]);

    expect(messages.length).toBe(2);
    expect(messages[0]).toContain("분침");
    expect(messages[1]).toContain("오전");
  });

  it("알 수 없는 카테고리에는 기본 피드백을 반환한다", () => {
    const messages = buildFeedbackMessages(["UNKNOWN_ERROR"]);

    expect(messages).toEqual(["입력한 값을 다시 확인해 주세요."]);
  });
});
