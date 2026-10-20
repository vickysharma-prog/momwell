import { SOURCES } from "./sources.ts";

// CDC Hear Her's 15 urgent maternal warning signs, in the CDC's words. CDC says to seek medical care immediately
// for every one of them, so there is no ranking between them.
export type Window = "pregnancy" | "after_birth" | "pregnancy_and_6_weeks" | "pregnancy_and_year";

export const SIGNS = [
  { id: "headache", label: "Headache that won't go away or gets worse over time", detail: "Severe, sudden or lingering, even after medicine and fluids, or with blurred vision or dizziness.", window: "pregnancy_and_year" },
  { id: "dizziness", label: "Dizziness or fainting", detail: "Fainting, dizziness that keeps coming back, or a gap in time you can't remember.", window: "pregnancy_and_year" },
  { id: "vision", label: "Changes in your vision", detail: "Flashes of light, blind spots, losing your sight for a moment, blurriness or double vision.", window: "pregnancy_and_year" },
  { id: "fever", label: "Fever of 100.4°F or higher", detail: "100.4°F (38°C) or higher.", window: "pregnancy_and_year" },
  { id: "swelling", label: "Extreme swelling of your hands or face", detail: "Hard to bend your fingers or open your eyes, or swollen, numb lips or mouth.", window: "pregnancy_and_year" },
  { id: "harm_thoughts", label: "Thoughts about harming yourself or your baby", detail: "Feeling hopeless or out of control, constant worry, or thoughts of harming yourself or your baby.", window: "pregnancy_and_year" },
  { id: "breathing", label: "Trouble breathing", detail: "Short of breath, a tight throat or chest, or trouble breathing lying flat.", window: "pregnancy_and_year" },
  { id: "chest_heart", label: "Chest pain or fast-beating heart", detail: "Chest tightness or pressure, pain spreading to your back, neck or arm, or a pounding or uneven heartbeat.", window: "pregnancy_and_year" },
  { id: "vomiting", label: "Severe nausea and throwing up", detail: "Can't drink for more than 8 hours or eat for more than 24 hours, or can't keep fluids down.", window: "pregnancy_and_year" },
  { id: "belly_pain", label: "Severe belly pain that doesn't go away", detail: "Sharp, stabbing or cramping pain that is sudden, severe or getting worse.", window: "pregnancy_and_year" },
  { id: "baby_movement", label: "Baby's movement stopping or slowing", detail: "A change from your baby's usual pattern.", window: "pregnancy" },
  { id: "bleeding_pregnant", label: "Vaginal bleeding or fluid leaking", detail: "More than spotting, fluid leaking, or foul-smelling discharge.", window: "pregnancy" },
  { id: "bleeding_after", label: "Vaginal bleeding or discharge after pregnancy", detail: "Soaking one or more pads in an hour, clots bigger than an egg, passing tissue, or foul-smelling discharge.", window: "after_birth" },
  { id: "leg_arm", label: "Severe swelling, redness or pain of your leg or arm", detail: "In one leg (often the calf) or one arm, maybe red and warm.", window: "pregnancy_and_6_weeks" },
  { id: "tiredness", label: "Overwhelming tiredness", detail: "Sudden, severe weakness, not refreshed by sleep, or unable to care for your baby.", window: "pregnancy_and_year" },
] as const satisfies readonly { id: string; label: string; detail: string; window: Window }[];

export type Sign = (typeof SIGNS)[number];
export type SignId = Sign["id"];
export const SIGN_IDS = SIGNS.map((s) => s.id) as SignId[];
export const SIGNS_SOURCE = SOURCES.cdcHearHer;

/** Each sign as she'd say it in a sentence: "I am having a headache that won't go away." */
export const SIGN_PHRASE: Record<SignId, string> = {
  headache: "a headache that won't go away",
  dizziness: "dizziness or fainting",
  vision: "changes in my vision",
  fever: "a fever",
  swelling: "extreme swelling of my hands or face",
  harm_thoughts: "thoughts of harming myself or my baby",
  breathing: "trouble breathing",
  chest_heart: "chest pain or a fast-beating heart",
  vomiting: "severe nausea and throwing up",
  belly_pain: "severe belly pain that doesn't go away",
  baby_movement: "my baby moving less than usual",
  bleeding_pregnant: "vaginal bleeding or fluid leaking",
  bleeding_after: "heavy bleeding or discharge",
  leg_arm: "a swollen, red or painful leg or arm",
  tiredness: "overwhelming tiredness",
};

// Where she is: pregnant, some days after giving birth, or not told us yet.
export type Stage = { kind: "pregnant" } | { kind: "after_birth"; days: number } | { kind: "unknown" };

const SIX_WEEKS = 42;
const ONE_YEAR = 365;

// The signs that apply to her today. Not knowing her stage shows every sign, never none.
export function signsFor(stage: Stage) {
  return SIGNS.filter((s) => {
    if (stage.kind === "unknown") return true;
    if (stage.kind === "pregnant") return s.window !== "after_birth";
    if (s.window === "pregnancy") return false;
    if (s.window === "pregnancy_and_6_weeks") return stage.days <= SIX_WEEKS;
    return stage.days <= ONE_YEAR;
  });
}
