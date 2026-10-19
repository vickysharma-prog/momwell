"use client";

import { useActionState } from "react";
import { submitCheckIn } from "@/lib/checkin/actions";
import { ResultView } from "./ResultView";

type SignOption = { id: string; label: string; detail: string };

// Tap anything that's true today; readings are optional. The list is the check-in, so nothing depends on a model.
export function CheckInForm({ signs }: { signs: SignOption[] }) {
  const [state, action, pending] = useActionState(submitCheckIn, undefined);
  if (state?.result)
    return (
      <div className="flex flex-col gap-4">
        {state.error && <p role="alert" className="error">{state.error}</p>}
        <ResultView result={state.result} />
      </div>
    );
  return (
    <form action={action} className="grid items-start gap-6 pb-20 md:pb-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <fieldset className="grid gap-3 md:grid-cols-2">
        <legend className="mb-3 text-2xl">Is any of this happening?</legend>
        {signs.map((s) => (
          <label key={s.id} className="card flex cursor-pointer gap-4 p-4 has-[:checked]:border-[var(--alarm)]">
            <input type="checkbox" name="signs" value={s.id} className="mt-1 size-6 shrink-0 accent-[var(--alarm)]" />
            <span>
              <span className="block text-lg font-medium">{s.label}</span>
              <span className="muted text-sm">{s.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-6 lg:sticky lg:top-8">
      <fieldset className="card flex flex-col gap-3">
        <legend className="sr-only">Readings</legend>
        <p className="text-lg font-medium">Blood pressure, if you took it</p>
        <div className="flex items-center gap-2">
          <input className="field" name="systolic" inputMode="numeric" pattern="[0-9]*" placeholder="Top" aria-label="Top number (systolic)" />
          <span className="muted text-2xl">/</span>
          <input className="field" name="diastolic" inputMode="numeric" pattern="[0-9]*" placeholder="Bottom" aria-label="Bottom number (diastolic)" />
        </div>
        <p className="mt-2 text-lg font-medium">Temperature, if you took it</p>
        <div className="flex items-center gap-2">
          <input className="field" name="temp" inputMode="decimal" placeholder="98.6" aria-label="Temperature" />
          <select name="temp_unit" className="field w-28" defaultValue="F" aria-label="Unit">
            <option value="F">°F</option>
            <option value="C">°C</option>
          </select>
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-lg font-medium">Anything else on your mind?</span>
        <textarea name="note" className="field min-h-28" maxLength={2000} placeholder="How you slept, how you feel, a question for your next visit…" />
      </label>

      {/* Always within reach: held above the tab bar on a phone, under the readings on a larger screen. */}
      <div className="fixed inset-x-5 bottom-[6.5rem] z-20 flex flex-col gap-3 md:static">
        {state?.error && <p role="alert" className="error rounded-2xl bg-paper-raised p-3">{state.error}</p>}
        <button className="btn shadow-[0_16px_40px_-16px_var(--brand)]" disabled={pending}>
          {pending ? "Checking…" : "Done"}
        </button>
      </div>
      </div>
    </form>
  );
}
