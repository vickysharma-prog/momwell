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
} as const;
export type LineId = keyof typeof LINES;

// Which line a check-in result speaks. The crisis line comes first when there are thoughts of harm.
export function lineFor(result: { level: "urgent" | "call_doctor" | "check" | "none"; crisis: boolean; noteUnread: boolean }): LineId {
  if (result.crisis) return "crisis";
  if (result.level === "none") return result.noteUnread ? "note" : "clear";
  return result.level;
}
