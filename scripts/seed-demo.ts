// Makes (or remakes) the demo family with synthetic data: Maya, 27 weeks pregnant; Sam, her partner; Dr Lee, her
// OB-GYN; one clear check-in yesterday and one with a warning sign today. Password from MOMWELL_DEMO_PASSWORD.
// Run: node --env-file=.env.local scripts/seed-demo.ts
import { createClient } from "@supabase/supabase-js";
import { defaultSees } from "../lib/people/access.ts";
import { evaluate } from "../lib/safety/engine.ts";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const password = process.env.MOMWELL_DEMO_PASSWORD!;
if (!password) throw new Error("Set MOMWELL_DEMO_PASSWORD in .env.local");

const PEOPLE = [
  { key: "mom", email: "momwell.demo.maya@example.com", role: "mother", name: "Maya" },
  { key: "partner", email: "momwell.demo.sam@example.com", role: "circle", name: "Sam" },
  { key: "doctor", email: "momwell.demo.lee@example.com", role: "care_team", name: "Dr Lee" },
] as const;

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
for (const p of PEOPLE) {
  const old = list.users.find((u) => u.email === p.email);
  if (old) await admin.auth.admin.deleteUser(old.id);
}
const must = <T extends { error: unknown }>(r: T) => {
  if (r.error) throw r.error;
  return r;
};
const id: Record<string, string> = {};
for (const p of PEOPLE) {
  const { data, error } = await admin.auth.admin.createUser({ email: p.email, password, email_confirm: true });
  if (error) throw error;
  id[p.key] = data.user.id;
  must(await admin.from("profiles").insert({ id: data.user.id, role: p.role, name: p.name }));
}

const due = new Date(Date.now() + 13 * 7 * 86_400_000).toISOString().slice(0, 10);
must(await admin.from("mothers").insert({ id: id.mom, due_date: due }));
must(
  await admin.from("links").insert([
  { mother_id: id.mom, person_id: id.partner, kind: "circle", relation: "husband", partner: true, sees: defaultSees({ kind: "circle", partner: true }) },
  { mother_id: id.mom, person_id: id.doctor, kind: "care_team", relation: "OB-GYN", partner: false, sees: defaultSees({ kind: "care_team" }) },
  ]),
);

const clear = evaluate({ signs: [], bp: { systolic: 118, diastolic: 76 } });
must(await admin.from("checkins").insert({ mother_id: id.mom, created_at: new Date(Date.now() - 86_400_000).toISOString(), systolic: 118, diastolic: 76, level: clear.level, reasons: clear.reasons, engine_version: clear.version }));
const warn = evaluate({ signs: ["headache"], bp: { systolic: 148, diastolic: 94 } });
const { data: c } = await admin.from("checkins").insert({ mother_id: id.mom, signs: ["headache"], systolic: 148, diastolic: 94, note: "Headache since this morning, worse when I stand up.", level: warn.level, reasons: warn.reasons, engine_version: warn.version }).select("id").single();
must(await admin.from("alerts").insert({ mother_id: id.mom, checkin_id: c!.id, level: warn.level }));
console.log("demo family ready:", PEOPLE.map((p) => p.email).join(", "));
