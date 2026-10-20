"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TZ_COOKIE } from "@/lib/time";

// Tells the server her time zone, so times and "today" are hers, not the server's. Refreshes once when it changes.
export function TimeZone() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = document.cookie.match(new RegExp(`(?:^|; )${TZ_COOKIE}=([^;]*)`))?.[1];
    if (!tz || decodeURIComponent(now ?? "") === tz) return;
    document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
