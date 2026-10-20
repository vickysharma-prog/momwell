// The demo pool: a family made days ago, once claimed, tells its story from now: the alert two hours ago, today's
// asks today, the due date the same thirteen weeks away.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { admin } from "../people/test-people.ts";
import { claimDemoFamily, createDemoFamily, removeFamily } from "./create.ts";
import type { Member } from "./family.ts";

let family: string;
let ids: Record<Member, string>;
const DAY = 86_400_000;

before(async () => {
  ({ family, ids } = await createDemoFamily(null));
  // Make the pool family three days old, as if it had waited since then; and keep any other pool family out of the way.
  const old = new Date(Date.now() - 3 * DAY).toISOString();
  await admin.from("demo_families").update({ claimed_at: new Date().toISOString() }).is("claimed_at", null).neq("id", family);
  await admin.from("demo_families").update({ created_at: old }).eq("id", family);
  const shift = async (table: string, col: string) => {
    const { data } = await admin.from(table).select(`id, ${col}`).eq("mother_id", ids.mom);
    for (const r of (data ?? []) as Record<string, string>[]) await admin.from(table).update({ [col]: new Date(Date.parse(r[col]) - 3 * DAY).toISOString() }).eq("id", r.id);
  };
  await shift("alerts", "created_at");
  await shift("checkins", "created_at");
  const { data: asks } = await admin.from("asks").select("id, needed_on").eq("mother_id", ids.mom);
  for (const a of asks ?? []) await admin.from("asks").update({ needed_on: new Date(Date.parse(a.needed_on) - 3 * DAY).toISOString().slice(0, 10) }).eq("id", a.id);
  const { data: m } = await admin.from("mothers").select("due_date").eq("id", ids.mom).single();
  await admin.from("mothers").update({ due_date: new Date(Date.parse(m!.due_date) - 3 * DAY).toISOString().slice(0, 10) }).eq("id", ids.mom);
});
after(async () => removeFamily(admin, family, Object.values(ids)));

test("claiming moves the family's story to now", async () => {
  assert.equal(await claimDemoFamily("pool-test"), family);
  const { data: alert } = await admin.from("alerts").select("created_at").eq("mother_id", ids.mom).single();
  const hoursAgo = (Date.now() - Date.parse(alert!.created_at)) / 3_600_000;
  assert.ok(hoursAgo > 1.5 && hoursAgo < 2.5, `alert ${hoursAgo.toFixed(2)} hours ago`);
  const today = new Date().toISOString().slice(0, 10);
  const { data: asks } = await admin.from("asks").select("needed_on").eq("mother_id", ids.mom);
  assert.ok(asks!.every((a) => a.needed_on === today));
  const { data: m } = await admin.from("mothers").select("due_date").eq("id", ids.mom).single();
  const weeks = (Date.parse(m!.due_date) - Date.parse(today)) / (7 * DAY);
  assert.ok(Math.abs(weeks - 13) < 0.3, `${weeks} weeks to due date`);
  const { data: fam } = await admin.from("demo_families").select("claimed_at, ip_hash").eq("id", family).single();
  assert.equal(fam!.ip_hash, "pool-test");
  assert.ok(fam!.claimed_at);
});

test("an empty pool gives nothing, and a claimed family is never handed out twice", async () => {
  assert.equal(await claimDemoFamily("pool-test-2"), null);
});
