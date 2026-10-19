"use server";

import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/people/me";
import { readAsk } from "./asks";

const today = () => new Date().toISOString().slice(0, 10);

export type AskState = { error?: string; ok?: boolean } | undefined;

export async function createAsk(_: AskState, form: FormData): Promise<AskState> {
  const { db, me } = await requireMe();
  if (me.role !== "mother") return { error: "Asks are for moms." };
  const a = readAsk(form, today());
  if (!a.ok) return { error: a.error };
  const { error } = await db.from("asks").insert({ mother_id: me.id, ...a.value });
  if (error) return { error: "We couldn’t send that. Please try again." };
  revalidatePath("/", "layout");
  return { ok: true };
}

// Her circle takes an ask, lets go of it, or marks it done; row-level security keeps each to what they may do.
export async function takeAsk(id: string) {
  const { db, me } = await requireMe();
  await db.from("asks").update({ taken_by: me.id, taken_at: new Date().toISOString() }).eq("id", id).is("taken_by", null);
  revalidatePath("/", "layout");
}

export async function letGo(id: string) {
  const { db, me } = await requireMe();
  await db.from("asks").update({ taken_by: null, taken_at: null }).eq("id", id).eq("taken_by", me.id);
  revalidatePath("/", "layout");
}

export async function markDone(id: string) {
  const { db } = await requireMe();
  await db.from("asks").update({ done: true }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function removeAsk(id: string) {
  const { db } = await requireMe();
  await db.from("asks").delete().eq("id", id);
  revalidatePath("/", "layout");
}
