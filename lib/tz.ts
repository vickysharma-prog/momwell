import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_TZ, TZ_COOKIE, validTz } from "./time";

/** Her time zone, from the cookie her browser set (US Central until it has). */
export const myTz = cache(async () => {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  return validTz(tz) ? tz : DEFAULT_TZ;
});
