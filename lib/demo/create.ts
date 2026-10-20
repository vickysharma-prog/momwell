// One click, one fresh demo family, signed in as Maya with no password anywhere: the server makes the accounts,
// then trades a one-time sign-in token for a session cookie.
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../supabase/admin.ts";
import { FAMILY, fillFamily, type Member } from "./family.ts";

export const DEMO_LIMIT_PER_HOUR = 6;
export const DEMO_TTL_HOURS = 48;

export const hashIp = (ip: string) => createHash("sha256").update(`momwell-demo:${ip}`).digest("hex").slice(0, 32);

/** Whether this visitor may make another demo family now. */
export async function underLimit(ipHash: string, admin = supabaseAdmin()) {
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin.from("demo_families").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  return (count ?? 0) < DEMO_LIMIT_PER_HOUR;
}

// With no visitor (ipHash null), the family waits in the pool until someone claims it.
export async function createDemoFamily(ipHash: string | null): Promise<{ family: string; ids: Record<Member, string> }> {
  const admin = supabaseAdmin();
  const { data: fam, error } = await admin.from("demo_families").insert({ ip_hash: ipHash, claimed_at: ipHash ? new Date().toISOString() : null }).select("id").single();
  if (error) throw error;
  const ids = {} as Record<Member, string>;
  try {
    // The three accounts at once.
    await Promise.all(
      FAMILY.map(async (m) => {
        const { data, error: e } = await admin.auth.admin.createUser({ email: demoEmail(fam.id, m.key), password: crypto.randomUUID() + crypto.randomUUID(), email_confirm: true });
        if (e) throw e;
        ids[m.key] = data.user.id;
        const p = await admin.from("profiles").insert({ id: data.user.id, role: m.role, name: m.name, demo_family: fam.id });
        if (p.error) throw p.error;
      }),
    );
    await fillFamily(admin, ids);
  } catch (e) {
    await removeFamily(admin, fam.id, Object.values(ids));
    throw e;
  }
  return { family: fam.id, ids };
}

export const POOL_SIZE = 2;

/** A family from the pool, its story moved to now; null when the pool is empty. */
export async function claimDemoFamily(ipHash: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin().rpc("claim_demo_family", { ip: ipHash });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Top the pool back up, one family at a time (Qloo answers are cached, so this spends no quota). */
export async function fillPool(size = POOL_SIZE) {
  const { count } = await supabaseAdmin().from("demo_families").select("id", { count: "exact", head: true }).is("claimed_at", null);
  for (let i = count ?? 0; i < size; i++) await createDemoFamily(null);
}

export const demoEmail = (family: string, member: Member) => `momwell.demo.${member}.${family}@example.com`;

/** A one-time token that signs this demo member in (no email is sent). */
export async function signInToken(family: string, member: Member) {
  const { data, error } = await supabaseAdmin().auth.admin.generateLink({ type: "magiclink", email: demoEmail(family, member) });
  if (error) throw error;
  return data.properties.hashed_token;
}

export async function removeFamily(admin: SupabaseClient, family: string, userIds: string[]) {
  for (const id of userIds) await admin.auth.admin.deleteUser(id);
  await admin.from("demo_families").delete().eq("id", family);
}

/** Demo families older than the time limit, gone with their accounts and data. */
export async function cleanOldFamilies() {
  const admin = supabaseAdmin();
  const before = new Date(Date.now() - DEMO_TTL_HOURS * 3_600_000).toISOString();
  // Only families someone opened: the pool waits, and moves its story to now when claimed.
  const { data: old } = await admin.from("demo_families").select("id").not("claimed_at", "is", null).lt("created_at", before).limit(50);
  let removed = 0;
  for (const f of old ?? []) {
    const { data: members } = await admin.from("profiles").select("id").eq("demo_family", f.id);
    await removeFamily(admin, f.id, (members ?? []).map((m) => m.id));
    removed++;
  }
  return removed;
}

/** The demo family's mother and whether her baby is born, in one query; null outside a demo. */
export async function demoMother(family: string | null) {
  if (!family) return null;
  const { data } = await supabaseAdmin().from("profiles").select("id, mothers(birth_date)").eq("demo_family", family).eq("role", "mother").maybeSingle();
  if (!data) return null;
  const m = data.mothers as unknown as { birth_date: string | null } | { birth_date: string | null }[] | null;
  const born = Array.isArray(m) ? Boolean(m[0]?.birth_date) : Boolean(m?.birth_date);
  return { id: data.id as string, born };
}
