"use client";

import { useActionState } from "react";
import { startDemo } from "@/lib/demo/actions";

export function StartDemo() {
  const [state, action, pending] = useActionState(startDemo, undefined);
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <button className="btn w-auto px-10" disabled={pending} aria-busy={pending}>
        {pending ? "Setting up Maya’s family…" : "Open Momwell as Maya"}
      </button>
      {state?.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
    </form>
  );
}
