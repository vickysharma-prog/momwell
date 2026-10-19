// The warning-signs engine. Plain rules on official lists; the model never decides any of this. It takes what she
// tapped (and anything the model read from her words, which can only add) plus her readings, and says what to do.
import { SIGNS, SIGNS_SOURCE, type SignId } from "./signs.ts";
import { SOURCES, type Source } from "./sources.ts";

export const ENGINE_VERSION = "2026-10-19.1";

// urgent: get care now (CDC's words for every sign). call_doctor: call your doctor right away (ACOG, 140/90).
// check: a reading we can't trust, so we ask again instead of saying all is well.
export type Level = "urgent" | "call_doctor" | "check" | "none";
const RANK: Record<Level, number> = { none: 0, check: 1, call_doctor: 2, urgent: 3 };

export type Reading = {
  bp?: { systolic: number; diastolic: number };
  temp?: { value: number; unit: "F" | "C" };
};
export type CheckIn = { signs: SignId[]; note?: string } & Reading;

export type Reason = { id: string; text: string; level: Level; source: Source };
// noteUnread: she wrote something the rules can't read. We say so rather than call the day clear.
export type Result = { level: Level; reasons: Reason[]; crisis: boolean; noteUnread: boolean; version: string };

export const ACTION: Record<Level, string> = {
  urgent: "Get medical care now. If it's an emergency, call 911.",
  call_doctor: "Call your doctor right away. If you can't reach them, or you feel you need care now, call 911.",
  check: "Please check that number and enter it again.",
  none: "Nothing you told us today is on the warning-sign list. Keep checking in, and trust your body.",
};

export const NOTE_UNREAD =
  "We checked the boxes you tapped, not what you wrote. If anything you wrote is on the list, go back and tap it. If you're not sure about something, call your doctor.";

export const toF = (t: NonNullable<Reading["temp"]>) => (t.unit === "F" ? t.value : (t.value * 9) / 5 + 32);
// A °C number entered as °F (37.5 "°F") is a plausible body temperature in the wrong unit: ask, don't guess.
export const plausibleTemp = ({ value, unit }: NonNullable<Reading["temp"]>) => Number.isFinite(value) && (unit === "F" ? value >= 90 && value <= 110 : value >= 32 && value <= 43.5);
// Rounded to a tenth so 38°C (100.4°F exactly) isn't missed by float error.
export const isFever = (t: NonNullable<Reading["temp"]>) => Math.round(toF(t) * 10) >= 1004;

function temperature(temp: NonNullable<Reading["temp"]>): Reason | null {
  const { value, unit } = temp;
  if (!plausibleTemp(temp)) return { id: "temp_check", text: `${value}°${unit} doesn't look like a body temperature.`, level: "check", source: SIGNS_SOURCE };
  if (isFever(temp)) return { id: "fever", text: `Your temperature is ${value}°${unit}. A fever of 100.4°F (38°C) or higher is a warning sign.`, level: "urgent", source: SIGNS_SOURCE };
  return null;
}

function bloodPressure({ systolic: s, diastolic: d }: NonNullable<Reading["bp"]>): Reason | null {
  const plausible = Number.isInteger(s) && Number.isInteger(d) && s >= 60 && s <= 260 && d >= 30 && d <= 160 && d < s;
  if (!plausible) return { id: "bp_check", text: `${s}/${d} doesn't look like a blood pressure reading.`, level: "check", source: SOURCES.acogBloodPressure };
  // Either number alone is enough: ACOG says "and/or" at 140/90, and we read NIH's 160/110 the same, the safer way.
  if (s >= 160 || d >= 110) return { id: "bp_severe", text: `Your blood pressure is ${s}/${d}. 160/110 or higher needs care now.`, level: "urgent", source: SOURCES.nihSevereBloodPressure };
  if (s >= 140 || d >= 90) return { id: "bp_high", text: `Your blood pressure is ${s}/${d}. 140/90 or higher means calling your doctor right away.`, level: "call_doctor", source: SOURCES.acogBloodPressure };
  return null;
}

export function evaluate(checkIn: CheckIn): Result {
  const reasons: Reason[] = [];
  for (const id of new Set(checkIn.signs)) {
    const sign = SIGNS.find((s) => s.id === id);
    // An unknown id is a bug upstream, never a reason to stay quiet: treat it as urgent and say so plainly.
    reasons.push(sign ? { id, text: `You told us: ${sign.label.toLowerCase()}.`, level: "urgent", source: SIGNS_SOURCE } : { id, text: "You told us something on the warning-sign list.", level: "urgent", source: SIGNS_SOURCE });
  }
  for (const reading of [checkIn.temp && temperature(checkIn.temp), checkIn.bp && bloodPressure(checkIn.bp)]) {
    if (!reading) continue;
    // A fever she tapped and a fever from her reading are one reason, told with her number.
    const same = reasons.findIndex((r) => r.id === reading.id);
    if (same >= 0) reasons.splice(same, 1);
    reasons.push(reading);
  }

  reasons.sort((a, b) => RANK[b.level] - RANK[a.level]);
  return {
    level: reasons[0]?.level ?? "none",
    reasons,
    crisis: reasons.some((r) => r.id === "harm_thoughts"),
    noteUnread: Boolean(checkIn.note?.trim()),
    version: ENGINE_VERSION,
  };
}
