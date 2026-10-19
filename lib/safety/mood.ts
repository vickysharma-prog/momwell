// The mood check: the PHQ-2, and the full PHQ-9 when the PHQ-2 is positive (ACOG Clinical Practice Guideline No. 4
// names the PHQ-9 among validated perinatal screens). Scored here by fixed rules, never by a model. She never sees a
// band name: only what to do next. Both forms ask about the last two weeks, so we ask every two weeks.
export const MOOD_VERSION = "mood-2026.10.20";
export const MOOD_EVERY_DAYS = 14;

export const QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself, or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading or watching television",
  "Moving or speaking so slowly that other people could have noticed, or the opposite: being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
] as const;
export const ANSWERS = ["Not at all", "Several days", "More than half the days", "Nearly every day"] as const;

export const PHQ2_POSITIVE = 3;
export const PHQ9_TALK = 10;
const HARM_ITEM = 8;

export type MoodLevel = "urgent" | "call_doctor" | "none";
export type MoodResult = { kind: "phq2" | "phq9"; score: number; level: MoodLevel; band: string; crisis: boolean; version: string };

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);

/** Two answers or nine, each 0 to 3; anything else is not a screen. */
export const validAnswers = (a: unknown): a is number[] =>
  Array.isArray(a) && (a.length === 2 || a.length === QUESTIONS.length) && a.every((x) => Number.isInteger(x) && x >= 0 && x <= 3);

/** After the first two questions: go on to all nine? */
export const needsFull = (a: number[]) => a.length === 2 && sum(a) >= PHQ2_POSITIVE;

/** PHQ-9 severity, for her care team only. */
export function band(score: number) {
  if (score >= 20) return "severe";
  if (score >= 15) return "moderately severe";
  if (score >= 10) return "moderate";
  if (score >= 5) return "mild";
  return "minimal";
}

export function scoreMood(a: number[]): MoodResult {
  if (!validAnswers(a)) throw new Error("not a mood screen");
  if (needsFull(a)) throw new Error("a positive PHQ-2 goes on to the PHQ-9");
  const score = sum(a);
  if (a.length === 2) return { kind: "phq2", score, level: "none", band: "PHQ-2 negative", crisis: false, version: MOOD_VERSION };
  const crisis = a[HARM_ITEM] > 0;
  return { kind: "phq9", score, level: crisis ? "urgent" : score >= PHQ9_TALK ? "call_doctor" : "none", band: band(score), crisis, version: MOOD_VERSION };
}

/** What she reads afterwards: what to do, never a label. */
export const MOOD_SAYS: Record<MoodLevel, string> = {
  urgent: "Thank you for telling us. You don’t have to carry this alone: please reach out to someone right now.",
  call_doctor: "Thank you for answering. Your answers suggest talking with your doctor or midwife this week. You can show them this.",
  none: "Thank you for answering. Nothing here to act on today. We’ll ask again in two weeks.",
};

/** Is a mood check due, given when she last did one? */
export const moodDue = (last: string | null, now: Date) => !last || now.getTime() - Date.parse(last) >= MOOD_EVERY_DAYS * 86_400_000;
