"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAsk } from "@/lib/help/actions";
import { ASK_KINDS } from "@/lib/help/asks";

// One tap for what she needs, an optional note and day, and it goes to the people she shares ways to help with.
export function AskForm() {
  const [state, action, pending] = useActionState(createAsk, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action} className="card flex flex-col gap-4">
      <h2 className="text-2xl">What would help today?</h2>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">What you need</legend>
        {Object.entries(ASK_KINDS).map(([k, v], i) => (
          <label key={k} className="btn-quiet min-h-11 cursor-pointer gap-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand">
            <input type="radio" name="kind" value={k} defaultChecked={i === 0} className="sr-only" />
            {v.label}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input name="note" maxLength={200} className="field" placeholder="A note (Thai would be lovely, 7pm)" aria-label="A note for your people" />
        <input name="needed_on" type="date" className="field sm:w-48" aria-label="Which day" />
      </div>
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="font-medium text-brand">Sent to your people.</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Sending…" : "Ask my people"}
      </button>
    </form>
  );
}
