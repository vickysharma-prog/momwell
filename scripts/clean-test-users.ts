// Removes the synthetic accounts made by browser tests (emails starting momwell.e2e. or momwell.rls.).
// Run: node --env-file=.env.local scripts/clean-test-users.ts
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
for (const u of data.users.filter((u) => /^momwell\.(e2e|rls)\./.test(u.email ?? ""))) {
  await db.auth.admin.deleteUser(u.id);
  console.log("removed", u.email);
}
