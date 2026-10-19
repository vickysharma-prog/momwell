"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/auth/actions";

// One form for sign-up and sign-in: the server action, the fields, and its error under them.
export function AuthForm({ action, submit, children }: { action: (s: FormState, f: FormData) => Promise<FormState>; submit: string; children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {children}
      {state?.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      <button className="btn mt-2" disabled={pending}>
        {pending ? "One moment…" : submit}
      </button>
    </form>
  );
}
