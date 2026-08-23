const views = Array.from(document.querySelectorAll(".view"));
const gotoButtons = Array.from(document.querySelectorAll("[data-goto]"));

const steps = ["시침", "분침", "초침", "오전/오후"];
let stepIndex = 0;
let currentView = "home";
let studyEnteredAt = Date.now();
let currentStudyTime = { hour24: 0, minute: 0, second: 0 };

const storageKeys = {
  challengeState: "tm.challengeState",
  userProgress: "tm.userProgress",
  skinInventory: "tm.skinInventory",
  badgeClickLog: "tm.badgeClickLog",
};

const skinMeta = {
  default: { label: "기본", challenge: null },
  lightning: { label: "번개", challenge: "timeattack_20_plus" },
  exam: { label: "시험지", challenge: "quiz_perfect_3_streak" },
  broken: { label: "부서진", challenge: "quiz_zero_score" },
  graduate: { label: "학사모", challenge: "study_30min" },
};

const challengeToSkin = {
  timeattack_20_plus: "lightning",
  quiz_perfect_3_streak: "exam",
  quiz_zero_score: "broken",
  study_30min: "graduate",
};

const TIMEATTACK_UNLOCK_TARGET = 16;
const isHardDifficulty = (difficulty) => difficulty === "hard";
const isDevelopmentMode =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "" ||
  new URLSearchParams(window.location.search).get("dev") === "1";

const viewsByName = {
  home: document.querySelector('[data-view="home"]'),
  skins: document.querySelector('[data-view="skins"]'),
  challenges: document.querySelector('[data-view="challenges"]'),
  study: document.querySelector('[data-view="study"]'),
  quiz: document.querySelector('[data-view="quiz"]'),
  timeattack: document.querySelector('[data-view="timeattack"]'),
};

const studyStepEl = document.getElementById("study-step");
const studyDigitalEl = document.getElementById("study-digital");
const studyNextButton = document.getElementById("study-next-step");
const studyGuideProgressEl = document.getElementById("study-guide-progress");
const studyGuideTitleEl = document.getElementById("study-guide-title");
const studyGuideTextEl = document.getElementById("study-guide-text");
const studyGuidePointsEl = document.getElementById("study-guide-points");

const skinGridEl = document.getElementById("skin-grid");
const equippedSkinLabelEl = document.getElementById("equipped-skin-label");
const unlockToastEl = document.getElementById("unlock-toast");
const homeMenuToggleEl = document.getElementById("home-menu-toggle");
const homeMenuPanelEl = document.getElementById("home-menu-panel");
const challengeSummaryEl = document.getElementById("challenge-summary");
const challengeProgressListEl = document.getElementById("challenge-progress-list");
const recentActivityListEl = document.getElementById("recent-activity-list");
const skinPanelEl = document.querySelector(".skin-panel");
const challengePanelEl = document.querySelector(".challenge-panel");

const quizDifficultyEl = document.getElementById("quiz-difficulty");
const quizStartEl = document.getElementById("quiz-start");
const quizSubmitEl = document.getElementById("quiz-submit");
const quizProgressEl = document.getElementById("quiz-progress");
const quizTypeEl = document.getElementById("quiz-type");
const quizTargetTextEl = document.getElementById("quiz-target-text");
const quizFeedbackEl = document.getElementById("quiz-feedback");
const quizSummaryEl = document.getElementById("quiz-summary");
const quizTypeAPanel = document.getElementById("quiz-type-a-panel");
const quizTypeBPanel = document.getElementById("quiz-type-b-panel");
const quizResultOverlayEl = document.getElementById("quiz-result-overlay");
const quizResultCard = document.getElementById("quiz-result-card");
const quizResultText = document.getElementById("quiz-result-text");
const quizResultBadgesEl = document.getElementById("quiz-result-badges");
const quizRestartEl = document.getElementById("quiz-restart");
const quizResultHomeEl = document.getElementById("quiz-result-home");
const quizHandPick = document.getElementById("quiz-hand-pick");
const quizDragHelp = document.getElementById("quiz-drag-help");
const quizMeridiemHelpEl = document.getElementById("quiz-meridiem-help");

const taDifficultyEl = document.getElementById("ta-difficulty");
const taStartEl = document.getElementById("ta-start");
const taSubmitEl = document.getElementById("ta-submit");
const taTimerEl = document.getElementById("ta-timer");
const taTypeEl = document.getElementById("ta-type");
const taTargetTextEl = document.getElementById("ta-target-text");
const taFeedbackEl = document.getElementById("ta-feedback");
const taSummaryEl = document.getElementById("ta-summary");
const taTypeAPanel = document.getElementById("ta-type-a-panel");
const taTypeBPanel = document.getElementById("ta-type-b-panel");
const taResultOverlayEl = document.getElementById("ta-result-overlay");
const taResultCard = document.getElementById("ta-result-card");
const taResultText = document.getElementById("ta-result-text");
const taResultBadgesEl = document.getElementById("ta-result-badges");
const taRestartEl = document.getElementById("ta-restart");
const taResultHomeEl = document.getElementById("ta-result-home");
const taHandPick = document.getElementById("ta-hand-pick");
const taDragHelp = document.getElementById("ta-drag-help");
const taMeridiemHelpEl = document.getElementById("ta-meridiem-help");
const challengeFlyCardEl = document.getElementById("challenge-fly-card");
const challengeFlyTitleEl = document.getElementById("challenge-fly-title");
const challengeFlyDetailEl = document.getElementById("challenge-fly-detail");

let toastTimerId = null;
let panelSpotlightTimerId = null;
let itemSpotlightTimerId = null;
let challengeFlyEnterTimerId = null;
let challengeFlyExitTimerId = null;
let quizClockFeedbackTimerId = null;
let taClockFeedbackTimerId = null;

const hourInputQuiz = document.getElementById("quiz-hour");
const minuteInputQuiz = document.getElementById("quiz-minute");
const secondInputQuiz = document.getElementById("quiz-second");

const hourInputTa = document.getElementById("ta-hour");
const minuteInputTa = document.getElementById("ta-minute");
const secondInputTa = document.getElementById("ta-second");

const pad = (value) => String(value).padStart(2, "0");

const toNumber = (input, fallback = 0) => {
  if (!input) {
    return fallback;
  }
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const nextHour12 = (hour12) => (hour12 === 12 ? 1 : hour12 + 1);

const toHour12 = (hour24) => {
  const hour12 = hour24 % 12;
  return hour12 === 0 ? 12 : hour12;
};

const circularDiff = (actual, expected, maxValue) => {
  const raw = Math.abs(actual - expected);
  return Math.min(raw, maxValue - raw);
};

const safeParse = (value, fallback) => {
  try {
    if (!value) {
      return fallback;
    }
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const readChallengeState = () => {
  return safeParse(localStorage.getItem(storageKeys.challengeState), {
    timeattack_20_plus: false,
    quiz_perfect_3_streak: false,
    quiz_zero_score: false,
    study_30min: false,
  });
};

const readUserProgress = () => {
  return safeParse(localStorage.getItem(storageKeys.userProgress), {
    quizPerfectStreak: 0,
    quizBestScore: 0,
    timeAttackBest: 0,
    studyBestSeconds: 0,
    studyAccumulatedSeconds: 0,
  });
};

const readSkinInventory = () => {
  return safeParse(localStorage.getItem(storageKeys.skinInventory), {
    owned: ["default"],
    equipped: "default",
  });
};

const challengeState = readChallengeState();
const userProgress = readUserProgress();
const skinInventory = readSkinInventory();

challengeState.timeattack_20_plus ??= false;
challengeState.quiz_perfect_3_streak ??= false;
challengeState.quiz_zero_score ??= false;
challengeState.study_30min ??= false;

userProgress.quizPerfectStreak ??= 0;
userProgress.quizBestScore ??= 0;
userProgress.timeAttackBest ??= 0;
userProgress.studyBestSeconds ??= 0;
userProgress.studyAccumulatedSeconds ??= userProgress.studyBestSeconds ?? 0;

skinInventory.owned ??= ["default"];
skinInventory.equipped ??= "default";

if (isDevelopmentMode) {
  skinInventory.owned = Object.keys(skinMeta);
}

const saveChallengeState = () => {
  localStorage.setItem(storageKeys.challengeState, JSON.stringify(challengeState));
};

const saveUserProgress = () => {
  localStorage.setItem(storageKeys.userProgress, JSON.stringify(userProgress));
};

const saveSkinInventory = () => {
  localStorage.setItem(storageKeys.skinInventory, JSON.stringify(skinInventory));
};

const getClockParts = (clockType) => {
  const root = document.querySelector(`[data-clock="${clockType}"]`);
  if (!root) {
    return null;
  }
  return {
    root,
    hour: root.querySelector('[data-hand="hour"]'),
    minute: root.querySelector('[data-hand="minute"]'),
    second: root.querySelector('[data-hand="second"]'),
  };
};

const homeClock = getClockParts("realtime");
const studyClock = getClockParts("study");
const quizClock = getClockParts("quiz");
const taClock = getClockParts("timeattack");

const attachClockNumbers = (clockParts) => {
  if (!clockParts || !clockParts.root) {
    return;
  }

  if (clockParts.root.querySelector(".clock-number")) {
    return;
  }

  const radiusPercent = 34;
  for (let hour = 1; hour <= 12; hour += 1) {
    const angle = (hour / 12) * Math.PI * 2;
    const x = Math.sin(angle) * radiusPercent;
    const y = -Math.cos(angle) * radiusPercent;

    const label = document.createElement("span");
    label.className = "clock-number";
    label.textContent = String(hour);
    label.style.left = `${50 + x}%`;
    label.style.top = `${50 + y}%`;
    clockParts.root.appendChild(label);
  }
};

const setClockByAngles = (clockParts, angles) => {
  if (!clockParts || !clockParts.hour || !clockParts.minute || !clockParts.second) {
    return;
  }

  clockParts.hour.style.transform = `translateX(-50%) rotate(${angles.hour}deg)`;
  clockParts.minute.style.transform = `translateX(-50%) rotate(${angles.minute}deg)`;
  clockParts.second.style.transform = `translateX(-50%) rotate(${angles.second}deg)`;
};

const setClockMeridiem = (clockParts, hour24) => {
  if (!clockParts || !clockParts.root) {
    return;
  }
  clockParts.root.dataset.meridiem = hour24 < 12 ? "am" : "pm";
};

const setClockMeridiemChoice = (clockParts, choice) => {
  if (!clockParts || !clockParts.root) {
    return;
  }
  clockParts.root.dataset.meridiemChoice = choice;
};

const setClockByTime = (clockParts, hour24, minute, second) => {
  const hour12 = hour24 % 12;
  const hourDeg = (hour12 + minute / 60) * 30;
  const minuteDeg = minute * 6;
  const secondDeg = second * 6;
  setClockByAngles(clockParts, { hour: hourDeg, minute: minuteDeg, second: secondDeg });
  setClockMeridiem(clockParts, hour24);
  if (clockParts.root) {
    clockParts.root.removeAttribute("data-meridiem-choice");
  }
};

const flashAnswerClockFeedback = (mode, isCorrect) => {
  const clockParts = mode === "quiz" ? quizClock : taClock;
  const card = clockParts?.root?.closest(".clock-card");
  if (!(card instanceof HTMLElement)) {
    return;
  }

  const timerId = mode === "quiz" ? quizClockFeedbackTimerId : taClockFeedbackTimerId;
  if (timerId) {
    clearTimeout(timerId);
  }

  card.classList.remove("answer-correct-flash", "answer-wrong-flash");
  void card.offsetWidth;
  card.classList.add(isCorrect ? "answer-correct-flash" : "answer-wrong-flash");

  const nextTimerId = setTimeout(() => {
    card.classList.remove("answer-correct-flash", "answer-wrong-flash");
    if (mode === "quiz") {
      quizClockFeedbackTimerId = null;
    } else {
      taClockFeedbackTimerId = null;
    }
  }, 620);

  if (mode === "quiz") {
    quizClockFeedbackTimerId = nextTimerId;
  } else {
    taClockFeedbackTimerId = nextTimerId;
  }
};

for (const clockParts of [homeClock, studyClock, quizClock, taClock]) {
  attachClockNumbers(clockParts);
}

const circularAngleDiff = (a, b) => {
  const diff = Math.abs(((a - b + 540) % 360) - 180);
  return diff;
};

const pickNearestHand = (angle, angles, thresholdDeg = 18) => {
  const entries = [
    ["hour", circularAngleDiff(angle, angles.hour)],
    ["minute", circularAngleDiff(angle, angles.minute)],
    ["second", circularAngleDiff(angle, angles.second)],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  const [hand, diff] = entries[0];
  return diff <= thresholdDeg ? hand : null;
};

const angleFromPointer = (event, clockRoot) => {
  const rect = clockRoot.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return (angle + 360) % 360;
};

const feedbackMap = {
  MINUTE_READING_ERROR: "분침이 가리키는 숫자는 5분 단위예요.",
  SECOND_IGNORED_ERROR: "초침도 함께 확인해 주세요.",
  AM_PM_COLOR_MISREAD: "파랑은 오전, 빨강은 오후를 의미해요.",
  HOUR_24_FORMAT_ERROR: "어려움 난이도에서는 24시간 형식으로 입력해 주세요.",
  HAND_ALIGNMENT_ERROR: "각 바늘이 목표 눈금을 가리키는지 확인해 주세요.",
  HOUR_READING_ERROR: "시침은 분에 따라 중간 위치를 가리킬 수 있어요.",
};

const getFeedbackMessage = (result) => {
  if (result.isCorrect) {
    return "정답입니다!";
  }

  if (Array.isArray(result.feedbackLines) && result.feedbackLines.length > 0) {
    return result.feedbackLines.join(" / ");
  }

  return result.errorCategories.map((category) => feedbackMap[category] ?? "입력값을 확인해 주세요.").join(" ");
};

const showToast = (message, variant = "unlock") => {
  if (!unlockToastEl) {
    return;
  }

  if (toastTimerId) {
    clearTimeout(toastTimerId);
    toastTimerId = null;
  }

  unlockToastEl.dataset.variant = variant;
  unlockToastEl.textContent = message;
  unlockToastEl.hidden = false;
  toastTimerId = setTimeout(() => {
    if (unlockToastEl) {
      unlockToastEl.hidden = true;
    }
    toastTimerId = null;
  }, 2200);
};

const showUnlockToast = (message) => {
  showToast(message, "unlock");
};

const challengeLabels = {
  timeattack_20_plus: `타임어택 ${TIMEATTACK_UNLOCK_TARGET}개 이상 정답`,
  quiz_perfect_3_streak: "문제풀기 100점 3연속",
  quiz_zero_score: "문제풀기 0점 달성",
  study_30min: "공부하기 30분 체류",
};

const showChallengeFlyCard = (challengeId, skinId) => {
  if (!challengeFlyCardEl || !challengeFlyTitleEl || !challengeFlyDetailEl) {
    return;
  }

  if (challengeFlyEnterTimerId) {
    clearTimeout(challengeFlyEnterTimerId);
    challengeFlyEnterTimerId = null;
  }
  if (challengeFlyExitTimerId) {
    clearTimeout(challengeFlyExitTimerId);
    challengeFlyExitTimerId = null;
  }

  const challengeText = challengeLabels[challengeId] ?? "도전과제 진행";
  const skinText = skinMeta[skinId]?.label ? `${skinMeta[skinId].label} 스킨 해금` : "새 보상 획득";

  challengeFlyTitleEl.textContent = "도전과제 달성!";
  challengeFlyDetailEl.textContent = `${challengeText} · ${skinText}`;
  challengeFlyCardEl.hidden = false;
  challengeFlyCardEl.classList.remove("is-enter", "is-exit");
  void challengeFlyCardEl.offsetWidth;
  challengeFlyCardEl.classList.add("is-enter");

  challengeFlyEnterTimerId = setTimeout(() => {
    challengeFlyCardEl.classList.remove("is-enter");
    challengeFlyCardEl.classList.add("is-exit");
    challengeFlyEnterTimerId = null;
  }, 4400);

  challengeFlyExitTimerId = setTimeout(() => {
    challengeFlyCardEl.classList.remove("is-exit");
    challengeFlyCardEl.hidden = true;
    challengeFlyExitTimerId = null;
  }, 5000);
};

const closeQuizResultOverlay = () => {
  if (quizResultOverlayEl) {
    quizResultOverlayEl.hidden = true;
  }
  if (quizResultCard) {
    quizResultCard.hidden = true;
  }
};

const closeTaResultOverlay = () => {
  if (taResultOverlayEl) {
    taResultOverlayEl.hidden = true;
  }
  if (taResultCard) {
    taResultCard.hidden = true;
  }
};

const closeHomeMenu = () => {
  if (homeMenuPanelEl) {
    homeMenuPanelEl.hidden = true;
  }
  if (homeMenuToggleEl) {
    homeMenuToggleEl.setAttribute("aria-expanded", "false");
  }
};

const toggleHomeMenu = () => {
  if (!homeMenuPanelEl || !homeMenuToggleEl) {
    return;
  }
  const willOpen = homeMenuPanelEl.hidden;
  homeMenuPanelEl.hidden = !willOpen;
  homeMenuToggleEl.setAttribute("aria-expanded", willOpen ? "true" : "false");
};

const readBadgeClickLog = () => {
  const parsed = safeParse(localStorage.getItem(storageKeys.badgeClickLog), []);
  return Array.isArray(parsed) ? parsed : [];
};

const formatActivityTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "시간 정보 없음";
  }
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
};

const renderRecentBadgeActivity = () => {
  if (!recentActivityListEl) {
    return;
  }

  const logs = readBadgeClickLog().slice(-5).reverse();
  recentActivityListEl.innerHTML = "";

  if (logs.length === 0) {
    const empty = document.createElement("li");
    empty.className = "recent-activity-empty";
    empty.textContent = "아직 배지 활동 기록이 없습니다.";
    recentActivityListEl.appendChild(empty);
    return;
  }

  for (const log of logs) {
    const item = document.createElement("li");
    item.className = "recent-activity-item";

    const text = document.createElement("span");
    text.className = "recent-activity-text";
    const modeName = log.mode === "timeattack" ? "타임어택" : "문제풀기";
    text.textContent = `${modeName} - ${log.detail ?? "활동"}`;

    const time = document.createElement("span");
    time.className = "recent-activity-time";
    time.textContent = formatActivityTime(log.timestamp);

    item.appendChild(text);
    item.appendChild(time);
    recentActivityListEl.appendChild(item);
  }
};

const renderChallengeProgress = () => {
  if (!challengeProgressListEl) {
    return;
  }

  const items = [
    {
      id: "timeattack_20_plus",
      label: `타임어택 ${TIMEATTACK_UNLOCK_TARGET}개 이상 정답`,
      current: Math.min(userProgress.timeAttackBest ?? 0, TIMEATTACK_UNLOCK_TARGET),
      total: TIMEATTACK_UNLOCK_TARGET,
      done: !!challengeState.timeattack_20_plus,
    },
    {
      id: "quiz_perfect_3_streak",
      label: "문제풀기 100점 3연속",
      current: Math.min(userProgress.quizPerfectStreak ?? 0, 3),
      total: 3,
      done: !!challengeState.quiz_perfect_3_streak,
    },
    {
      id: "quiz_zero_score",
      label: "문제풀기 0점 달성",
      current: challengeState.quiz_zero_score ? 1 : 0,
      total: 1,
      done: !!challengeState.quiz_zero_score,
    },
    {
      id: "study_30min",
      label: "공부하기 30분 체류",
      current: Math.min(Math.floor((userProgress.studyAccumulatedSeconds ?? 0) / 60), 30),
      total: 30,
      done: !!challengeState.study_30min,
    },
  ];

  if (challengeSummaryEl) {
    const doneCount = items.filter((item) => item.done).length;
    challengeSummaryEl.textContent = `완료 ${doneCount}/${items.length}`;
  }

  challengeProgressListEl.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.className = `challenge-item${item.done ? " done" : ""}`;
    li.dataset.challengeId = item.id;
    li.dataset.current = String(item.current);
    li.dataset.total = String(item.total);
    li.tabIndex = -1;
    li.style.setProperty("--challenge-delay", `${items.indexOf(item) * 60}ms`);

    const ratio = item.total > 0 ? Math.min(1, item.current / item.total) : 0;
    const header = document.createElement("div");
    header.className = "challenge-item-header";
    header.innerHTML = `
      <span class="challenge-state">${item.done ? "완료" : "진행중"}</span>
      <strong>${item.label}</strong>
      <span class="challenge-metric">${item.current}/${item.total}</span>
    `;

    const bar = document.createElement("div");
    bar.className = "challenge-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(item.total));
    bar.setAttribute("aria-valuenow", String(item.current));

    const fill = document.createElement("span");
    fill.className = "challenge-bar-fill";
    fill.style.width = `${Math.round(ratio * 100)}%`;
    bar.appendChild(fill);

    li.appendChild(header);
    li.appendChild(bar);
    challengeProgressListEl.appendChild(li);
  }
};

const spotlightHomePanel = (panelEl) => {
  if (!panelEl) {
    return;
  }

  if (panelSpotlightTimerId) {
    clearTimeout(panelSpotlightTimerId);
    panelSpotlightTimerId = null;
  }

  panelEl.classList.remove("panel-spotlight");
  panelEl.scrollIntoView({ behavior: "smooth", block: "center" });
  void panelEl.offsetWidth;
  panelEl.classList.add("panel-spotlight");
  panelSpotlightTimerId = setTimeout(() => {
    panelEl.classList.remove("panel-spotlight");
    panelSpotlightTimerId = null;
  }, 900);
};

const spotlightItem = (itemEl, effectClass = "item-spotlight", durationMs = 820) => {
  if (!itemEl) {
    return;
  }

  if (itemSpotlightTimerId) {
    clearTimeout(itemSpotlightTimerId);
    itemSpotlightTimerId = null;
  }

  for (const active of document.querySelectorAll(".item-spotlight, .item-spotlight-locked")) {
    active.classList.remove("item-spotlight", "item-spotlight-locked");
  }

  itemEl.classList.add(effectClass);
  itemEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  if (typeof itemEl.focus === "function") {
    itemEl.focus({ preventScroll: true });
  }

  itemSpotlightTimerId = setTimeout(() => {
    itemEl.classList.remove(effectClass);
    itemSpotlightTimerId = null;
  }, durationMs);
};

const moveToViewAndSpotlight = (targetView, panelEl, onAfterMove) => {
  setActiveView(targetView);
  requestAnimationFrame(() => {
    spotlightHomePanel(panelEl);
    if (typeof onAfterMove === "function") {
      onAfterMove();
    }
  });
};

const moveToHomeAndFocusSkin = (skinId) => {
  moveToViewAndSpotlight("skins", skinPanelEl, () => {
    if (!skinGridEl || !skinId) {
      return;
    }
    const skinButton = skinGridEl.querySelector(`[data-skin-id="${skinId}"]`);
    spotlightItem(skinButton);
    const ownedCount = new Set(skinInventory.owned ?? []).size;
    const totalCount = Object.keys(skinMeta).length;
    showToast(`${skinMeta[skinId]?.label ?? "선택한"} 스킨으로 이동했습니다. (${ownedCount}/${totalCount})`, "info");
  });
};

const moveToHomeAndFocusChallenge = (challengeId, options = {}) => {
  const {
    effectClass = "item-spotlight",
    effectDurationMs = 820,
    toastMessage,
  } = options;

  moveToViewAndSpotlight("challenges", challengePanelEl, () => {
    if (!challengeProgressListEl) {
      return;
    }

    let target = null;
    if (challengeId) {
      target = challengeProgressListEl.querySelector(`[data-challenge-id="${challengeId}"]`);
    }
    if (!target) {
      target = challengeProgressListEl.querySelector(".challenge-item:not(.done)") ?? challengeProgressListEl.querySelector(".challenge-item");
    }

    spotlightItem(target, effectClass, effectDurationMs);

    if (toastMessage) {
      showToast(toastMessage, "info");
      return;
    }

    const label = target?.querySelector("strong")?.textContent ?? "도전과제";
    const current = Number(target?.dataset.current ?? "0");
    const total = Number(target?.dataset.total ?? "0");
    const progressText = total > 0 ? ` (${current}/${total})` : "";
    showToast(`${label}${progressText} 항목으로 이동했습니다.`, "info");
  });
};

const renderResultBadges = (containerEl, { mode = "quiz", isBestScore = false, topErrors = "" }) => {
  if (!containerEl) {
    return;
  }

  containerEl.innerHTML = "";

  const logBadgeClick = (badgeType, detail) => {
    const raw = localStorage.getItem(storageKeys.badgeClickLog);
    const logs = safeParse(raw, []);
    const nextLog = {
      timestamp: new Date().toISOString(),
      mode,
      badgeType,
      detail,
    };
    const nextLogs = Array.isArray(logs) ? [...logs, nextLog].slice(-30) : [nextLog];
    localStorage.setItem(storageKeys.badgeClickLog, JSON.stringify(nextLogs));
    renderRecentBadgeActivity();
  };

  const appendBadge = (text, className, onClick) => {
    const element = document.createElement(onClick ? "button" : "span");
    element.className = `result-badge ${className}${onClick ? " action" : ""}`;
    element.textContent = text;
    if (onClick) {
      element.type = "button";
      element.addEventListener("click", () => {
        logBadgeClick(className, text);
        onClick();
      });
    }
    containerEl.appendChild(element);
  };

  const bestChallengeId = mode === "timeattack" ? "timeattack_20_plus" : "quiz_perfect_3_streak";

  if (isBestScore) {
    appendBadge("신기록 달성", "record", () => moveToHomeAndFocusChallenge(bestChallengeId));
  }

  if (topErrors) {
    appendBadge(`주요 오답: ${topErrors}`, "error", () => moveToHomeAndFocusChallenge());
  }
};

const applySkin = (skinId) => {
  document.body.dataset.skin = skinId;
  if (equippedSkinLabelEl) {
    equippedSkinLabelEl.textContent = `현재 스킨: ${skinMeta[skinId]?.label ?? "기본"}`;
  }
};

const renderSkinButtons = () => {
  if (!skinGridEl) {
    return;
  }

  skinGridEl.innerHTML = "";
  for (const skinId of Object.keys(skinMeta)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skin-btn skin-theme-${skinId}`;
    button.dataset.skinId = skinId;

    const challengeId = skinMeta[skinId]?.challenge;
    const skinName = skinMeta[skinId]?.label ?? skinId;

    const topRow = document.createElement("span");
    topRow.className = "skin-btn-top";

    const orb = document.createElement("span");
    orb.className = "skin-orb";

    const nameEl = document.createElement("span");
    nameEl.className = "skin-btn-name";
    nameEl.textContent = skinName;

    topRow.append(orb, nameEl);

    const detailEl = document.createElement("span");
    detailEl.className = "skin-btn-detail";

    const stateEl = document.createElement("span");
    stateEl.className = "skin-btn-state";

    const isOwned = skinInventory.owned.includes(skinId);
    if (!isOwned) {
      button.classList.add("locked");
      button.setAttribute("aria-disabled", "true");
      detailEl.textContent = challengeId ? challengeLabels[challengeId] ?? "도전과제 달성 필요" : "도전과제 달성 필요";
      stateEl.textContent = "잠금";
      stateEl.classList.add("locked");
    } else {
      detailEl.textContent = skinId === "default" ? "기본 스킨" : "해금 완료";
      stateEl.textContent = "보유";
    }

    if (skinInventory.equipped === skinId) {
      button.classList.add("active");
      stateEl.textContent = "장착중";
      stateEl.classList.add("active");
    }

    button.append(topRow, detailEl, stateEl);

    button.addEventListener("click", () => {
      if (!skinInventory.owned.includes(skinId)) {
        const requiredChallengeId = skinMeta[skinId]?.challenge;
        if (requiredChallengeId) {
          moveToHomeAndFocusChallenge(requiredChallengeId, {
            effectClass: "item-spotlight-locked",
            effectDurationMs: 980,
            toastMessage: `${skinMeta[skinId]?.label ?? "해당"} 스킨은 잠겨 있어요. 필요한 도전과제를 확인해 주세요.`,
          });
        }
        return;
      }
      skinInventory.equipped = skinId;
      applySkin(skinId);
      saveSkinInventory();
      renderSkinButtons();
    });

    skinGridEl.appendChild(button);
  }
};

const unlockByChallenge = (challengeId) => {
  if (challengeState[challengeId]) {
    return null;
  }

  challengeState[challengeId] = true;
  const skinId = challengeToSkin[challengeId];
  if (skinId && !skinInventory.owned.includes(skinId)) {
    skinInventory.owned.push(skinId);
    showChallengeFlyCard(challengeId, skinId);
  }
  saveChallengeState();
  saveSkinInventory();
  renderSkinButtons();
  renderChallengeProgress();
  return skinId ?? null;
};

const commitStudyElapsedSeconds = () => {
  const now = Date.now();
  const deltaSeconds = Math.max(0, Math.floor((now - studyEnteredAt) / 1000));
  if (deltaSeconds <= 0) {
    return 0;
  }

  userProgress.studyAccumulatedSeconds = (userProgress.studyAccumulatedSeconds ?? 0) + deltaSeconds;
  userProgress.studyBestSeconds = Math.max(userProgress.studyBestSeconds ?? 0, userProgress.studyAccumulatedSeconds ?? 0);
  studyEnteredAt = now;
  saveUserProgress();
  return deltaSeconds;
};

const evaluateStudyChallenge = () => {
  renderChallengeProgress();

  if ((userProgress.studyAccumulatedSeconds ?? 0) >= 1800) {
    return unlockByChallenge("study_30min");
  }

  return null;
};

const evaluateQuizChallenges = (score) => {
  const unlockedSkins = [];
  const previousBest = userProgress.quizBestScore ?? 0;
  const isBestScore = score > previousBest;
  userProgress.quizBestScore = Math.max(previousBest, score);

  if (score === 100) {
    userProgress.quizPerfectStreak += 1;
  } else {
    userProgress.quizPerfectStreak = 0;
  }

  if (userProgress.quizPerfectStreak >= 3) {
    const unlocked = unlockByChallenge("quiz_perfect_3_streak");
    if (unlocked) {
      unlockedSkins.push(unlocked);
    }
  }
  if (score === 0) {
    const unlocked = unlockByChallenge("quiz_zero_score");
    if (unlocked) {
      unlockedSkins.push(unlocked);
    }
  }

  saveUserProgress();
  renderChallengeProgress();
  return { unlockedSkins, isBestScore };
};

const evaluateTaChallenge = (correctCount) => {
  const previousBest = userProgress.timeAttackBest ?? 0;
  const isBestScore = correctCount > previousBest;
  userProgress.timeAttackBest = Math.max(previousBest, correctCount);
  saveUserProgress();
  renderChallengeProgress();

  const unlockedSkins = [];
  if (correctCount >= TIMEATTACK_UNLOCK_TARGET) {
    const unlocked = unlockByChallenge("timeattack_20_plus");
    if (unlocked) {
      unlockedSkins.push(unlocked);
    }
  }

  return { unlockedSkins, isBestScore };
};

const generateRandomTime = (difficulty, options = {}) => {
  const { force12HourRange = false } = options;
  const hour24 = randomInt(0, 23);
  const minute = randomInt(0, 59);
  const second = difficulty === "easy" ? 0 : randomInt(0, 59);
  if (force12HourRange) {
    return { hour24: randomInt(0, 11), minute, second };
  }
  return { hour24, minute, second };
};

const generateQuestion = (difficulty) => {
  const type = Math.random() < 0.5 ? "typeA" : "typeB";
  const force12HourRange = type === "typeB" && !isHardDifficulty(difficulty);
  return { type, difficulty, expected: generateRandomTime(difficulty, { force12HourRange }) };
};

const evaluateTypeA = (question, answer) => {
  const { expected, difficulty } = question;
  const minuteOk = answer.minute === expected.minute;
  const secondOk = difficulty === "hard" ? answer.second === expected.second : true;
  const hourOk = difficulty === "hard" ? answer.hour === expected.hour24 : answer.hour === toHour12(expected.hour24);
  const expectedMeridiem = expected.hour24 < 12 ? "오전" : "오후";

  const categories = [];
  const feedbackLines = [];
  if (!hourOk) {
    categories.push(difficulty === "hard" ? "HOUR_24_FORMAT_ERROR" : "HOUR_READING_ERROR");
    if (difficulty === "hard") {
      feedbackLines.push(`시 입력 오답: 정답은 ${expected.hour24}시, 입력은 ${answer.hour}시`);
    } else {
      feedbackLines.push(`시침 해석 오답: 정답은 ${expectedMeridiem} ${toHour12(expected.hour24)}시, 입력은 ${answer.hour}시`);
    }
  }
  if (!minuteOk) {
    categories.push("MINUTE_READING_ERROR");
    feedbackLines.push(`분 입력 오답: 정답은 ${expected.minute}분, 입력은 ${answer.minute}분`);
  }
  if (difficulty === "hard" && !secondOk) {
    categories.push("SECOND_IGNORED_ERROR");
    feedbackLines.push(`초 입력 오답: 정답은 ${expected.second}초, 입력은 ${answer.second}초`);
  }

  return { isCorrect: hourOk && minuteOk && secondOk, errorCategories: categories, feedbackLines };
};

const evaluateTypeB = (question, answer) => {
  const expectedHourTick = question.expected.hour24 % 12;
  const expectedMinuteTick = question.expected.minute;
  const expectedSecondTick = question.expected.second;
  const requiresMeridiem = isHardDifficulty(question.difficulty);
  const expectedMeridiem = question.expected.hour24 < 12 ? "am" : "pm";

  const userHourTick = ((answer.hourAngle % 360) + 360) % 360 / 30;
  const userMinuteTick = ((answer.minuteAngle % 360) + 360) % 360 / 6;
  const userSecondTick = ((answer.secondAngle % 360) + 360) % 360 / 6;
  const meridiemOk = requiresMeridiem ? answer.meridiemChoice === expectedMeridiem : true;

  const isTickWithinRange = (value, start, maxValue) => {
    const normalizedValue = ((value % maxValue) + maxValue) % maxValue;
    const normalizedStart = ((start % maxValue) + maxValue) % maxValue;
    const normalizedEnd = (normalizedStart + 1) % maxValue;

    if (normalizedStart < normalizedEnd) {
      return normalizedValue >= normalizedStart && normalizedValue < normalizedEnd;
    }
    return normalizedValue >= normalizedStart || normalizedValue < normalizedEnd;
  };

  const hourOk = isTickWithinRange(userHourTick, expectedHourTick, 12);
  const minuteOk = isTickWithinRange(userMinuteTick, expectedMinuteTick, 60);
  const secondOk = isTickWithinRange(userSecondTick, expectedSecondTick, 60);

  const formatHourTick = (tick) => {
    const normalized = ((tick % 12) + 12) % 12;
    const hour = Math.floor(normalized);
    const minute = Math.round((normalized - hour) * 60);
    return `${hour === 0 ? 12 : hour}시 ${minute}분 방향`;
  };

  const normalizeTick60 = (tick) => ((Math.round(tick) % 60) + 60) % 60;

  const categories = [];
  const feedbackLines = [];
  if (!(hourOk && minuteOk && secondOk)) {
    categories.push("HAND_ALIGNMENT_ERROR");
    if (!hourOk) {
      feedbackLines.push(`시침 위치 오답: 정답 범위 ${expectedHourTick === 0 ? 12 : expectedHourTick}시 ~ ${(expectedHourTick + 1) % 12 === 0 ? 12 : (expectedHourTick + 1) % 12}시 사이, 현재 ${formatHourTick(userHourTick)}`);
    }
    if (!minuteOk) {
      feedbackLines.push(`분침 위치 오답: 정답 범위 ${normalizeTick60(expectedMinuteTick)}분 ~ ${normalizeTick60(expectedMinuteTick + 1)}분 사이, 현재 ${normalizeTick60(userMinuteTick)}분`);
    }
    if (!secondOk) {
      feedbackLines.push(`초침 위치 오답: 정답 범위 ${normalizeTick60(expectedSecondTick)}초 ~ ${normalizeTick60(expectedSecondTick + 1)}초 사이, 현재 ${normalizeTick60(userSecondTick)}초`);
    }
  }
  if (requiresMeridiem && !meridiemOk) {
    categories.push("AM_PM_COLOR_MISREAD");
    feedbackLines.push(`오전/오후 색상 오답: 정답은 ${expectedMeridiem === "am" ? "파란색(오전)" : "빨간색(오후)"}`);
  }

  return {
    isCorrect: hourOk && minuteOk && secondOk && meridiemOk,
    errorCategories: categories,
    feedbackLines,
  };
};

const evaluateQuestion = (question, answer) => {
  return question.type === "typeA" ? evaluateTypeA(question, answer) : evaluateTypeB(question, answer);
};

const getStudyGuideContent = (index) => {
  const { hour24, minute, second } = currentStudyTime;
  const hour12 = toHour12(hour24);
  const ampm = hour24 < 12 ? "오전" : "오후";

  const lessons = [
    {
      short: "시침",
      title: "시침 읽기",
      text: `시침은 시간을 나타내며 ${hour12}와 ${nextHour12(hour12)} 사이에서 이동합니다. 현재 시각에서는 ${hour12}시를 기준으로 읽어요.`,
      points: [
        "시침은 가장 짧고 굵은 바늘입니다.",
        `분이 ${minute}분이므로 시침이 다음 숫자 방향으로 조금 이동합니다.`,
        "먼저 시침을 읽고, 그 다음 분침과 초침을 확인하면 헷갈림이 줄어듭니다.",
      ],
    },
    {
      short: "분침",
      title: "분침 읽기",
      text: `분침은 분을 나타냅니다. 현재 분은 ${minute}분이며, 숫자 하나 간격이 5분 단위라는 점을 기준으로 읽습니다.`,
      points: [
        "분침은 시침보다 길고, 초침보다 굵습니다.",
        `5분 단위 기준으로는 ${Math.floor(minute / 5) * 5}분 근처에 위치합니다.`,
        "숫자 사이의 작은 눈금 한 칸은 1분입니다.",
      ],
    },
    {
      short: "초침",
      title: "초침 읽기",
      text: `초침은 초를 나타냅니다. 현재 초는 ${second}초이며, 분침과 같은 방식으로 60칸을 기준으로 읽습니다.`,
      points: [
        "초침은 가장 가늘고 빠르게 움직입니다.",
        "한 바퀴는 60초이며 숫자 하나 이동은 5초입니다.",
        "초침까지 같이 확인하면 시각을 더 정확히 읽을 수 있습니다.",
      ],
    },
    {
      short: "오전/오후",
      title: "오전/오후 구분",
      text: `아날로그 시계는 12시간 기준이라 같은 모양이 하루에 두 번 나타납니다. 현재 디지털 시각 ${pad(hour24)}:${pad(minute)}:${pad(second)}은 ${ampm} ${hour12}시 ${minute}분 ${second}초입니다.`,
      points: [
        `0시~11시는 오전, 12시~23시는 오후로 구분합니다. 현재는 ${ampm}입니다.`,
        "초침 색으로 오전/오후를 빠르게 확인할 수 있습니다. 파란색은 오전, 빨간색은 오후입니다.",
        "문제풀이에서는 오전/오후를 놓치면 시간 해석이 완전히 달라질 수 있습니다.",
        "아날로그를 읽은 뒤 24시간 표기로 한 번 더 바꾸어 보면 실수가 줄어듭니다.",
      ],
    },
  ];

  return lessons[index] ?? lessons[0];
};

const renderStudyGuide = () => {
  const content = getStudyGuideContent(stepIndex);

  if (studyStepEl) {
    studyStepEl.textContent = content.short;
  }
  if (studyGuideProgressEl) {
    studyGuideProgressEl.textContent = `${stepIndex + 1} / ${steps.length} 단계`;
  }
  if (studyGuideTitleEl) {
    studyGuideTitleEl.textContent = content.title;
  }
  if (studyGuideTextEl) {
    studyGuideTextEl.textContent = content.text;
  }
  if (studyGuidePointsEl) {
    studyGuidePointsEl.innerHTML = "";
    for (const point of content.points) {
      const li = document.createElement("li");
      li.textContent = point;
      studyGuidePointsEl.appendChild(li);
    }
  }
  if (studyNextButton) {
    studyNextButton.textContent = stepIndex >= steps.length - 1 ? "새 시각 보기" : "다음 설명";
  }
};

const quizState = {
  active: false,
  totalQuestions: 20,
  answered: 0,
  correct: 0,
  errors: new Map(),
  currentQuestion: null,
  dragAngles: { hour: 0, minute: 0, second: 0 },
  selectedHand: "hour",
  activeDragHand: null,
  meridiemChoice: "am",
};

const taState = {
  active: false,
  duration: 60,
  startedAt: 0,
  correct: 0,
  attempted: 0,
  currentQuestion: null,
  timerId: null,
  dragAngles: { hour: 0, minute: 0, second: 0 },
  selectedHand: "hour",
  activeDragHand: null,
  meridiemChoice: "am",
};

const clearTaTimer = () => {
  if (taState.timerId) {
    clearInterval(taState.timerId);
    taState.timerId = null;
  }
};

const refreshStudyQuestion = () => {
  const hour24 = randomInt(0, 23);
  const minute = randomInt(0, 59);
  const second = randomInt(0, 59);

  currentStudyTime = { hour24, minute, second };

  setClockByTime(studyClock, hour24, minute, second);
  if (studyDigitalEl) {
    studyDigitalEl.textContent = `${pad(hour24)}:${pad(minute)}:${pad(second)}`;
  }

  stepIndex = 0;
  renderStudyGuide();
};

const setActiveView = (viewName) => {
  if (currentView === "study" && viewName !== "study") {
    commitStudyElapsedSeconds();
    evaluateStudyChallenge();
  }

  closeHomeMenu();

  for (const viewNameKey of Object.keys(viewsByName)) {
    const viewEl = viewsByName[viewNameKey];
    if (viewEl) {
      viewEl.classList.toggle("is-active", viewNameKey === viewName);
    }
  }

  if (viewName === "study") {
    studyEnteredAt = Date.now();
    refreshStudyQuestion();
  }

  if (viewName === "home") {
    renderChallengeProgress();
    renderRecentBadgeActivity();
  }

  if (viewName === "skins") {
    renderSkinButtons();
  }

  if (viewName === "challenges") {
    renderChallengeProgress();
    renderRecentBadgeActivity();
  }

  if (viewName !== "timeattack") {
    clearTaTimer();
  }

  if (viewName !== "quiz") {
    if (quizResultOverlayEl) {
      quizResultOverlayEl.hidden = true;
    }
    if (quizResultCard) {
      quizResultCard.hidden = true;
    }
  }

  if (viewName !== "timeattack") {
    if (taResultOverlayEl) {
      taResultOverlayEl.hidden = true;
    }
    if (taResultCard) {
      taResultCard.hidden = true;
    }
  }

  currentView = viewName;
};

const updateRealtimeClock = () => {
  const now = new Date();
  setClockByTime(homeClock, now.getHours(), now.getMinutes(), now.getSeconds());
};

const setActiveChip = (container, hand) => {
  if (!container) {
    return;
  }
  for (const button of container.querySelectorAll("[data-hand-pick]")) {
    button.classList.toggle("is-active", button.dataset.handPick === hand);
  }
};

const updateDragHelp = (helpEl, hand) => {
  if (helpEl) {
    const handName = hand === "hour" ? "시침" : hand === "minute" ? "분침" : hand === "second" ? "초침" : "없음";
    helpEl.textContent = `현재 조정: ${handName}`;
  }
};

const updateMeridiemHelp = (helpEl, choice, requiresMeridiem = true) => {
  if (!helpEl) {
    return;
  }
  if (!requiresMeridiem) {
    helpEl.textContent = "12시제 문제: 오전/오후 색상 구분 없이 시침/분침/초침 위치만 맞추세요.";
    return;
  }
  const label = choice === "pm" ? "빨간색(오후)" : "파란색(오전)";
  helpEl.textContent = `초침 더블클릭: 현재 ${label}`;
};

const attachDragBehavior = (clockParts, state, mode) => {
  if (!clockParts || !clockParts.root) {
    return;
  }

  let dragging = false;

  const canHandleTypeB = () => {
    return mode === "quiz" ? quizState.active && quizState.currentQuestion?.type === "typeB" : taState.active && taState.currentQuestion?.type === "typeB";
  };

  const pointerMove = (event) => {
    if (!dragging || !canHandleTypeB() || !state.activeDragHand) {
      return;
    }

    const angle = angleFromPointer(event, clockParts.root);
    state.dragAngles[state.activeDragHand] = angle;
    setClockByAngles(clockParts, state.dragAngles);
  };

  clockParts.root.addEventListener("pointerdown", (event) => {
    if (!canHandleTypeB()) {
      return;
    }
    const pointerAngle = angleFromPointer(event, clockParts.root);
    const hand = pickNearestHand(pointerAngle, state.dragAngles, 18);
    if (!hand) {
      return;
    }
    state.activeDragHand = hand;
    dragging = true;
    clockParts.root.setPointerCapture(event.pointerId);
    if (mode === "quiz") {
      updateDragHelp(quizDragHelp, hand);
    } else {
      updateDragHelp(taDragHelp, hand);
    }
    pointerMove(event);
  });
  clockParts.root.addEventListener("pointermove", pointerMove);
  clockParts.root.addEventListener("pointerup", () => {
    dragging = false;
    state.activeDragHand = null;
  });

  clockParts.root.addEventListener("dblclick", (event) => {
    if (!canHandleTypeB()) {
      return;
    }
    const currentQuestion = mode === "quiz" ? quizState.currentQuestion : taState.currentQuestion;
    if (!isHardDifficulty(currentQuestion?.difficulty)) {
      return;
    }
    const pointerAngle = angleFromPointer(event, clockParts.root);
    const hand = pickNearestHand(pointerAngle, state.dragAngles, 16);
    if (hand !== "second") {
      return;
    }

    state.meridiemChoice = state.meridiemChoice === "am" ? "pm" : "am";
    setClockMeridiemChoice(clockParts, state.meridiemChoice);
    if (mode === "quiz") {
      updateMeridiemHelp(quizMeridiemHelpEl, state.meridiemChoice);
    } else {
      updateMeridiemHelp(taMeridiemHelpEl, state.meridiemChoice);
    }
  });
};

const updateQuizProgress = () => {
  if (quizProgressEl) {
    quizProgressEl.textContent = `진행: ${quizState.answered}/${quizState.totalQuestions}`;
  }
};

const resetQuizForm = () => {
  for (const input of [hourInputQuiz, minuteInputQuiz, secondInputQuiz]) {
    if (input) {
      input.value = "";
    }
  }
  quizState.dragAngles = { hour: 0, minute: 0, second: 0 };
  quizState.activeDragHand = null;
  quizState.meridiemChoice = "am";
};

const resetTaForm = () => {
  for (const input of [hourInputTa, minuteInputTa, secondInputTa]) {
    if (input) {
      input.value = "";
    }
  }
  taState.dragAngles = { hour: 0, minute: 0, second: 0 };
  taState.activeDragHand = null;
  taState.meridiemChoice = "am";
};

const getTypeAInputRefs = (mode) => {
  if (mode === "quiz") {
    return {
      hour: hourInputQuiz,
      minute: minuteInputQuiz,
      second: secondInputQuiz,
      panel: quizTypeAPanel,
      submit: submitQuizAnswer,
      state: quizState,
    };
  }

  return {
    hour: hourInputTa,
    minute: minuteInputTa,
    second: secondInputTa,
    panel: taTypeAPanel,
    submit: submitTaAnswer,
    state: taState,
  };
};

const canUseTypeAKeyboardFlow = (mode) => {
  const refs = getTypeAInputRefs(mode);
  const question = refs.state?.currentQuestion;
  return !!(refs.state?.active && question && question.type === "typeA" && refs.panel && !refs.panel.hidden);
};

const getTypeAInputOrder = (mode) => {
  const refs = getTypeAInputRefs(mode);
  const question = refs.state?.currentQuestion;
  const isHard = question?.difficulty === "hard";

  return isHard ? [refs.hour, refs.minute, refs.second].filter(Boolean) : [refs.hour, refs.minute].filter(Boolean);
};

const focusTypeAHourInput = (mode) => {
  if (!canUseTypeAKeyboardFlow(mode)) {
    return;
  }

  const refs = getTypeAInputRefs(mode);
  if (refs.hour) {
    refs.hour.focus();
  }
};

const wireTypeAEnterFlow = (mode) => {
  const refs = getTypeAInputRefs(mode);
  const inputs = [refs.hour, refs.minute, refs.second].filter(Boolean);

  for (const input of inputs) {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !canUseTypeAKeyboardFlow(mode)) {
        return;
      }

      event.preventDefault();

      const orderedInputs = getTypeAInputOrder(mode);
      const currentIndex = orderedInputs.indexOf(input);
      if (currentIndex >= 0 && currentIndex < orderedInputs.length - 1) {
        orderedInputs[currentIndex + 1].focus();
        return;
      }

      refs.submit();
    });
  }
};

const wireTypeAAutoHourInput = () => {
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      return;
    }

    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement ||
      (active instanceof HTMLElement && active.isContentEditable)
    ) {
      return;
    }

    const mode = currentView === "quiz" ? "quiz" : currentView === "timeattack" ? "timeattack" : null;
    if (!mode || !canUseTypeAKeyboardFlow(mode)) {
      return;
    }

    const refs = getTypeAInputRefs(mode);
    if (!refs.hour) {
      return;
    }

    event.preventDefault();
    refs.hour.focus();
    refs.hour.value = event.key;
  });
};

const wireTypeBEnterSubmit = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.defaultPrevented || event.isComposing || event.repeat) {
      return;
    }
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const active = document.activeElement;
    if (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement ||
      (active instanceof HTMLElement && active.isContentEditable)
    ) {
      return;
    }

    if (currentView === "quiz" && quizState.active && quizState.currentQuestion?.type === "typeB") {
      event.preventDefault();
      submitQuizAnswer();
      return;
    }

    if (currentView === "timeattack" && taState.active && taState.currentQuestion?.type === "typeB") {
      event.preventDefault();
      submitTaAnswer();
    }
  });
};

const renderQuestion = (mode, question) => {
  const isQuiz = mode === "quiz";
  const typeEl = isQuiz ? quizTypeEl : taTypeEl;
  const targetEl = isQuiz ? quizTargetTextEl : taTargetTextEl;
  const typeAPanel = isQuiz ? quizTypeAPanel : taTypeAPanel;
  const typeBPanel = isQuiz ? quizTypeBPanel : taTypeBPanel;
  const clock = isQuiz ? quizClock : taClock;

  if (!question || !typeEl || !targetEl || !typeAPanel || !typeBPanel) {
    return;
  }

  typeEl.textContent = `문제 유형: ${question.type === "typeA" ? "A (시계 -> 시간)" : "B (시간 -> 시계)"}`;

  if (question.type === "typeA") {
    typeAPanel.hidden = false;
    typeBPanel.hidden = true;
    targetEl.textContent = "시계를 보고 시간을 입력하세요";
    setClockByTime(clock, question.expected.hour24, question.expected.minute, question.expected.second);
    if (clock?.root) {
      if (question.difficulty === "hard") {
        clock.root.removeAttribute("data-meridiem-visual");
      } else {
        clock.root.dataset.meridiemVisual = "neutral";
      }
    }
    requestAnimationFrame(() => {
      focusTypeAHourInput(mode);
    });
  } else {
    typeAPanel.hidden = true;
    typeBPanel.hidden = false;
    const use12HourTypeB = !isHardDifficulty(question.difficulty);
    const targetHour = use12HourTypeB ? toHour12(question.expected.hour24) : question.expected.hour24;
    targetEl.textContent = `목표 시간: ${pad(targetHour)}:${pad(question.expected.minute)}:${pad(question.expected.second)}`;
    const modeState = isQuiz ? quizState : taState;
    if (clock?.root) {
      if (use12HourTypeB) {
        clock.root.dataset.meridiemVisual = "neutral";
      } else {
        clock.root.removeAttribute("data-meridiem-visual");
      }
    }
    if (use12HourTypeB) {
      modeState.meridiemChoice = "am";
    }
    setClockByAngles(clock, modeState.dragAngles);
    setClockMeridiemChoice(clock, modeState.meridiemChoice);
    if (isQuiz) {
      updateDragHelp(quizDragHelp, modeState.activeDragHand);
      updateMeridiemHelp(quizMeridiemHelpEl, modeState.meridiemChoice, !use12HourTypeB);
    } else {
      updateDragHelp(taDragHelp, modeState.activeDragHand);
      updateMeridiemHelp(taMeridiemHelpEl, modeState.meridiemChoice, !use12HourTypeB);
    }
  }

  if (isQuiz && secondInputQuiz) {
    secondInputQuiz.disabled = question.difficulty !== "hard";
    if (question.difficulty !== "hard") {
      secondInputQuiz.value = "0";
    }
  }

  if (!isQuiz && secondInputTa) {
    secondInputTa.disabled = question.difficulty !== "hard";
    if (question.difficulty !== "hard") {
      secondInputTa.value = "0";
    }
  }
};

const nextQuizQuestion = () => {
  const difficulty = quizDifficultyEl ? quizDifficultyEl.value : "easy";
  quizState.currentQuestion = generateQuestion(difficulty);
  resetQuizForm();
  renderQuestion("quiz", quizState.currentQuestion);
};

const finishQuiz = () => {
  quizState.active = false;

  const wrong = quizState.answered - quizState.correct;
  const score = quizState.correct * 5;
  const topErrors = [...quizState.errors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name}(${count})`)
    .join(", ");

  const { isBestScore } = evaluateQuizChallenges(score);

  if (quizSummaryEl) {
    quizSummaryEl.textContent = "문제풀이가 종료되었습니다.";
  }
  if (quizFeedbackEl) {
    quizFeedbackEl.textContent = "결과 카드를 확인해 주세요.";
  }
  if (quizResultText) {
    quizResultText.textContent = `총점 ${score}점 | 정답 ${quizState.correct} | 오답 ${wrong}`;
  }
  renderResultBadges(quizResultBadgesEl, { mode: "quiz", isBestScore, topErrors });
  if (quizResultOverlayEl) {
    quizResultOverlayEl.hidden = false;
  }
  if (quizResultCard) {
    quizResultCard.hidden = false;
  }
};

const submitQuizAnswer = () => {
  if (!quizState.active || !quizState.currentQuestion) {
    return;
  }

  const q = quizState.currentQuestion;
  const answer =
    q.type === "typeA"
      ? {
          hour: toNumber(hourInputQuiz),
          minute: toNumber(minuteInputQuiz),
          second: toNumber(secondInputQuiz),
        }
      : {
          hourAngle: quizState.dragAngles.hour,
          minuteAngle: quizState.dragAngles.minute,
          secondAngle: quizState.dragAngles.second,
          meridiemChoice: quizState.meridiemChoice,
        };

  const result = evaluateQuestion(q, answer);
  flashAnswerClockFeedback("quiz", result.isCorrect);
  quizState.answered += 1;
  if (result.isCorrect) {
    quizState.correct += 1;
  } else {
    for (const category of result.errorCategories) {
      quizState.errors.set(category, (quizState.errors.get(category) ?? 0) + 1);
    }
  }

  updateQuizProgress();
  if (quizFeedbackEl) {
    quizFeedbackEl.textContent = getFeedbackMessage(result);
  }

  if (quizState.answered >= quizState.totalQuestions) {
    finishQuiz();
    return;
  }

  nextQuizQuestion();
};

const startQuiz = () => {
  quizState.active = true;
  quizState.answered = 0;
  quizState.correct = 0;
  quizState.errors = new Map();
  quizState.selectedHand = "hour";
  quizState.activeDragHand = null;
  quizState.meridiemChoice = "am";
  updateDragHelp(quizDragHelp, null);
  updateMeridiemHelp(quizMeridiemHelpEl, quizState.meridiemChoice);

  if (quizSummaryEl) {
    quizSummaryEl.textContent = "";
  }
  if (quizResultCard) {
    quizResultCard.hidden = true;
  }
  if (quizResultOverlayEl) {
    quizResultOverlayEl.hidden = true;
  }
  if (quizResultBadgesEl) {
    quizResultBadgesEl.innerHTML = "";
  }

  updateQuizProgress();
  nextQuizQuestion();
};

const nextTaQuestion = () => {
  const difficulty = taDifficultyEl ? taDifficultyEl.value : "easy";
  taState.currentQuestion = {
    type: "typeA",
    difficulty,
    expected: generateRandomTime(difficulty),
  };
  resetTaForm();
  renderQuestion("timeattack", taState.currentQuestion);
};

const finishTa = () => {
  taState.active = false;
  clearTaTimer();

  const { isBestScore } = evaluateTaChallenge(taState.correct);

  if (taFeedbackEl) {
    taFeedbackEl.textContent = "시간 종료!";
  }
  if (taSummaryEl) {
    taSummaryEl.textContent = `정답 ${taState.correct} / 시도 ${taState.attempted}`;
  }
  if (taResultText) {
    taResultText.textContent = `최종 정답 개수: ${taState.correct}`;
  }
  renderResultBadges(taResultBadgesEl, { mode: "timeattack", isBestScore });
  if (taResultOverlayEl) {
    taResultOverlayEl.hidden = false;
  }
  if (taResultCard) {
    taResultCard.hidden = false;
  }
};

const updateTaTimer = () => {
  if (!taState.active || !taTimerEl) {
    return;
  }

  const elapsed = Math.floor((Date.now() - taState.startedAt) / 1000);
  const remain = Math.max(0, taState.duration - elapsed);
  taTimerEl.textContent = `남은 시간: ${remain}초`;

  if (remain === 0) {
    finishTa();
  }
};

const startTa = () => {
  taState.active = true;
  taState.startedAt = Date.now();
  taState.correct = 0;
  taState.attempted = 0;
  taState.selectedHand = "hour";
  taState.activeDragHand = null;
  taState.meridiemChoice = "am";
  updateDragHelp(taDragHelp, null);
  updateMeridiemHelp(taMeridiemHelpEl, taState.meridiemChoice);

  if (taResultCard) {
    taResultCard.hidden = true;
  }
  if (taResultOverlayEl) {
    taResultOverlayEl.hidden = true;
  }
  if (taResultBadgesEl) {
    taResultBadgesEl.innerHTML = "";
  }
  if (taSummaryEl) {
    taSummaryEl.textContent = "";
  }
  if (taFeedbackEl) {
    taFeedbackEl.textContent = "타임어택 시작!";
  }

  clearTaTimer();
  taState.timerId = setInterval(updateTaTimer, 250);
  updateTaTimer();
  nextTaQuestion();
};

const submitTaAnswer = () => {
  if (!taState.active || !taState.currentQuestion) {
    return;
  }

  const elapsed = Math.floor((Date.now() - taState.startedAt) / 1000);
  if (elapsed >= taState.duration) {
    finishTa();
    return;
  }

  const q = taState.currentQuestion;
  const answer =
    q.type === "typeA"
      ? {
          hour: toNumber(hourInputTa),
          minute: toNumber(minuteInputTa),
          second: toNumber(secondInputTa),
        }
      : {
          hourAngle: taState.dragAngles.hour,
          minuteAngle: taState.dragAngles.minute,
          secondAngle: taState.dragAngles.second,
          meridiemChoice: taState.meridiemChoice,
        };

  const result = evaluateQuestion(q, answer);
  flashAnswerClockFeedback("timeattack", result.isCorrect);
  taState.attempted += 1;
  if (result.isCorrect) {
    taState.correct += 1;
  }

  if (taFeedbackEl) {
    taFeedbackEl.textContent = getFeedbackMessage(result);
  }
  if (taSummaryEl) {
    taSummaryEl.textContent = `정답 ${taState.correct} / 시도 ${taState.attempted}`;
  }

  nextTaQuestion();
};

const attachGlobalEvents = () => {
  for (const button of gotoButtons) {
    button.addEventListener("click", () => {
      const viewName = button.dataset.goto;
      if (viewName) {
        setActiveView(viewName);
      }
    });
  }

  if (homeMenuToggleEl) {
    homeMenuToggleEl.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleHomeMenu();
    });
  }

  document.addEventListener("click", (event) => {
    if (!homeMenuPanelEl || homeMenuPanelEl.hidden) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (homeMenuPanelEl.contains(target) || (homeMenuToggleEl && homeMenuToggleEl.contains(target))) {
      return;
    }
    closeHomeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHomeMenu();
    }
  });

  if (studyNextButton) {
    studyNextButton.addEventListener("click", () => {
      if (stepIndex >= steps.length - 1) {
        refreshStudyQuestion();
      } else {
        stepIndex += 1;
        renderStudyGuide();
      }

      commitStudyElapsedSeconds();
      evaluateStudyChallenge();
    });
  }

  if (quizHandPick) {
    quizHandPick.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.dataset.handPick) {
        return;
      }
      quizState.selectedHand = target.dataset.handPick;
      setActiveChip(quizHandPick, quizState.selectedHand);
      updateDragHelp(quizDragHelp, quizState.selectedHand);
    });
  }

  if (taHandPick) {
    taHandPick.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.dataset.handPick) {
        return;
      }
      taState.selectedHand = target.dataset.handPick;
      setActiveChip(taHandPick, taState.selectedHand);
      updateDragHelp(taDragHelp, taState.selectedHand);
    });
  }

  if (quizStartEl) {
    quizStartEl.addEventListener("click", startQuiz);
  }
  if (quizSubmitEl) {
    quizSubmitEl.addEventListener("click", submitQuizAnswer);
  }
  if (quizRestartEl) {
    quizRestartEl.addEventListener("click", startQuiz);
  }
  if (quizResultHomeEl) {
    quizResultHomeEl.addEventListener("click", () => {
      closeQuizResultOverlay();
      setActiveView("home");
    });
  }

  if (taStartEl) {
    taStartEl.addEventListener("click", startTa);
  }
  if (taSubmitEl) {
    taSubmitEl.addEventListener("click", submitTaAnswer);
  }
  if (taRestartEl) {
    taRestartEl.addEventListener("click", startTa);
  }
  if (taResultHomeEl) {
    taResultHomeEl.addEventListener("click", () => {
      closeTaResultOverlay();
      setActiveView("home");
    });
  }

  wireTypeAEnterFlow("quiz");
  wireTypeAEnterFlow("timeattack");
  wireTypeAAutoHourInput();
  wireTypeBEnterSubmit();
};

attachDragBehavior(quizClock, quizState, "quiz");
attachDragBehavior(taClock, taState, "timeattack");
attachGlobalEvents();

if (!skinInventory.owned.includes("default")) {
  skinInventory.owned.push("default");
}
if (!skinInventory.equipped) {
  skinInventory.equipped = "default";
}

applySkin(skinInventory.equipped);
renderSkinButtons();
renderChallengeProgress();
renderRecentBadgeActivity();
saveSkinInventory();
saveChallengeState();
saveUserProgress();

updateRealtimeClock();
setInterval(updateRealtimeClock, 1000);
