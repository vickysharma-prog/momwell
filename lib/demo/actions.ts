"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/people/me";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createDemoFamily, hashIp, signInToken, underLimit } from "./create";
import type { Member } from "./family";

export type DemoState = { error?: string } | undefined;

async function signInAs(family: string, member: Member) {
  const db = await supabaseServer();
  const { error } = await db.auth.verifyOtp({ token_hash: await signInToken(family, member), type: "magiclink" });
  if (error) throw error;
}

export async function startDemo(): Promise<DemoState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const ipHash = hashIp(ip);
  if (!(await underLimit(ipHash))) return { error: "You’ve opened several demos this hour. Please use the one you have, or try again later." };
  try {
    const { family } = await createDemoFamily(ipHash);
    await signInAs(family, "mom");
  } catch {
    return { error: "We couldn’t set up the demo just now. Please try again." };
  }
  redirect("/home?tour=1");
}

const MEMBER = { mother: "mom", circle: "partner", care_team: "doctor" } as const;

// Switch to another member of the same demo family. Only inside one's own family: the family is read on the server.
export async function switchDemo(role: keyof typeof MEMBER) {
  const { me } = await requireMe();
  const { data } = await supabaseAdmin().from("profiles").select("demo_family").eq("id", me.id).single();
  if (!data?.demo_family || !(role in MEMBER)) redirect("/home");
  await signInAs(data.demo_family, MEMBER[role]);
  redirect("/home?tour=1");
}
