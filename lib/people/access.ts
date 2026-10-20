// What a person linked to a mother can see. The mother changes these per person; these are only the starting point.
// The same list is the check constraint in db/migrations/001_people.sql.
export const SCOPES = ["tasks", "alerts", "checkins", "mood", "baby", "appointments", "medicines"] as const;
export type Scope = (typeof SCOPES)[number];
// The scopes she sees and sets today. Appointments and medicines stay in the database for what comes next, kept as they
// are when she saves.
export const SHOWN_SCOPES = SCOPES.filter((s) => s !== "appointments" && s !== "medicines");
export const shownOnly = (sees: readonly Scope[]) => sees.filter((s) => (SHOWN_SCOPES as readonly string[]).includes(s));

export type Link = { kind: "circle"; partner: boolean } | { kind: "care_team" };

export function defaultSees(link: Link): Scope[] {
  if (link.kind === "care_team") return ["alerts", "checkins", "mood", "baby", "appointments", "medicines"];
  // The partner gets alerts and the shared calendar for night shifts and visits; mood stays hers to share.
  return link.partner ? ["tasks", "alerts", "baby", "appointments"] : ["tasks", "baby"];
}

export const SCOPE_LABEL: Record<Scope, string> = {
  tasks: "Ways to help",
  alerts: "Urgent alerts",
  checkins: "Daily check-ins",
  mood: "Mood screening",
  baby: "Baby updates",
  appointments: "Appointments",
  medicines: "Medicines",
};
