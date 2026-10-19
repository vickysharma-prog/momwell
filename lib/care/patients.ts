// The care team's patients, read under row-level security: only mothers who linked this clinician, and only what
// each one shares. Facts for the triage queue, worked out in a few queries.
import type { SupabaseClient } from "@supabase/supabase-js";
import { stageFrom, weeksPregnant } from "../safety/stage.ts";
import type { MoodLevel } from "../safety/mood.ts";
import type { Level } from "./triage.ts";

export type Patient = {
  id: string;
  name: string;
  stage: string;
  lastCheckIn: string | null;
  lastLevel: Level | null;
  lastBp: string | null;
  unseenUrgent: number;
  unseenCall: number;
  babyUrgent: number;
  babyCall: number;
  lastMood: { level: MoodLevel; at: string } | null;
};

export function stageLabel(dates: { due_date?: string | null; birth_date?: string | null } | null, now: Date) {
  const stage = stageFrom(dates ?? {}, now);
  if (stage.kind === "pregnant" && dates?.due_date) return `${weeksPregnant(dates.due_date, now)} weeks pregnant`;
  if (stage.kind === "after_birth") return stage.days < 14 ? `${stage.days} days after birth` : `${Math.floor(stage.days / 7)} weeks after birth`;
  return "Dates not set";
}

// The alert's check-in comes back under row-level security; her care team sees baby updates by default.
const aboutBaby = (a: { checkin: unknown }) => (a.checkin as { subject?: string } | null)?.subject === "baby";

export async function myPatients(db: SupabaseClient, clinicianId: string, now = new Date()): Promise<Patient[]> {
  const { data: links } = await db.from("links").select("mother_id, other:profiles!links_mother_id_fkey(name)").eq("person_id", clinicianId).eq("kind", "care_team");
  const rows = (links ?? []) as unknown as { mother_id: string; other: { name: string } }[];
  const ids = rows.map((l) => l.mother_id);
  if (!ids.length) return [];
  const [{ data: checkins }, { data: alerts }, { data: dates }, { data: moods }] = await Promise.all([
    db.from("checkins").select("mother_id, created_at, level, systolic, diastolic").in("mother_id", ids).eq("subject", "mother").order("created_at", { ascending: false }).limit(1000),
    db.from("alerts").select("mother_id, level, checkin:checkins(subject)").in("mother_id", ids).is("seen_at", null),
    db.from("mothers").select("id, due_date, birth_date").in("id", ids),
    db.from("moods").select("mother_id, created_at, level").in("mother_id", ids).order("created_at", { ascending: false }).limit(500),
  ]);
  return rows.map(({ mother_id, other }) => {
    const mine = (checkins ?? []).filter((c) => c.mother_id === mother_id);
    const withBp = mine.find((c) => c.systolic && c.diastolic);
    const open = (alerts ?? []).filter((a) => a.mother_id === mother_id);
    return {
      id: mother_id,
      name: other.name,
      stage: stageLabel((dates ?? []).find((d) => d.id === mother_id) ?? null, now),
      lastCheckIn: mine[0]?.created_at ?? null,
      lastLevel: (mine[0]?.level as Level) ?? null,
      lastBp: withBp ? `${withBp.systolic}/${withBp.diastolic}` : null,
      unseenUrgent: open.filter((a) => a.level === "urgent").length,
      unseenCall: open.filter((a) => a.level === "call_doctor").length,
      babyUrgent: open.filter((a) => a.level === "urgent" && aboutBaby(a)).length,
      babyCall: open.filter((a) => a.level === "call_doctor" && aboutBaby(a)).length,
      lastMood: ((m) => (m ? { level: m.level as MoodLevel, at: m.created_at } : null))((moods ?? []).find((m) => m.mother_id === mother_id)),
    };
  });
}
