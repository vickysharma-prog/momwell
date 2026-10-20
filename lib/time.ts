// Dates and times in her own time zone. The browser tells us its zone in a cookie; until it has, we use US Central,
// where the demo family lives. The server runs in UTC, so nothing here may use the server's own clock zone.
export const TZ_COOKIE = "tz";
export const DEFAULT_TZ = "America/Chicago";

export function validTz(tz: string | undefined | null): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date (YYYY-MM-DD) in that zone. */
export const dateIn = (tz: string, at: Date | string = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(at));

/** A date and time as she reads it on her clock. */
export const formatIn = (tz: string, at: Date | string, opts: Intl.DateTimeFormatOptions) => new Date(at).toLocaleString("en-US", { ...opts, timeZone: tz });

/** The calendar date n days from today in that zone (negative for the past). */
export const daysFrom = (tz: string, n: number) => dateIn(tz, new Date(Date.now() + n * 86_400_000));
