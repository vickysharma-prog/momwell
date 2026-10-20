// A demo family's story, the same for the judge demo and for scripts/seed-demo.ts: Maya at 27 weeks in Austin, her
// partner Sam, her OB-GYN Dr Lee; what Maya loves, a clear check-in yesterday and a warning sign today that Sam and
// Dr Lee have been alerted to. All synthetic.
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultSees } from "../people/access.ts";
import { search } from "../qloo/api.ts";
import { evaluate } from "../safety/engine.ts";
import { scoreMood } from "../safety/mood.ts";
import { dateIn } from "../time.ts";

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

// Fictional numbers (555-0100 to 555-0199 are set aside for fiction), so the warning screen's call buttons show.
const PHONES: Record<Member, string> = { mom: "5125550142", partner: "5125550117", doctor: "5125550190" };

// Everything that doesn't depend on something else is written at the same time, so a judge waits as little as possible.
export async function fillFamily(admin: SupabaseClient, id: Record<Member, string>) {
  const due = new Date(Date.now() + 13 * 7 * 86_400_000).toISOString().slice(0, 10);
  // Today where the family lives (Austin), not on the server's clock.
  const today = dateIn("America/Chicago");
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  const clear = evaluate({ signs: [], bp: { systolic: 118, diastolic: 76 } });
  const warn = evaluate({ signs: ["headache"], bp: { systolic: 148, diastolic: 94 } });
  // Her last mood check, 16 days ago (so today's is due): a PHQ-9 of 11 that Dr Lee can see.
  const answers = [2, 2, 1, 2, 1, 1, 1, 1, 0];
  const mood = scoreMood(answers);
  // What Maya loves, found in Qloo (cached, so this costs no quota).
  const liked = (await Promise.all(PICKS.map(async ([q, kind]) => ((e) => (e ? { id: e.entity_id, name: e.name, kind } : null))((await search(q, 1, `urn:entity:${kind}`))[0])))).filter(Boolean);

  const [, , , , , , warned] = await Promise.all([
    ...(Object.keys(PHONES) as Member[]).map(async (m) => must(await admin.from("profiles").update({ phone: PHONES[m] }).eq("id", id[m]))),
    (async () => must(await admin.from("mothers").insert({ id: id.mom, due_date: due, baby_doctor_name: "Dr Patel", baby_doctor_phone: "5125550163" })))(),
    (async () =>
      must(
        await admin.from("links").insert([
          { mother_id: id.mom, person_id: id.partner, kind: "circle", relation: "husband", partner: true, sees: defaultSees({ kind: "circle", partner: true }) },
          { mother_id: id.mom, person_id: id.doctor, kind: "care_team", relation: "OB-GYN", partner: false, sees: defaultSees({ kind: "care_team" }) },
        ]),
      ))(),
    (async () => must(await admin.from("tastes").insert({ mother_id: id.mom, city: "Austin, TX", diets: ["vegetarian"], liked })))(),
    (async () =>
      must(
        await admin
          .from("checkins")
          .insert({ mother_id: id.mom, created_at: hoursAgo(2), signs: ["headache"], systolic: 148, diastolic: 94, note: "Headache since this morning, worse when I stand up.", level: warn.level, reasons: warn.reasons, engine_version: warn.version })
          .select("id")
          .single(),
      ))(),
    (async () => must(await admin.from("checkins").insert({ mother_id: id.mom, created_at: hoursAgo(24), systolic: 118, diastolic: 76, level: clear.level, reasons: clear.reasons, engine_version: clear.version })))(),
    (async () => must(await admin.from("moods").insert({ mother_id: id.mom, created_at: hoursAgo(16 * 24), kind: mood.kind, answers, score: mood.score, level: mood.level, engine_version: mood.version })))(),
    // What Maya asked her circle for: Sam has tonight's feeds; dinner is still open.
    (async () =>
      must(
        await admin.from("asks").insert([
          { mother_id: id.mom, kind: "night_feeds", note: "", needed_on: today, taken_by: id.partner, taken_at: new Date().toISOString() },
          { mother_id: id.mom, kind: "meal", needed_on: today, note: "Something warm, vegetarian" },
        ]),
      ))(),
  ]);
  const checkinId = (warned as { data: { id: string } | null }).data!.id;
  must(await admin.from("alerts").insert({ mother_id: id.mom, checkin_id: checkinId, level: warn.level, created_at: hoursAgo(2) }));
}
