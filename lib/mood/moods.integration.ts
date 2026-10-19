// Mood checks under row-level security: hers, and her care team's by default; never her partner's unless she shares
// mood; and nobody writes a score from the browser.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "../people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../people/test-people.ts";
import { scoreMood } from "../safety/mood.ts";

let mom: Person, partner: Person, doctor: Person;

before(async () => {
  [mom, partner, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  const answers = [2, 2, 1, 2, 1, 1, 1, 1, 0];
  const r = scoreMood(answers);
  const { error } = await admin.from("moods").insert({ mother_id: mom.id, kind: r.kind, answers, score: r.score, level: r.level, engine_version: r.version });
  if (error) throw error;
});
after(removeAll);

test("she and her care team see her mood check; her partner doesn't by default", async () => {
  assert.equal((await mom.db.from("moods").select("score")).data?.[0]?.score, 11);
  assert.equal((await doctor.db.from("moods").select("score")).data?.[0]?.score, 11);
  assert.deepEqual((await partner.db.from("moods").select("id")).data, []);
});

test("nobody writes or changes a score from the browser, not even her", async () => {
  assert.ok((await mom.db.from("moods").insert({ mother_id: mom.id, kind: "phq2", answers: [0, 0], score: 0, level: "none", engine_version: "x" })).error);
  await mom.db.from("moods").update({ score: 0 }).eq("mother_id", mom.id);
  assert.equal((await admin.from("moods").select("score").eq("mother_id", mom.id).single()).data!.score, 11);
});

test("a check-in can come from the mood check", async () => {
  const { error } = await admin.from("checkins").insert({ mother_id: mom.id, source: "mood", signs: ["harm_thoughts"], level: "urgent", engine_version: "x" });
  assert.equal(error, null);
});
