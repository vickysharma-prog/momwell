"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { greetingFor } from "@/lib/voice/greeting";
import { say } from "@/lib/voice/say";

const KEY = "momwell-greeted";
const noop = () => () => {};

// The first thing she hears when the app opens each day: Momwell says hello by name and asks how she is, and her
// answer is one tap away.
export function Greeting({ name }: { name: string }) {
  const hour = useSyncExternalStore(noop, () => new Date().getHours(), () => null);
  const text = greetingFor(name, hour);

  useEffect(() => {
    const today = new Date().toDateString();
    try {
      if (localStorage.getItem(KEY) === today) return;
      localStorage.setItem(KEY, today);
    } catch {}
    const t = setTimeout(() => say(greetingFor(name, new Date().getHours()).replace("’", "'")), 500);
    return () => clearTimeout(t);
  }, [name]);

  return (
    <section className="guide flex flex-col gap-4 rounded-3xl bg-brand-soft/70 p-5 sm:p-6" aria-label="From Momwell">
      <div className="flex items-start gap-4">
        <span className="guide-dot relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-signature text-xl text-on-brand" aria-hidden="true">
          m
        </span>
        <p className="flex-1 font-display text-2xl leading-snug">{text}</p>
        <button type="button" onClick={() => say(text.replace("’", "'"))} data-sound="select" className="btn-quiet min-h-11 shrink-0 bg-paper-raised px-4 text-sm" aria-label="Hear this">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
          <span className="ml-2 hidden sm:inline">Hear this</span>
        </button>
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
