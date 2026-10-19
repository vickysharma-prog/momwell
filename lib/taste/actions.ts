"use server";

import { revalidatePath } from "next/cache";
import { search } from "@/lib/qloo/api";
import { requireMe } from "@/lib/people/me";
import { KINDS, readTaste, type Kind, type Liked } from "./taste";

// Search Qloo for something she loves. Signed-in only, so nobody can spend the quota from outside the app.
export async function searchTaste(query: string, kind: Kind): Promise<Liked[]> {
  await requireMe();
  const q = query.trim();
  if (q.length < 2 || q.length > 60 || !KINDS.includes(kind)) return [];
  const found = await search(q, 6, `urn:entity:${kind}`);
  return found.map((e) => ({ id: e.entity_id, name: e.name, kind }));
}

export type TasteState = { error?: string; saved?: boolean } | undefined;

export async function saveTaste(_: TasteState, form: FormData): Promise<TasteState> {
  const { db, me } = await requireMe();
  if (me.role !== "mother") return { error: "This is for moms." };
  const t = readTaste(form);
  if (!t.ok) return { error: t.error };
  const { error } = await db.from("tastes").upsert({ mother_id: me.id, ...t.value, updated_at: new Date().toISOString() });
  if (error) return { error: "We couldn’t save that. Please try again." };
  revalidatePath("/", "layout");
  return { saved: true };
}
