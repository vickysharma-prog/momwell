// Saving a check-in: the one path for the tap form and for the agent. The engine decides the level here, on the
// server; an alert goes to her people when it is urgent or a call to her doctor.
import { evaluate, type CheckIn, type Result } from "../safety/engine.ts";
import { supabaseAdmin } from "../supabase/admin.ts";

export type Recorded = { result: Result; id: string | null; problem?: "not_saved" | "not_alerted" };

export async function recordCheckIn(motherId: string, input: CheckIn & { note?: string }, source: "tap" | "talk" = "tap"): Promise<Recorded> {
  const result = evaluate(input);
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("checkins")
    .insert({
      mother_id: motherId,
      source,
      signs: input.signs,
      note: input.note ?? "",
      systolic: input.bp?.systolic,
      diastolic: input.bp?.diastolic,
      temp_value: input.temp?.value,
      temp_unit: input.temp?.unit,
      level: result.level,
      reasons: result.reasons,
      engine_version: result.version,
    })
    .select("id")
    .single();
  // A warning sign is never lost to a database error: the caller still shows her what to do.
  if (error) return { result, id: null, problem: "not_saved" };
  if (result.level === "urgent" || result.level === "call_doctor") {
    const alert = await admin.from("alerts").insert({ mother_id: motherId, checkin_id: data.id, level: result.level });
    if (alert.error) return { result, id: data.id, problem: "not_alerted" };
  }
  return { result, id: data.id };
}
