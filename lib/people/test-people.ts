// Synthetic people for integration tests: real accounts, signed in with the publishable key, removed after.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
export const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
export const anon = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

export type Person = { id: string; db: SupabaseClient; email: string; password: string };
const made: string[] = [];

export async function person(role: "mother" | "circle" | "care_team", name: string): Promise<Person> {
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
  return { id: data.user.id, db, email, password };
}

export async function invite(from: Person, row: Record<string, unknown>) {
  const { data, error } = await from.db.from("invites").insert(row).select("token").single();
  if (error) throw error;
  return data.token as string;
}

export async function removeAll() {
  for (const id of made.splice(0)) await admin.auth.admin.deleteUser(id);
}
