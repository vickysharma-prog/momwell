import { z } from "zod";

export const ASK_KINDS = {
  meal: { label: "Bring dinner", short: "Dinner" },
  night_feeds: { label: "Take the night feeds", short: "Night feeds" },
  groceries: { label: "Pick up groceries", short: "Groceries" },
  company: { label: "Come keep me company", short: "Company" },
  ride: { label: "Drive me to an appointment", short: "A ride" },
  other: { label: "Something else", short: "Help" },
} as const;
export type AskKind = keyof typeof ASK_KINDS;

const askInput = z.object({
  kind: z.enum(Object.keys(ASK_KINDS) as [AskKind, ...AskKind[]]),
  note: z.string().trim().max(200).default(""),
  needed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** Her ask from the form: a kind, a short note, and the day (today when not given). */
export function readAsk(form: FormData, today: string) {
  const r = askInput.safeParse({ kind: form.get("kind"), note: form.get("note") ?? undefined, needed_on: form.get("needed_on") || undefined });
  if (!r.success) return { ok: false as const, error: "Pick what you need." };
  return { ok: true as const, value: { kind: r.data.kind, note: r.data.note, needed_on: r.data.needed_on && r.data.needed_on >= today ? r.data.needed_on : today } };
}

/** How an ask reads to her circle: "Maya would love: Bring dinner (tonight)". */
export function askLine(kind: AskKind, neededOn: string, today: string) {
  const when = neededOn === today ? "today" : new Date(`${neededOn}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  return `${ASK_KINDS[kind].label}, ${when}`;
}
