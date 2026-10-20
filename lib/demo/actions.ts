"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/people/me";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createDemoFamily, demoMother, hashIp, signInToken, underLimit } from "./create";
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
  if (!me.demo_family || !(role in MEMBER)) redirect("/home");
  await signInAs(me.demo_family, MEMBER[role]);
  redirect("/home?tour=1");
}

// Move the demo family's story on to six weeks after the birth, or back to 27 weeks pregnant. Only her own family.
export async function setDemoBorn(born: boolean) {
  const { me } = await requireMe();
  const mom = await demoMother(me.demo_family);
  if (!mom) redirect("/home");
  const birth = born ? new Date(Date.now() - 42 * 86_400_000).toISOString().slice(0, 10) : null;
  await supabaseAdmin().from("mothers").update({ birth_date: birth, updated_at: new Date().toISOString() }).eq("id", mom.id);
  revalidatePath("/", "layout");
  redirect(born && me.role === "mother" ? "/baby" : "/home");
}
