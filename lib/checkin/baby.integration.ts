// Baby check-ins under row-level security: they follow "Baby updates", hers follow "Daily check-ins". Her partner sees
// the baby's but not hers by default; a sister with baby updates sees only the baby's; her care team sees both.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "../people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../people/test-people.ts";

let mom: Person, partner: Person, sister: Person, doctor: Person;

before(async () => {
  [mom, partner, sister, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("circle", "Ana"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await sister.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", relation: "sister", sees: defaultSees({ kind: "circle", partner: false }) }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  const { error } = await admin.from("checkins").insert([
    { mother_id: mom.id, subject: "mother", signs: ["headache"], level: "urgent", engine_version: "x" },
    { mother_id: mom.id, subject: "baby", signs: ["baby_dry"], level: "call_doctor", engine_version: "x" },
  ]);
  if (error) throw error;
});
after(removeAll);

const subjects = async (who: Person) => ((await who.db.from("checkins").select("subject").order("subject")).data ?? []).map((r) => r.subject);

test("she and her care team see both", async () => {
  assert.deepEqual(await subjects(mom), ["baby", "mother"]);
  assert.deepEqual(await subjects(doctor), ["baby", "mother"]);
});

test("her partner and her sister see the baby's only", async () => {
  assert.deepEqual(await subjects(partner), ["baby"]);
  assert.deepEqual(await subjects(sister), ["baby"]);
});

test("nobody writes a baby check-in from the browser", async () => {
  assert.ok((await mom.db.from("checkins").insert({ mother_id: mom.id, subject: "baby", level: "none", engine_version: "x" })).error);
});
