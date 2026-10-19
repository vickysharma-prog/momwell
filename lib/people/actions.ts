"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultSees, SCOPES } from "./access";
import { requireMe } from "./me";

const inviteInput = z.object({
  // A clinician's form has no kind: their invites are always for a patient.
  kind: z.enum(["circle", "care_team"]).default("care_team"),
  relation: z.string().trim().max(40).default(""),
  partner: z.literal("on").optional(),
});

// Row-level security decides who may invite whom; this only fills in the starting scopes.
export async function createInvite(form: FormData) {
  const { db, me } = await requireMe();
  const input = inviteInput.parse(Object.fromEntries(form));
  const kind = me.role === "care_team" ? "care_team" : input.kind;
  const partner = kind === "circle" && input.partner === "on";
  const link = kind === "circle" ? ({ kind, partner } as const) : ({ kind } as const);
  const { error } = await db.from("invites").insert({ from_id: me.id, kind, relation: input.relation, partner, sees: defaultSees(link) });
  if (error) throw new Error("Couldn't create the invite");
  revalidatePath("/", "layout");
}

export async function cancelInvite(token: string) {
  const { db } = await requireMe();
  await db.from("invites").delete().eq("token", token);
  revalidatePath("/", "layout");
}

export async function acceptInvite(token: string) {
  const { db } = await requireMe();
  const { error } = await db.rpc("accept_invite", { t: token });
  if (error) redirect(`/join/${token}?error=${encodeURIComponent(error.message)}`);
  redirect("/home");
}

// Either side can end a link; the policy allows only the two people on it.
export async function removeLink(motherId: string, personId: string) {
  const { db } = await requireMe();
  await db.from("links").delete().eq("mother_id", motherId).eq("person_id", personId);
  revalidatePath("/", "layout");
}

export async function setSees(personId: string, form: FormData) {
  const { db, me } = await requireMe();
  const sees = SCOPES.filter((s) => form.get(s) === "on");
  await db.from("links").update({ sees }).eq("mother_id", me.id).eq("person_id", personId);
  revalidatePath("/", "layout");
}
