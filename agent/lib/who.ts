import { supabaseAdmin } from "../../lib/supabase/admin.ts";
import type { Role } from "../../lib/people/signup.ts";

type Ctx = { session: { auth: { current?: { principalId?: string; authenticator?: string } | null; initiator?: { principalId?: string } | null } } };

// The signed-in person this turn is for. eve checks the caller at the door but not who owns a session, so a turn
// from anyone but the person who started the session is refused here, before any tool touches her data.
export async function who(ctx: Ctx): Promise<{ id: string; role: Role; name: string }> {
  const current = ctx.session.auth.current;
  const owner = ctx.session.auth.initiator?.principalId;
  if (current?.authenticator !== "momwell-session" || !current.principalId || current.principalId !== owner) throw new Error("Please sign in again.");
  const { data } = await supabaseAdmin().from("profiles").select("id, role, name").eq("id", current.principalId).single();
  if (!data) throw new Error("Please sign in again.");
  return data as { id: string; role: Role; name: string };
}

export async function mother(ctx: Ctx) {
  const me = await who(ctx);
  if (me.role !== "mother") throw new Error("This is for moms.");
  return me;
}
