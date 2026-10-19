// The care team's patient list as a triage queue: who needs a look first, and why, from plain rules.
export type Level = "urgent" | "call_doctor" | "check" | "none";
export type Status = "urgent" | "call" | "quiet" | "clear" | "new";

export type PatientFacts = {
  unseenUrgent: number; // urgent alerts nobody on her care team has marked seen
  unseenCall: number; // "call your doctor" alerts not yet seen
  lastCheckIn: string | null; // ISO time of her latest check-in
  lastLevel: Level | null;
};

export const QUIET_DAYS = 3;

const RANK: Record<Status, number> = { urgent: 0, call: 1, quiet: 2, new: 3, clear: 4 };

export const STATUS: Record<Status, { label: string; tone: "alarm" | "honey" | "muted" | "brand" }> = {
  urgent: { label: "Urgent, not seen", tone: "alarm" },
  call: { label: "Call her", tone: "honey" },
  quiet: { label: `No check-in for ${QUIET_DAYS}+ days`, tone: "muted" },
  new: { label: "No check-ins yet", tone: "muted" },
  clear: { label: "All clear", tone: "brand" },
};

export function statusOf(p: PatientFacts, now: Date): { status: Status; reason: string } {
  if (p.unseenUrgent > 0) return { status: "urgent", reason: `${p.unseenUrgent} urgent ${p.unseenUrgent === 1 ? "alert" : "alerts"} not yet seen` };
  if (p.unseenCall > 0) return { status: "call", reason: "Blood pressure in the call-her range, not yet seen" };
  if (!p.lastCheckIn) return { status: "new", reason: "She hasn't checked in yet" };
  const days = Math.floor((now.getTime() - Date.parse(p.lastCheckIn)) / 86_400_000);
  if (days >= QUIET_DAYS) return { status: "quiet", reason: `Last check-in ${days} days ago` };
  return { status: "clear", reason: p.lastLevel === "none" ? "Checked in, nothing on the warning list" : "Checked in, alerts seen" };
}

/** Most urgent first; within a status, the longest-waiting first. */
export function triage<T extends PatientFacts & { name: string }>(patients: T[], now: Date) {
  return patients
    .map((p) => ({ ...p, ...statusOf(p, now) }))
    .sort((a, b) => RANK[a.status] - RANK[b.status] || (Date.parse(a.lastCheckIn ?? "0") || 0) - (Date.parse(b.lastCheckIn ?? "0") || 0) || a.name.localeCompare(b.name));
}
