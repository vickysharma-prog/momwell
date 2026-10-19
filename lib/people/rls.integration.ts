// Row-level security against the real database, with synthetic users made and removed by the test.
// Run: npm run test:integration
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSees } from "./access.ts";

const url = process.env.SUPABASE_URL!;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const anon = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

type Person = { id: string; db: SupabaseClient };
const made: string[] = [];

async function person(role: "mother" | "circle" | "care_team", name: string): Promise<Person> {
  const email = `momwell.rls.${role}.${crypto.randomUUID().slice(0, 8)}@example.com`;
  const password = crypto.randomUUID();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  made.push(data.user.id);
  const db = anon();
  const signIn = await db.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  const { error: e } = await db.from("profiles").insert({ id: data.user.id, role, name });
  if (e) throw e;
  return { id: data.user.id, db };
}

async function invite(from: Person, row: Record<string, unknown>) {
  const { data, error } = await from.db.from("invites").insert(row).select("token").single();
  if (error) throw error;
  return data.token as string;
}

let mom: Person, friend: Person, otherMom: Person, doctor: Person;

before(async () => {
  [mom, friend, otherMom, doctor] = await Promise.all([
    person("mother", "Test Mother"),
    person("circle", "Test Friend"),
    person("mother", "Other Mother"),
    person("care_team", "Test Doctor"),
  ]);
});

after(async () => {
  for (const id of made) await admin.auth.admin.deleteUser(id);
});

test("a mother's invite links her circle, and only the two of them see it", async () => {
  const token = await invite(mom, { from_id: mom.id, kind: "circle", relation: "sister", sees: defaultSees({ kind: "circle", partner: false }) });
  const { error } = await friend.db.rpc("accept_invite", { t: token });
  assert.equal(error, null);

  const { data: seen } = await friend.db.from("profiles").select("name").eq("id", mom.id);
  assert.deepEqual(seen, [{ name: "Test Mother" }]);
  const { data: hidden } = await otherMom.db.from("profiles").select("id").eq("id", mom.id);
  assert.deepEqual(hidden, []);
  const { data: links } = await otherMom.db.from("links").select("*");
  assert.deepEqual(links, []);
});

test("an invite works once", async () => {
  const token = await invite(mom, { from_id: mom.id, kind: "circle", sees: ["tasks"] });
  assert.equal((await friend.db.rpc("accept_invite", { t: token })).error, null);
  assert.ok((await friend.db.rpc("accept_invite", { t: token })).error);
});

test("an invite is for the role it names", async () => {
  const token = await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) });
  assert.match((await otherMom.db.rpc("accept_invite", { t: token })).error!.message, /care_team/);
});

test("a clinician invites a patient, and the mother becomes the patient", async () => {
  const token = await invite(doctor, { from_id: doctor.id, kind: "care_team", relation: "OB-GYN", sees: defaultSees({ kind: "care_team" }) });
  assert.equal((await otherMom.db.rpc("accept_invite", { t: token })).error, null);
  const { data } = await doctor.db.from("links").select("mother_id, kind").eq("person_id", doctor.id);
  assert.deepEqual(data, [{ mother_id: otherMom.id, kind: "care_team" }]);
});

test("nobody writes a link directly, and the circle can't invite", async () => {
  assert.ok((await friend.db.from("links").insert({ mother_id: otherMom.id, person_id: friend.id, kind: "circle", sees: ["mood"] })).error);
  assert.ok((await friend.db.from("invites").insert({ from_id: friend.id, kind: "circle", sees: ["tasks"] })).error);
});

test("only the mother changes what someone sees", async () => {
  await friend.db.from("links").update({ sees: ["tasks", "mood"] }).eq("mother_id", mom.id);
  const before = await mom.db.from("links").select("sees").eq("person_id", friend.id).single();
  assert.ok(!before.data!.sees.includes("mood"));

  await mom.db.from("links").update({ sees: ["tasks", "alerts"] }).eq("person_id", friend.id);
  const now = await friend.db.from("links").select("sees").eq("mother_id", mom.id).single();
  assert.deepEqual(now.data!.sees, ["tasks", "alerts"]);
});

test("a role can't be changed after sign-up", async () => {
  await friend.db.from("profiles").update({ role: "care_team" }).eq("id", friend.id);
  const { data } = await admin.from("profiles").select("role").eq("id", friend.id).single();
  assert.equal(data!.role, "circle");
});

test("someone signed out sees nothing", async () => {
  for (const table of ["profiles", "links", "invites"]) {
    const { data } = await anon().from(table).select("*");
    assert.ok(!data?.length, table);
  }
});

test("the mother removes someone in one click", async () => {
  await mom.db.from("links").delete().eq("person_id", friend.id);
  const { data } = await friend.db.from("profiles").select("id").eq("id", mom.id);
  assert.deepEqual(data, []);
});
