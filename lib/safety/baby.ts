// Warning signs for her baby in the first year, by the same kind of plain rules as hers: from the AAP's fever advice
// and Children's Hospital Colorado's emergency symptoms (written by a pediatrician, Barton Schmitt MD, FAAP). The
// model never decides any of this, and nothing here names an illness or a medicine.
import { isFever, plausibleTemp, type Level, type Reading, type Reason, type Result } from "./engine.ts";
import { SOURCES } from "./sources.ts";

export const BABY_VERSION = "baby-2026.10.20";
// The AAP's line for a fever that needs a call right away: younger than 3 months (12 weeks).
export const FEVER_CALL_DAYS = 90;
export const NEWBORN_DAYS = 30;

const ER = SOURCES.childrensEmergency;

// urgent: call 911. call_doctor: call the baby's doctor now; if you can't reach them, go to the ER (the page's rule).
export const BABY_SIGNS = [
  { id: "baby_blue", label: "Blue or gray lips, tongue or gums", level: "urgent", source: ER },
  { id: "baby_breathing", label: "Struggling to breathe: grunting, ribs pulling in, or too out of breath to feed or cry", level: "urgent", source: ER },
  { id: "baby_limp", label: "Limp, too weak to cry, or very hard to wake", level: "call_doctor", source: ER },
  { id: "baby_crying", label: "Crying that won’t stop, and nothing calms them", level: "call_doctor", source: ER },
  { id: "baby_green_vomit", label: "Bright green vomit", level: "call_doctor", source: ER },
  { id: "baby_dry", label: "No wet diaper in 8 hours", level: "call_doctor", source: ER },
  { id: "baby_soft_spot", label: "The soft spot on the head is bulging or sunken", level: "call_doctor", source: ER },
  { id: "baby_spots", label: "Purple or blood-red spots that don’t fade when you press them", level: "call_doctor", source: ER },
  { id: "baby_newborn_sick", label: "Seems sick: not feeding well, sleeping much more than usual, vomiting, a cough, or a poor color", level: "call_doctor", source: ER, newbornOnly: true },
] as const satisfies readonly { id: string; label: string; level: Level; source: typeof ER; newbornOnly?: true }[];

export type BabySignId = (typeof BABY_SIGNS)[number]["id"];
export const BABY_SIGN_IDS = BABY_SIGNS.map((s) => s.id) as BabySignId[];
export type BabyCheckIn = { signs: BabySignId[] } & Pick<Reading, "temp">;

/** The signs to show for a baby this many days old. "Seems sick" is the newborn rule: any of it before a month. */
export const babySignsFor = (ageDays: number) => BABY_SIGNS.filter((s) => !("newbornOnly" in s) || ageDays < NEWBORN_DAYS);

export const BABY_ACTION: Record<Level, string> = {
  urgent: "Call 911 for your baby now.",
  call_doctor: "Call your baby’s doctor now. If you can’t reach them, go to the nearest emergency room.",
  check: "Please check that number and enter it again.",
  none: "Nothing you told us is on the warning-sign list for your baby. If your baby seems sick to you, call the doctor: you know your baby best.",
};

const RANK: Record<Level, number> = { none: 0, check: 1, call_doctor: 2, urgent: 3 };

function temperature(temp: NonNullable<Reading["temp"]>, ageDays: number): Reason | null {
  const shown = `${temp.value}°${temp.unit}`;
  if (!plausibleTemp(temp)) return { id: "baby_temp_check", text: `${shown} doesn't look like a body temperature.`, level: "check", source: SOURCES.aapFever };
  if (!isFever(temp)) return null;
  if (ageDays < FEVER_CALL_DAYS)
    return { id: "baby_fever", text: `Your baby is under 3 months with a temperature of ${shown}. At this age, 100.4°F (38°C) or higher means calling the doctor right away.`, level: "call_doctor", source: SOURCES.aapFever };
  // Past 3 months a fever alone isn't a call-now rule; the AAP says when it becomes one.
  return { id: "baby_fever_watch", text: `Your baby has a temperature of ${shown}. Call the doctor if it lasts more than 24 hours, if your baby seems to be getting worse, or still acts sick once the fever comes down.`, level: "none", source: SOURCES.aapFever };
}

export function evaluateBaby(input: BabyCheckIn, ageDays: number): Result {
  const reasons: Reason[] = [];
  for (const id of new Set(input.signs)) {
    const sign = BABY_SIGNS.find((s) => s.id === id);
    // An unknown id is a bug upstream, never a reason to stay quiet.
    reasons.push(sign ? { id, text: `You told us about your baby: ${sign.label.charAt(0).toLowerCase()}${sign.label.slice(1)}.`, level: sign.level, source: sign.source } : { id, text: "You told us something on the warning-sign list for your baby.", level: "urgent", source: ER });
  }
  const t = input.temp && temperature(input.temp, ageDays);
  if (t) reasons.push(t);
  reasons.sort((a, b) => RANK[b.level] - RANK[a.level]);
  return { level: reasons[0]?.level ?? "none", reasons, crisis: false, noteUnread: false, version: BABY_VERSION };
}
