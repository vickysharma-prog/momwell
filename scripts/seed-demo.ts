// Makes (or remakes) a fixed demo family for my own walkthroughs, with the same story as the judge demo
// (lib/demo/family.ts) but known emails and a password from MOMWELL_DEMO_PASSWORD.
// Run: node --env-file=.env.local scripts/seed-demo.ts
import { createClient } from "@supabase/supabase-js";
import { FAMILY, fillFamily, type Member } from "../lib/demo/family.ts";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const password = process.env.MOMWELL_DEMO_PASSWORD;
if (!password) throw new Error("Set MOMWELL_DEMO_PASSWORD in .env.local");

const EMAIL: Record<Member, string> = { mom: "momwell.demo.maya@example.com", partner: "momwell.demo.sam@example.com", doctor: "momwell.demo.lee@example.com" };

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
for (const email of Object.values(EMAIL)) {
  const old = list.users.find((u) => u.email === email);
  if (old) await admin.auth.admin.deleteUser(old.id);
}
const ids = {} as Record<Member, string>;
for (const m of FAMILY) {
  const { data, error } = await admin.auth.admin.createUser({ email: EMAIL[m.key], password, email_confirm: true });
  if (error) throw error;
  ids[m.key] = data.user.id;
  const p = await admin.from("profiles").insert({ id: data.user.id, role: m.role, name: m.name });
  if (p.error) throw p.error;
}
await fillFamily(admin, ids);
console.log("demo family ready:", Object.values(EMAIL).join(", "));
