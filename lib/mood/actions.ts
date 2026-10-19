"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordCheckIn } from "@/lib/checkin/record";
import { requireMe } from "@/lib/people/me";
import { needsFull, scoreMood, validAnswers, type MoodLevel } from "@/lib/safety/mood";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type MoodState = { error?: string; level?: MoodLevel } | undefined;

// The browser sends only her answers; the rules score them here. A thought of harm becomes a check-in with the
// harm_thoughts sign, so it alerts like every warning sign and she lands on the crisis screen.
export async function saveMood(_: MoodState, form: FormData): Promise<MoodState> {
  const { me } = await requireMe();
  if (me.role !== "mother") return { error: "The mood check is for moms." };
  const answers = [...form.keys()].filter((k) => /^q\d$/.test(k)).sort().map((k) => Number(form.get(k)));
  if (!validAnswers(answers) || needsFull(answers)) return { error: "Please answer every question." };
  const result = scoreMood(answers);
  const harm = result.crisis ? await recordCheckIn(me.id, { signs: ["harm_thoughts"] }, "mood") : null;
  const { error } = await supabaseAdmin()
    .from("moods")
    .insert({ mother_id: me.id, kind: result.kind, answers, score: result.score, level: result.level, engine_version: result.version, checkin_id: harm?.id ?? null });
  revalidatePath("/", "layout");
  if (harm?.id) redirect(`/check-in/${harm.id}`);
  if (error) return { level: result.level, error: "We couldn't save this, but here is what your answers suggest." };
  return { level: result.level };
}
