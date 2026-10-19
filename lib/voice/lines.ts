// The fixed things Momwell says aloud at important moments. They are recorded once (scripts/voice-lines.ts) and
// shipped with the app, so they play at once and never depend on a model call. The words match the screen.
export const VOICE = "Sulafat";
export const STYLE = "Say this warmly, calmly and a little slowly, like a kind nurse:";

export const LINES = {
  urgent: "Please get medical care now. If it's an emergency, call nine one one.",
  call_doctor: "Please call your doctor right away. If you can't reach them, or you feel you need care now, call nine one one.",
  crisis: "You don't have to carry this alone. You can call or text nine eight eight right now, any time, day or night.",
  check: "Let's check that number together. Please enter it again.",
  clear: "Thank you for checking in. Nothing you told me today is on the warning list. I'll be here tomorrow.",
  note: "Thank you. I checked the boxes you tapped. If anything you wrote is on the list, please go back and tap it.",
  // Her baby's results.
  baby_urgent: "Please call nine one one for your baby now.",
  baby_call: "Please call your baby's doctor now. If you can't reach them, go to the nearest emergency room.",
  baby_clear: "Thank you. Nothing you told me is on the warning list for your baby. If your baby seems sick to you, call the doctor. You know your baby best.",
  // The mood check's results. Never a label, only what to do.
  mood_clear: "Thank you for answering. Nothing here to act on today. I'll ask again in two weeks.",
  mood_talk: "Thank you for answering. Your answers suggest talking with your doctor or midwife this week. You don't have to wait until you feel worse.",
  // A short guide the first time each screen opens, for each person.
  guide_mom: "Hi, I'm Momwell. Each day, tap how you feel in your check-in. If anything is a warning sign, I'll tell you what to do, and let your people know.",
  guide_partner: "Hi. If she ever needs you, you'll see it here first. You can also take something off her plate, under Help.",
  guide_doctor: "These are your patients. Whoever needs a look first is at the top, with the reason why.",
  guide_checkin: "Tap anything that's true today, and add your blood pressure if you took it. It takes about thirty seconds.",
  guide_mood: "These are the questions doctors use. There are no wrong answers, and only the people you choose will see them.",
  guide_baby: "Tap anything that's happening to your baby right now. If something feels wrong and it isn't here, call the doctor anyway.",
  guide_help_mom: "Ask for what would make today easier. Your people will see it, and can take it with one tap.",
  guide_help_circle: "Here's what she asked for. Take one, and she'll see it's yours.",
  guide_foryou: "These are picked from what you love, through Qloo. Gentle shows, places that fit your diet, and calm music.",
  guide_talk: "Tell me how you're feeling, in your own words. I'll listen for anything that needs care.",
} as const;
export type LineId = keyof typeof LINES;

/** Which line her baby's check-in result speaks. */
export const babyLineFor = (level: "urgent" | "call_doctor" | "check" | "none"): LineId => (level === "urgent" ? "baby_urgent" : level === "call_doctor" ? "baby_call" : level === "check" ? "check" : "baby_clear");

// Which line a check-in result speaks. The crisis line comes first when there are thoughts of harm.
export function lineFor(result: { level: "urgent" | "call_doctor" | "check" | "none"; crisis: boolean; noteUnread: boolean }): LineId {
  if (result.crisis) return "crisis";
  if (result.level === "none") return result.noteUnread ? "note" : "clear";
  return result.level;
}
