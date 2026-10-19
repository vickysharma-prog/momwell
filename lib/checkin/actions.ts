"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/people/me";
import { readCheckIn } from "@/lib/safety/checkin-input";
import type { Result } from "@/lib/safety/engine";
import { BABY_SIGN_IDS, type BabySignId } from "@/lib/safety/baby";
import { stageFrom } from "@/lib/safety/stage";
import { recordBabyCheckIn, recordCheckIn } from "./record";

export type CheckInState = { error?: string; result?: Result } | undefined;

// The rules engine decides on the server; the browser only sends what she tapped and typed.
export async function submitCheckIn(_: CheckInState, form: FormData): Promise<CheckInState> {
  const { me } = await requireMe();
  if (me.role !== "mother") return { error: "Check-ins are for moms." };
  const input = readCheckIn(form);
  if (!input.ok) return { error: input.error };
  const saved = await recordCheckIn(me.id, input.value);
  // Saving failed: she still sees what to do. A warning sign is never lost to a database error.
  if (saved.problem === "not_saved") return { result: saved.result, error: "We couldn't save this check-in, so nobody else was told. Please follow the steps below." };
  if (saved.problem === "not_alerted") return { result: saved.result, error: "We couldn't alert your people. Please call them yourself after following the steps below." };
  revalidatePath("/", "layout");
  redirect(`/check-in/${saved.id}`);
}

export async function saveDates(form: FormData) {
  const { db, me } = await requireMe();
  const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(String(form.get(k))) ? String(form.get(k)) : null);
  await db.from("mothers").upsert({ id: me.id, due_date: date("due_date"), birth_date: date("birth_date"), updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
}

export async function markSeen(alertId: string) {
  const { db, me } = await requireMe();
  await db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: me.id }).eq("id", alertId).is("seen_at", null);
  revalidatePath("/", "layout");
}

// Her baby's check-in: the signs she tapped and a temperature if she took one, decided by the baby rules for the
// baby's age, which we work out here from her birth date.
export async function submitBabyCheckIn(_: CheckInState, form: FormData): Promise<CheckInState> {
  const { db, me } = await requireMe();
  if (me.role !== "mother") return { error: "Baby check-ins are for moms." };
  const { data: dates } = await db.from("mothers").select("due_date, birth_date").eq("id", me.id).maybeSingle();
  const stage = stageFrom(dates ?? {}, new Date());
  if (stage.kind !== "after_birth") return { error: "Add your baby’s birth date first, in today’s check-in." };
  const signs = form.getAll("signs").map(String);
  if (!signs.every((s) => (BABY_SIGN_IDS as string[]).includes(s))) return { error: "Something in the form didn’t come through. Please try again." };
  const raw = String(form.get("temp") ?? "").trim();
  const temp = raw ? { value: Number(raw), unit: form.get("temp_unit") === "C" ? ("C" as const) : ("F" as const) } : undefined;
  const saved = await recordBabyCheckIn(me.id, { signs: signs as BabySignId[], temp }, stage.days);
  if (saved.problem === "not_saved") return { result: saved.result, error: "We couldn't save this check-in, so nobody else was told. Please follow the steps below." };
  if (saved.problem === "not_alerted") return { result: saved.result, error: "We couldn't alert your people. Please call them yourself after following the steps below." };
  revalidatePath("/", "layout");
  redirect(`/check-in/${saved.id}`);
}
