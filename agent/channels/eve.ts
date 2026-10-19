import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { localDev, type AuthFn } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// The browser reaches the agent on the same origin, carrying the Supabase session cookies the app set at sign-in.
// The session is checked with Supabase; the signed-in person is the principal every tool works for.
const momwellSession: AuthFn<Request> = async (request) => {
  const db = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => parseCookieHeader(request.headers.get("cookie") ?? "").map((c) => ({ name: c.name, value: c.value ?? "" })), setAll() {} },
  });
  const { data } = await db.auth.getClaims();
  const id = data?.claims.sub;
  return id ? { attributes: {}, authenticator: "momwell-session", principalId: id, principalType: "user" as const } : null;
};

// Local development only (eve dev): evals may replace tools with stubs.
const local = localDev();
const localWithStubs: AuthFn<Request> = async (request) => {
  const caller = await local(request);
  return caller ? { ...caller, allowToolStubs: true } : null;
};

export default eveChannel({ auth: [momwellSession, localWithStubs] });
