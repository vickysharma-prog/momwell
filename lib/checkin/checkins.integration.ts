// Check-ins and alerts under row-level security: who sees the alert, who sees the detail, who marks it seen.
// Run: npm run test:integration
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "../people/access.ts";
import { admin, anon, invite, person, removeAll, type Person } from "../people/test-people.ts";
import { evaluate } from "../safety/engine.ts";

let mom: Person, partner: Person, doctor: Person, stranger: Person;
let checkinId: string, alertId: string;

before(async () => {
  [mom, partner, doctor, stranger] = await Promise.all([
    person("mother", "Test Mother"),
    person("circle", "Test Partner"),
    person("care_team", "Test Doctor"),
    person("mother", "Stranger"),
  ]);
  const p = await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) });
  const d = await invite(mom, { from_id: mom.id, kind: "care_team", relation: "OB-GYN", sees: defaultSees({ kind: "care_team" }) });
  assert.equal((await partner.db.rpc("accept_invite", { t: p })).error, null);
  assert.equal((await doctor.db.rpc("accept_invite", { t: d })).error, null);

  // As the server action does: the engine decides, the service role writes.
  const result = evaluate({ signs: ["headache"], bp: { systolic: 150, diastolic: 95 } });
  const { data } = await admin.from("checkins").insert({ mother_id: mom.id, signs: ["headache"], systolic: 150, diastolic: 95, level: result.level, reasons: result.reasons, engine_version: result.version }).select("id").single();
  checkinId = data!.id;
  const { data: a } = await admin.from("alerts").insert({ mother_id: mom.id, checkin_id: checkinId, level: result.level }).select("id").single();
  alertId = a!.id;
});

after(removeAll);

test("she sees her own check-in and alert", async () => {
  assert.equal((await mom.db.from("checkins").select("id").eq("id", checkinId)).data?.length, 1);
  assert.equal((await mom.db.from("alerts").select("id").eq("id", alertId)).data?.length, 1);
});

test("the partner gets the alert but not what she reported", async () => {
  assert.equal((await partner.db.from("alerts").select("id").eq("id", alertId)).data?.length, 1);
  assert.deepEqual((await partner.db.from("checkins").select("id")).data, []);
});

test("her care team sees the alert and the detail", async () => {
  const { data } = await doctor.db.from("checkins").select("signs, level").eq("id", checkinId).single();
  assert.deepEqual(data, { signs: ["headache"], level: "urgent" });
});

test("a stranger and a signed-out visitor see nothing", async () => {
  for (const db of [stranger.db, anon()]) {
    assert.deepEqual((await db.from("checkins").select("id")).data ?? [], []);
    assert.deepEqual((await db.from("alerts").select("id")).data ?? [], []);
  }
});

test("nobody writes a check-in or an alert from the browser, not even her", async () => {
  assert.ok((await mom.db.from("checkins").insert({ mother_id: mom.id, level: "none", engine_version: "x" })).error);
  assert.ok((await mom.db.from("alerts").insert({ mother_id: mom.id, checkin_id: checkinId, level: "urgent" })).error);
  // And she can't quietly downgrade one either.
  await mom.db.from("checkins").update({ level: "none" }).eq("id", checkinId);
  assert.equal((await admin.from("checkins").select("level").eq("id", checkinId).single()).data!.level, "urgent");
});

test("only her care team marks an alert seen, as themselves", async () => {
  await partner.db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: partner.id }).eq("id", alertId);
  assert.equal((await admin.from("alerts").select("seen_at").eq("id", alertId).single()).data!.seen_at, null);

  const forged = await doctor.db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: partner.id }).eq("id", alertId);
  assert.ok(forged.error);

  await doctor.db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: doctor.id }).eq("id", alertId);
  const { data } = await mom.db.from("alerts").select("seen_by").eq("id", alertId).single();
  assert.equal(data!.seen_by, doctor.id);
});

test("her dates are hers to set, and only a mother has them", async () => {
  assert.equal((await mom.db.from("mothers").upsert({ id: mom.id, due_date: "2027-01-10" })).error, null);
  assert.ok((await partner.db.from("mothers").insert({ id: partner.id, due_date: "2027-01-10" })).error);
  assert.ok((await stranger.db.from("mothers").select("due_date").eq("id", mom.id)).data?.length === 0);
});

test("when she takes alerts away, the partner stops seeing them", async () => {
  await mom.db.from("links").update({ sees: ["tasks"] }).eq("person_id", partner.id);
  assert.deepEqual((await partner.db.from("alerts").select("id")).data, []);
});

test("she can't move her dates onto someone else", async () => {
  await mom.db.from("mothers").update({ id: stranger.id }).eq("id", mom.id);
  assert.equal((await admin.from("mothers").select("id").eq("id", mom.id)).data?.length, 1);
});
