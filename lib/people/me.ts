import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import type { Role } from "./signup";

// The signed-in person and their profile, or off to sign in. Cached per request: the layout and the page share it.
export const requireMe = cache(async () => {
  const db = await supabaseServer();
  const { data } = await db.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) redirect("/login");
  const { data: profile } = await db.from("profiles").select("id, role, name, demo_family").eq("id", id).single();
  if (!profile) redirect("/signup");
  return { db, me: profile as { id: string; role: Role; name: string; demo_family: string | null } };
});
