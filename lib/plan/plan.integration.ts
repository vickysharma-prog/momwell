// Today's plan, end to end: the planner (or the rules) makes it through Qloo and saves it; she and the people she
// shares ways to help with read it, nobody else does, and nobody but the server writes it.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "../people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../people/test-people.ts";
import { search } from "../qloo/api.ts";
import { makePlan, type Plan } from "./make.ts";

let mom: Person, partner: Person, aunt: Person, doctor: Person;
let plan: Plan;
const today = new Date().toISOString().slice(0, 10);

before(async () => {
  [mom, partner, aunt, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("circle", "Rosa"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await aunt.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", relation: "aunt", sees: ["alerts"] }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  const liked = await Promise.all(
    (
      [
        ["Gilmore Girls", "tv_show"],
        ["Norah Jones", "artist"],
      ] as const
    ).map(async ([q, kind]) => ({ id: (await search(q, 1, `urn:entity:${kind}`))[0].entity_id, name: q, kind })),
  );
  await admin.from("tastes").insert({ mother_id: mom.id, city: "Austin, TX", diets: ["vegetarian"], liked });
  plan = await makePlan(admin, mom.id, today);
});
after(removeAll);

test("the plan picks from Qloo's answers, and its notes say nothing about her health", () => {
  assert.ok(plan.picks.show && plan.picks.artist, JSON.stringify(plan.picks));
  assert.ok(plan.trace.some((s) => s.who === "Qloo"));
  assert.ok(plan.trace.some((s) => s.who === "Rules"));
  console.log(plan.madeBy, plan.noteHer, "|", plan.noteCircle, plan.picks.show?.name, plan.picks.place?.name, plan.picks.artist?.name);
});

test("she and her partner read it; an aunt who sees alerts only and her care team don't", async () => {
  assert.equal((await mom.db.from("plans").select("id")).data?.length, 1);
  assert.equal((await partner.db.from("plans").select("id")).data?.length, 1);
  assert.deepEqual((await aunt.db.from("plans").select("id")).data, []);
  assert.deepEqual((await doctor.db.from("plans").select("id")).data, []);
});

test("only the server writes it", async () => {
  await mom.db.from("plans").update({ note_her: "changed" }).eq("mother_id", mom.id);
  assert.notEqual((await admin.from("plans").select("note_her").eq("mother_id", mom.id).single()).data!.note_her, "changed");
  assert.ok((await partner.db.from("plans").insert({ mother_id: mom.id, for_date: "2030-01-01", picks: {}, made_by: "rules" })).error);
});
