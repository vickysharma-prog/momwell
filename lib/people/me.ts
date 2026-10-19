import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Role } from "./signup";

// The signed-in person and their profile, or off to sign in.
export async function requireMe() {
  const db = await supabaseServer();
  const { data } = await db.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) redirect("/login");
  const { data: profile } = await db.from("profiles").select("id, role, name").eq("id", id).single();
  if (!profile) redirect("/signup");
  return { db, me: profile as { id: string; role: Role; name: string } };
}
