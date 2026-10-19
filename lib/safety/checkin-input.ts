import { z } from "zod";
import type { CheckIn } from "./engine.ts";
import { SIGN_IDS, type SignId } from "./signs.ts";

const num = z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().optional());

const form = z.object({
  signs: z.array(z.enum(SIGN_IDS as [SignId, ...SignId[]])).default([]),
  systolic: num,
  diastolic: num,
  temp: num,
  temp_unit: z.enum(["F", "C"]).default("F"),
  note: z.string().trim().max(2000).default(""),
});

export type CheckInForm = CheckIn & { note: string };

// The check-in form, read strictly. Half a blood pressure is an error to fix, not a reading to drop.
export function readCheckIn(data: FormData): { ok: true; value: CheckInForm } | { ok: false; error: string } {
  const parsed = form.safeParse({
    signs: data.getAll("signs"),
    systolic: data.get("systolic"),
    diastolic: data.get("diastolic"),
    temp: data.get("temp"),
    temp_unit: data.get("temp_unit") ?? undefined,
    note: data.get("note") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "Something in the form didn't come through. Please try again." };
  const { signs, systolic, diastolic, temp, temp_unit, note } = parsed.data;
  if ((systolic === undefined) !== (diastolic === undefined)) return { ok: false, error: "Enter both blood pressure numbers, the top and the bottom." };
  return {
    ok: true,
    value: {
      signs,
      note,
      ...(systolic !== undefined && diastolic !== undefined && { bp: { systolic, diastolic } }),
      ...(temp !== undefined && { temp: { value: temp, unit: temp_unit } }),
    },
  };
}
