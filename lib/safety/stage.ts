import type { Stage } from "./signs.ts";

const DAY = 86_400_000;
const days = (from: string, to: Date) => Math.floor((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.parse(from)) / DAY);

// Her stage today from the dates she gave. A birth date wins over a due date. A birth date in the future is a typo,
// so we don't trust either date and show every sign.
export function stageFrom(dates: { due_date?: string | null; birth_date?: string | null }, today: Date): Stage {
  if (dates.birth_date) {
    const d = days(dates.birth_date, today);
    return d >= 0 ? { kind: "after_birth", days: d } : { kind: "unknown" };
  }
  if (dates.due_date) return { kind: "pregnant" };
  return { kind: "unknown" };
}

// Weeks pregnant from the due date (40 weeks at the due date), for display only.
export function weeksPregnant(due: string, today: Date) {
  return Math.max(0, Math.floor(40 + days(due, today) / 7));
}
