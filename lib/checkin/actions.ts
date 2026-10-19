"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/people/me";
import { readCheckIn } from "@/lib/safety/checkin-input";
import type { Result } from "@/lib/safety/engine";
import { recordCheckIn } from "./record";

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
