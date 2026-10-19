import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The signed-in person's client for Server Components, Server Functions and Route Handlers. Row-level security
// applies: it reads only what this person may see.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(toSet) {
        // A Server Component can't set cookies; the proxy refreshes the session instead.
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {}
      },
    },
  });
}
