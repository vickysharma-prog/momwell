"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Speak } from "@/components/Speak";
import { greetingFor, greetingLine } from "@/lib/voice/greeting";

const noop = () => () => {};

// The first thing she sees when the app opens: Momwell says hello by name and asks how she is, and her answer is one
// tap away.
export function Greeting({ name }: { name: string }) {
  const hour = useSyncExternalStore(noop, () => new Date().getHours(), () => null);
  return (
    <section className="guide flex flex-col gap-4 rounded-3xl bg-brand-soft/70 p-5 sm:p-6" aria-label="From Momwell">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <span className="guide-dot relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-signature text-xl text-on-brand" aria-hidden="true">
          m
        </span>
        <p className="min-w-[12rem] flex-1 font-display text-xl leading-snug sm:text-2xl">{greetingFor(name, hour)}</p>
        {/* Said aloud once a day, in Momwell's recorded voice; known only once the browser knows her hour. */}
        {hour !== null && <Speak line={greetingLine(name, hour)} once={`${greetingLine(name, hour)}-${new Date().toDateString()}`} />}
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
