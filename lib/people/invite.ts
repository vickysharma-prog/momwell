import { supabaseServer } from "@/lib/supabase/server";
import type { Scope } from "./access";
import type { Role } from "./signup";

export type InvitePreview = { from_name: string; from_role: Role; kind: "circle" | "care_team"; relation: string; partner: boolean; sees: Scope[]; usable: boolean };

export async function previewInvite(token: string): Promise<InvitePreview | null> {
  if (!/^[0-9a-f-]{36}$/.test(token)) return null;
  const db = await supabaseServer();
  const { data } = await db.rpc("invite_preview", { t: token });
  return (data as InvitePreview[] | null)?.[0] ?? null;
}
