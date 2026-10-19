"use client";

import { createBrowserClient } from "@supabase/ssr";

// The browser's client: sign-in and realtime alerts, under the same row-level security as the server.
export const supabaseBrowser = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
