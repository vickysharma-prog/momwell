// Which call a warning asks for. CDC says to get care right away for every warning sign; AWHONN's POST-BIRTH list
// says which of them mean calling 911 (chest pain, trouble breathing, seizures, thoughts of hurting yourself or
// someone else) and which mean calling her doctor now, or 911 or the ER if she can't reach them. NIH puts 160/110 and
// over in the emergency range. The stored level doesn't change; this only decides the first button she sees.
import { ACTION, type Level } from "./engine.ts";
import { SIGN_IDS } from "./signs.ts";
import { SOURCES } from "./sources.ts";

export const CALL_911 = ["breathing", "chest_heart", "harm_thoughts", "bp_severe"] as const;
const READINGS = ["fever", "bp_high", "bp_severe", "temp_check", "bp_check"];
const KNOWN = new Set<string>([...SIGN_IDS, ...READINGS]);

export const TIER_SOURCE = SOURCES.awhonnPostBirth;

type Reasonish = { id: string; level: string };

/** Call 911 first? Yes for AWHONN's 911 signs and severe blood pressure, and for anything we don't recognise. */
export const needs911 = (reasons: Reasonish[]) => reasons.some((r) => (CALL_911 as readonly string[]).includes(r.id) || (r.level === "urgent" && !KNOWN.has(r.id)));

/** What to do, in one sentence: the same words on the screen and in the companion's reply. */
export function actionFor(result: { level: Level; reasons: Reasonish[] }) {
  if (result.level !== "urgent" && result.level !== "call_doctor") return ACTION[result.level];
  return needs911(result.reasons) ? "Call 911 now." : "Call your doctor now. If you can't reach them, call 911 or go to the nearest emergency room.";
}
