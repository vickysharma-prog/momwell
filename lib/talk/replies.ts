// What Momwell says at once, for how she feels. Fixed words, chosen by the router's rules; never a diagnosis, never a
// medicine, and always a next step she can tap.
import type { LineId } from "../voice/lines.ts";
import type { Feeling, Want } from "./router.ts";

export type Chip = { label: string; href?: string; send?: string; tone?: "alarm" };
// line: its recording in Momwell's voice, once there is one.
export type Reply = { text: string; chips: Chip[]; line?: LineId };

export const MATERNAL_HOTLINE = "tel:18338526262";

export const REPLIES: Record<Feeling, Reply> = {
  low: {
    text: "I’m sorry it feels heavy right now. You’re not alone in this. Would you like to do your mood check, or ask your people for help today?",
    line: "talk_low",
    chips: [{ label: "Do my mood check", href: "/mood" }, { label: "Ask my people for help", href: "/help" }, { label: "Talk to someone now", href: MATERNAL_HOTLINE }],
  },
  sleep: {
    text: "Nights can be so hard right now. Try to rest your body, even if sleep won’t come. I can find you something calm to watch or listen to.",
    line: "talk_sleep",
    chips: [{ label: "A calm show", send: "Find me something calm to watch" }, { label: "Calm music", send: "Find me calm music to listen to" }],
  },
  good: {
    text: "I’m so glad. Your thirty-second check-in helps keep it that way.",
    chips: [{ label: "Check in", href: "/check-in" }],
  },
  greet: {
    text: "Hi, I’m here. How are you feeling today?",
    chips: [{ label: "I’m doing well", send: "I'm good today" }, { label: "Not so great", send: "I feel down today" }, { label: "Something feels wrong", href: "/check-in", tone: "alarm" }],
  },
  thanks: { text: "Anytime. I’m here whenever you need me.", chips: [] },
  help: {
    text: "Your people want to help. Tell them what would make today easier, and they can take it with one tap.",
    chips: [{ label: "Ask my people", href: "/help" }],
  },
  medical: {
    text: "I can’t advise on medicines. Your doctor or pharmacist is the one to ask, and they’re glad to help.",
    chips: [{ label: "Check the warning signs", href: "/check-in" }],
  },
};

export const NOT_NOW: Reply = { text: "Okay. If anything changes, tell me, or tap Check in any time.", chips: [{ label: "Check in", href: "/check-in" }] };

/** "It sounds like a headache that won't go away. Is this happening now?" */
export function askAbout(labels: string[]) {
  const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
  return `It sounds like ${list}. Is this happening now?`;
}

/** Anything the rules don't recognise: what Momwell can do, one tap each. */
export const MENU: Reply = {
  text: "I’m here for how you feel and the little things that make the day lighter. What would help right now?",
  chips: [
    { label: "Check my warning signs", href: "/check-in" },
    { label: "My mood check", href: "/mood" },
    { label: "A calm show", send: "Find me something calm to watch" },
    { label: "Food near me", send: "Where can I eat near me?" },
    { label: "Calm music", send: "Music for my hospital bag" },
    { label: "Ask my people", href: "/help" },
  ],
};

/** What Momwell says as it brings her Qloo picks. */
export const PICKS_SAY: Record<Want, string> = {
  shows: "Here are a few gentle ones, picked through Qloo from what you love.",
  food: "Here are places near you that fit your diet, picked through Qloo, with what to ask for while you’re pregnant.",
  music: "Here are calm artists for your birth playlist, picked through Qloo from the music you love.",
};
