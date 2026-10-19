"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/people/me";
import { readCheckIn } from "@/lib/safety/checkin-input";
import { evaluate, type Result } from "@/lib/safety/engine";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CheckInState = { error?: string; result?: Result } | undefined;

// The rules engine decides on the server; the browser only sends what she tapped and typed.
export async function submitCheckIn(_: CheckInState, form: FormData): Promise<CheckInState> {
  const { me } = await requireMe();
  if (me.role !== "mother") return { error: "Check-ins are for moms." };
  const input = readCheckIn(form);
  if (!input.ok) return { error: input.error };
  const result = evaluate(input.value);
  const { bp, temp, signs, note } = input.value;

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("checkins")
    .insert({
      mother_id: me.id,
      signs,
      note,
      systolic: bp?.systolic,
      diastolic: bp?.diastolic,
      temp_value: temp?.value,
      temp_unit: temp?.unit,
      level: result.level,
      reasons: result.reasons,
      engine_version: result.version,
    })
    .select("id")
    .single();
  // Saving failed: she still sees what to do. A warning sign is never lost to a database error.
  if (error) return { result, error: "We couldn't save this check-in, so nobody else was told. Please follow the steps below." };
  if (result.level === "urgent" || result.level === "call_doctor") {
    const alert = await admin.from("alerts").insert({ mother_id: me.id, checkin_id: data.id, level: result.level });
    if (alert.error) return { result, error: "We couldn't alert your people. Please call them yourself after following the steps below." };
  }
  revalidatePath("/home");
  redirect(`/check-in/${data.id}`);
}

export async function saveDates(form: FormData) {
  const { db, me } = await requireMe();
  const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(String(form.get(k))) ? String(form.get(k)) : null);
  await db.from("mothers").upsert({ id: me.id, due_date: date("due_date"), birth_date: date("birth_date"), updated_at: new Date().toISOString() });
  revalidatePath("/check-in");
}

export async function markSeen(alertId: string) {
  const { db, me } = await requireMe();
  await db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: me.id }).eq("id", alertId).is("seen_at", null);
  revalidatePath("/home");
}
