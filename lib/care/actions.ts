"use server";

import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/people/me";

// Mark every open alert for this patient seen, as this clinician. Row-level security allows it only for her care team.
export async function markAllSeen(motherId: string) {
  const { db, me } = await requireMe();
  if (me.role !== "care_team") return;
  await db.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: me.id }).eq("mother_id", motherId).is("seen_at", null);
  revalidatePath("/", "layout");
}
