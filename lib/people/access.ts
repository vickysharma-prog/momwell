// What a person linked to a mother can see. The mother changes these per person; these are only the starting point.
// The same list is the check constraint in db/migrations/001_people.sql.
export const SCOPES = ["tasks", "alerts", "checkins", "mood", "baby", "appointments", "medicines"] as const;
export type Scope = (typeof SCOPES)[number];

export type Link = { kind: "circle"; partner: boolean } | { kind: "care_team" };

export function defaultSees(link: Link): Scope[] {
  if (link.kind === "care_team") return ["alerts", "checkins", "mood", "baby", "appointments", "medicines"];
  // The partner gets alerts and the shared calendar for night shifts and visits; mood stays hers to share.
  return link.partner ? ["tasks", "alerts", "baby", "appointments"] : ["tasks", "baby"];
}
