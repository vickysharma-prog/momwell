// Phone numbers under row-level security: the people she's linked with can read them; nobody else; each person
// changes only their own.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { defaultSees } from "./access.ts";
import { admin, invite, person, removeAll, type Person } from "./test-people.ts";

let mom: Person, partner: Person, stranger: Person;

before(async () => {
  [mom, partner, stranger] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("circle", "Stranger")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  const { error } = await partner.db.from("profiles").update({ phone: "5125550117" }).eq("id", partner.id);
  if (error) throw error;
});
after(removeAll);

test("she can read her partner's number; a stranger can't", async () => {
  assert.equal((await mom.db.from("profiles").select("phone").eq("id", partner.id).single()).data?.phone, "5125550117");
  assert.deepEqual((await stranger.db.from("profiles").select("phone").eq("id", partner.id)).data, []);
});

test("nobody changes someone else's number", async () => {
  await mom.db.from("profiles").update({ phone: "5125550199" }).eq("id", partner.id);
  assert.equal((await admin.from("profiles").select("phone").eq("id", partner.id).single()).data!.phone, "5125550117");
});

test("the database refuses a number that isn't one", async () => {
  assert.ok((await mom.db.from("profiles").update({ phone: "call me" }).eq("id", mom.id)).error);
});
