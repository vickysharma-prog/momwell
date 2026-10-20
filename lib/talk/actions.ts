"use server";

import { recordCheckIn, type Recorded } from "@/lib/checkin/record";
import { requireMe } from "@/lib/people/me";
import type { Reading } from "@/lib/safety/engine";
import { foodPicks, musicPicks, showPicks, type Picks } from "@/lib/qloo/picks";
import { SIGN_IDS, type SignId } from "@/lib/safety/signs";
import type { Taste } from "@/lib/taste/taste";
import type { Want } from "./router";

// She confirmed what the word scan found: the same save as every check-in, so the rules, alerts, the 911 tier and
// "How this was decided" all apply. Her words are not stored as a note: she confirmed each sign instead.
export async function confirmTalk(signs: SignId[], reading: Reading): Promise<Recorded | { error: string }> {
  const { me } = await requireMe();
  if (me.role !== "mother") return { error: "Check-ins are for moms." };
  if (!signs.every((s) => SIGN_IDS.includes(s))) return { error: "Something didn't come through. Please use the check-in list." };
  const bp = reading.bp && Number.isInteger(reading.bp.systolic) && Number.isInteger(reading.bp.diastolic) ? reading.bp : undefined;
  const temp = reading.temp && Number.isFinite(reading.temp.value) && (reading.temp.unit === "F" || reading.temp.unit === "C") ? reading.temp : undefined;
  const saved = await recordCheckIn(me.id, { signs, bp, temp }, "words");
  // No page refresh: it would rebuild Talk and wipe her conversation. Her other pages load fresh when she opens them.
  return saved;
}

// Shows, food or music she asked for: the companion's own Qloo tools, called straight away (cached, so instant).
export async function talkPicks(what: Want): Promise<Picks> {
  const { db, me } = await requireMe();
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", me.id).maybeSingle();
  const taste = data as Taste | null;
  // If Qloo is slow or down, say so kindly instead of leaving her waiting.
  try {
    return await (what === "food" ? foodPicks(taste) : what === "music" ? musicPicks(taste) : showPicks(taste));
  } catch {
    return { picks: [], next: "Qloo is slow right now. Your For you page has your picks." };
  }
}
