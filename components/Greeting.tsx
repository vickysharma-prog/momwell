"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { greetingFor } from "@/lib/voice/greeting";

const noop = () => () => {};

// The first thing she sees when the app opens: Momwell says hello by name and asks how she is, and her answer is one
// tap away.
export function Greeting({ name }: { name: string }) {
  const hour = useSyncExternalStore(noop, () => new Date().getHours(), () => null);
  return (
    <section className="guide flex flex-col gap-4 rounded-3xl bg-brand-soft/70 p-5 sm:p-6" aria-label="From Momwell">
      <div className="flex items-start gap-4">
        <span className="guide-dot relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-signature text-xl text-on-brand" aria-hidden="true">
          m
        </span>
        <p className="flex-1 font-display text-2xl leading-snug">{greetingFor(name, hour)}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:pl-15">
        <Link href="/check-in" className="btn-quiet min-h-11 bg-paper-raised">
          I’m doing well
        </Link>
        <Link href="/talk" className="btn-quiet min-h-11 bg-paper-raised">
          Not so great
        </Link>
        <Link href="/check-in" className="btn-quiet min-h-11 border-[var(--alarm)] bg-paper-raised text-[var(--alarm)]">
          Something feels wrong
        </Link>
      </div>
    </section>
  );
}
