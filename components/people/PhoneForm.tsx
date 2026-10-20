"use client";

import { useActionState } from "react";
import { savePhone } from "@/lib/people/actions";

// One number, so the people she shares with can be called in one tap from a warning screen.
export function PhoneForm({ phone, mother }: { phone: string | null; mother: boolean }) {
  const [state, action, pending] = useActionState(savePhone, undefined);
  return (
    <form action={action} className="card flex flex-col gap-3">
      <h2 className="text-2xl">Your phone</h2>
      <p className="text-ink-soft">{mother ? "So your people can call you back fast." : "So she can call you in one tap if she has a warning sign."}</p>
      <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={phone ?? ""} placeholder="(512) 555-0142" className="field" aria-label="Your phone number" />
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="font-medium text-brand">Saved.</p>}
      <button className="btn-quiet self-start" disabled={pending} aria-busy={pending} data-sound="done">
        {pending ? "Saving…" : "Save number"}
      </button>
    </form>
  );
}
