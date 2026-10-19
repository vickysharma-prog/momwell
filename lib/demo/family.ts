// A demo family's story, the same for the judge demo and for scripts/seed-demo.ts: Maya at 27 weeks in Austin, her
// partner Sam, her OB-GYN Dr Lee; what Maya loves, a clear check-in yesterday and a warning sign today that Sam and
// Dr Lee have been alerted to. All synthetic.
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultSees } from "../people/access.ts";
import { search } from "../qloo/api.ts";
import { evaluate } from "../safety/engine.ts";
import { scoreMood } from "../safety/mood.ts";

export const FAMILY = [
  { key: "mom", role: "mother", name: "Maya" },
  { key: "partner", role: "circle", name: "Sam" },
  { key: "doctor", role: "care_team", name: "Dr Lee" },
] as const;
export type Member = (typeof FAMILY)[number]["key"];

const must = <T extends { error: unknown }>(r: T) => {
  if (r.error) throw r.error;
  return r;
};

// What Maya loves, found in Qloo (cached, so every new family costs no quota).
const PICKS: [string, "tv_show" | "movie" | "artist"][] = [
  ["Gilmore Girls", "tv_show"],
  ["Ted Lasso", "tv_show"],
  ["Little Women", "movie"],
  ["Adele", "artist"],
  ["Norah Jones", "artist"],
];

export async function fillFamily(admin: SupabaseClient, id: Record<Member, string>) {
  const due = new Date(Date.now() + 13 * 7 * 86_400_000).toISOString().slice(0, 10);
  must(await admin.from("mothers").insert({ id: id.mom, due_date: due }));
  must(
    await admin.from("links").insert([
      { mother_id: id.mom, person_id: id.partner, kind: "circle", relation: "husband", partner: true, sees: defaultSees({ kind: "circle", partner: true }) },
      { mother_id: id.mom, person_id: id.doctor, kind: "care_team", relation: "OB-GYN", partner: false, sees: defaultSees({ kind: "care_team" }) },
    ]),
  );

  const liked = [];
  for (const [q, kind] of PICKS) {
    const [e] = await search(q, 1, `urn:entity:${kind}`);
    if (e) liked.push({ id: e.entity_id, name: e.name, kind });
  }
  must(await admin.from("tastes").insert({ mother_id: id.mom, city: "Austin, TX", diets: ["vegetarian"], liked }));

  const clear = evaluate({ signs: [], bp: { systolic: 118, diastolic: 76 } });
  must(await admin.from("checkins").insert({ mother_id: id.mom, created_at: new Date(Date.now() - 86_400_000).toISOString(), systolic: 118, diastolic: 76, level: clear.level, reasons: clear.reasons, engine_version: clear.version }));
  const warn = evaluate({ signs: ["headache"], bp: { systolic: 148, diastolic: 94 } });
  const { data: c } = must(
    await admin
      .from("checkins")
      .insert({ mother_id: id.mom, created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(), signs: ["headache"], systolic: 148, diastolic: 94, note: "Headache since this morning, worse when I stand up.", level: warn.level, reasons: warn.reasons, engine_version: warn.version })
      .select("id")
      .single(),
  );
  // Her last mood check, 16 days ago (so today's is due): a PHQ-9 of 11 that Dr Lee can see.
  const answers = [2, 2, 1, 2, 1, 1, 1, 1, 0];
  const mood = scoreMood(answers);
  must(await admin.from("moods").insert({ mother_id: id.mom, created_at: new Date(Date.now() - 16 * 86_400_000).toISOString(), kind: mood.kind, answers, score: mood.score, level: mood.level, engine_version: mood.version }));
  // What Maya asked her circle for: Sam has tonight's feeds; dinner is still open.
  const today = new Date().toISOString().slice(0, 10);
  must(
    await admin.from("asks").insert([
      { mother_id: id.mom, kind: "night_feeds", note: "", needed_on: today, taken_by: id.partner, taken_at: new Date().toISOString() },
      { mother_id: id.mom, kind: "meal", needed_on: today, note: "Something warm, vegetarian" },
    ]),
  );
  must(await admin.from("alerts").insert({ mother_id: id.mom, checkin_id: c!.id, level: warn.level, created_at: new Date(Date.now() - 2 * 3_600_000).toISOString() }));
}
