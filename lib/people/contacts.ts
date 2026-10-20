// Who a warning screen can call in one tap: for her, the people she's linked with who gave a number (her doctor
// first, then her partner, then the rest); for someone in her circle or care team, her. Read under row-level
// security, so a viewer only ever gets numbers they could already see.
import type { SupabaseClient } from "@supabase/supabase-js";

export type Contact = { name: string; label: string; phone: string; kind: "care_team" | "circle" | "mother" };

type Row = { kind: "care_team" | "circle"; relation: string; partner: boolean; person: { name: string; phone: string | null } | null };

const RANK = (c: Contact) => (c.kind === "care_team" ? 0 : c.label === "partner" ? 1 : 2);

export async function callList(db: SupabaseClient, motherId: string, viewerId: string): Promise<Contact[]> {
  if (viewerId !== motherId) {
    const { data } = await db.from("profiles").select("name, phone").eq("id", motherId).maybeSingle();
    return data?.phone ? [{ name: data.name, label: "mom", phone: data.phone, kind: "mother" }] : [];
  }
  const { data } = await db.from("links").select("kind, relation, partner, person:profiles!links_person_id_fkey(name, phone)").eq("mother_id", motherId);
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.person?.phone)
    .map((r) => ({ name: r.person!.name, label: r.partner ? "partner" : r.relation || (r.kind === "care_team" ? "care team" : "circle"), phone: r.person!.phone!, kind: r.kind }))
    .sort((a, b) => RANK(a) - RANK(b));
}
