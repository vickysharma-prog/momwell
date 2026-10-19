// The reasons a check-in shows her are written to her ("You told us"). Her care team reads them about her.
const SWAPS: [RegExp, string][] = [
  [/^You told us:/, "She reported:"],
  [/^You told us something/, "She reported something"],
  [/^Your blood pressure is/, "Her blood pressure was"],
  [/^Your temperature is/, "Her temperature was"],
];

// After the opening, the sign labels and advice still say "your": every one of those becomes hers.
const PRONOUNS: [RegExp, string][] = [
  [/\byourself\b/g, "herself"],
  [/\bYour\b/g, "Her"],
  [/\byour\b/g, "her"],
];

export function aboutHer(text: string) {
  const start = SWAPS.reduce((t, [from, to]) => t.replace(from, to), text);
  return PRONOUNS.reduce((t, [from, to]) => t.replace(from, to), start);
}

export const LEVEL_FOR_TEAM = {
  urgent: "Told to get care now (911 if an emergency)",
  call_doctor: "Told to call her doctor right away",
  check: "Asked to re-enter a reading",
  none: "Nothing on the warning-sign list",
} as const;
