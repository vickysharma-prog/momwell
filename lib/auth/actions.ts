"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { signUpInput } from "@/lib/people/signup";

export type FormState = { error?: string } | undefined;

// Accounts are confirmed at sign-up, so she can start her first check-in straight away.
export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signUpInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { role, name, email, password, invite } = parsed.data;

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return { error: /already/i.test(error.message) ? "That email already has an account. Sign in instead." : "We couldn't create your account. Try again." };
  const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, role, name });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "We couldn't create your account. Try again." };
  }

  const db = await supabaseServer();
  await db.auth.signInWithPassword({ email, password });
  // Signing up from an invite is accepting it; if it can't be used, the invite page says why.
  if (invite && (await db.rpc("accept_invite", { t: invite })).error) redirect(`/join/${invite}`);
  redirect("/home");
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const db = await supabaseServer();
  const { error } = await db.auth.signInWithPassword({ email: String(form.get("email")).trim().toLowerCase(), password: String(form.get("password")) });
  if (error) return { error: "That email and password don't match." };
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/home");
}

export async function signOut() {
  const db = await supabaseServer();
  await db.auth.signOut();
  redirect("/");
}
