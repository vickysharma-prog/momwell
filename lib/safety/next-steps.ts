// What to do while she gets care, from CDC Hear Her's tips for pregnant and postpartum women: say she's pregnant or
// was in the past year, bring someone, bring her medicines and history, take notes, and trust herself. Practical
// steps only; nothing here treats or diagnoses anything.
import { SOURCES } from "./sources.ts";

export type Step = { text: string };
export const NEXT_STEPS_SOURCE = SOURCES.cdcHearHerTips;

export function nextSteps({ companion }: { companion?: string }): Step[] {
  return [
    { text: "Say that you’re pregnant, or were pregnant in the past year. The words below help." },
    { text: companion ? `Ask ${companion} to come with you, to help you remember and ask your questions.` : "Bring a friend or family member, to help you remember and ask your questions." },
    { text: "Tell them every medicine you take or took recently, and any high blood pressure, diabetes or problems in this pregnancy or birth." },
    { text: "Write down what they tell you, and ask again about anything you don’t understand." },
    { text: "You know your body best. If something still feels wrong, say so, and keep asking." },
  ];
}

/** Paced breathing for the wait (NHS): in for five, out for five. Never for chest pain or trouble breathing. */
export const BREATHE = { inCount: 5, outCount: 5, minutes: 5, source: SOURCES.nhsBreathing };
export const canBreathe = (reasons: { id: string }[]) => !reasons.some((r) => r.id === "breathing" || r.id === "chest_heart" || r.id === "harm_thoughts");
