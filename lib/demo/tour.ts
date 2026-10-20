// The demo story in six steps, for someone with a few minutes: what Maya reports, who hears, what her doctor sees,
// how Momwell talks, what Qloo brings her, and the year after the birth.
import type { Role } from "../people/signup.ts";

export type StepKey = "checkin" | "sam" | "lee" | "talk" | "foryou" | "baby";
export type Step = { key: StepKey; title: string; as: Role; path: string; born?: boolean };

export const STEPS: Step[] = [
  { key: "checkin", title: "Maya checks in with a headache", as: "mother", path: "/check-in", born: false },
  { key: "sam", title: "Sam is told, without the private detail", as: "circle", path: "/home" },
  { key: "lee", title: "Dr Lee sees her first in the queue", as: "care_team", path: "/home" },
  { key: "talk", title: "Tell Momwell how you feel", as: "mother", path: "/talk" },
  { key: "foryou", title: "What Qloo picked for her", as: "mother", path: "/for-you" },
  { key: "baby", title: "Six weeks on: check on the baby", as: "mother", path: "/baby", born: true },
];

/** Which step this screen completes, if any. */
export function stepDone(path: string, role: Role, born: boolean): StepKey | null {
  if (role === "circle") return "sam";
  if (role === "care_team") return "lee";
  if (/^\/check-in\/[^/]+$/.test(path)) return "checkin";
  if (path === "/talk") return "talk";
  if (path === "/for-you") return "foryou";
  if (path === "/baby" && born) return "baby";
  return null;
}
