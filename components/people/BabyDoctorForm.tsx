"use client";

import { useActionState } from "react";
import { saveBabyDoctor } from "@/lib/people/actions";

// Her baby's doctor, so a warning about the baby calls them in one tap.
export function BabyDoctorForm({ name, phone }: { name: string | null; phone: string | null }) {
  const [state, action, pending] = useActionState(saveBabyDoctor, undefined);
  return (
    <form action={action} className="card flex flex-col gap-3">
      <h2 className="text-2xl">Your baby’s doctor</h2>
      <p className="text-ink-soft">So a warning about your baby calls the right doctor in one tap.</p>
      <input name="name" defaultValue={name ?? ""} placeholder="Dr Patel" maxLength={60} className="field" aria-label="Your baby’s doctor’s name" />
      <input name="phone" type="tel" inputMode="tel" defaultValue={phone ?? ""} placeholder="(512) 555-0163" className="field" aria-label="Your baby’s doctor’s phone number" />
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {state?.ok && <p role="status" className="font-medium text-brand">Saved.</p>}
      <button className="btn-quiet self-start" disabled={pending} aria-busy={pending} data-sound="done">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
