// Asks under row-level security: who sees them, who can take them, and that nobody rewrites what she asked for.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "../people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../people/test-people.ts";

let mom: Person, partner: Person, sister: Person, doctor: Person;
let ask: string;

before(async () => {
  [mom, partner, sister, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("circle", "Ana"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await sister.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", relation: "sister", sees: defaultSees({ kind: "circle", partner: false }) }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  const { data, error } = await mom.db.from("asks").insert({ mother_id: mom.id, kind: "night_feeds" }).select("id").single();
  if (error) throw error;
  ask = data.id;
});
after(removeAll);

test("her circle sees what she asked for; her care team doesn't (no ways-to-help share)", async () => {
  assert.equal((await partner.db.from("asks").select("id")).data?.length, 1);
  assert.equal((await sister.db.from("asks").select("id")).data?.length, 1);
  assert.deepEqual((await doctor.db.from("asks").select("id")).data, []);
});

test("the partner takes it; then the sister can't take it from him", async () => {
  await partner.db.from("asks").update({ taken_by: partner.id, taken_at: new Date().toISOString() }).eq("id", ask).is("taken_by", null);
  await sister.db.from("asks").update({ taken_by: sister.id }).eq("id", ask);
  assert.equal((await admin.from("asks").select("taken_by").eq("id", ask).single()).data!.taken_by, partner.id);
});

test("nobody in her circle rewrites what she asked for", async () => {
  await partner.db.from("asks").update({ kind: "groceries", note: "changed" }).eq("id", ask);
  const { data } = await admin.from("asks").select("kind, note").eq("id", ask).single();
  assert.deepEqual(data, { kind: "night_feeds", note: "" });
});

test("only a mother asks, for herself", async () => {
  assert.ok((await partner.db.from("asks").insert({ mother_id: mom.id, kind: "meal" })).error);
});

test("she sees who took it, and marks it done", async () => {
  await mom.db.from("asks").update({ done: true }).eq("id", ask);
  assert.equal((await admin.from("asks").select("done").eq("id", ask).single()).data!.done, true);
});
