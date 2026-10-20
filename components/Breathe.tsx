"use client";

import { useEffect, useState } from "react";
import { BREATHE } from "@/lib/safety/next-steps";

// Breathe with me while you wait: the NHS exercise, in through the nose for five and out through the mouth for five,
// with a circle that grows and shrinks to follow. Tap again to stop.
export function Breathe() {
  const [on, setOn] = useState(false);
  const [tick, setTick] = useState(0);
  const cycle = BREATHE.inCount + BREATHE.outCount;
  const step = tick % cycle;
  const breathingIn = step < BREATHE.inCount;
  const count = breathingIn ? step + 1 : step - BREATHE.inCount + 1;

  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [on]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-paper-raised p-5 text-center">
      {on ? (
        <>
          <div className="relative flex size-40 items-center justify-center" aria-hidden="true">
            <span
              className="absolute inset-0 rounded-full bg-brand-soft transition-transform ease-in-out"
              style={{ transform: `scale(${breathingIn ? 0.55 + 0.45 * (count / BREATHE.inCount) : 1 - 0.45 * (count / BREATHE.outCount)})`, transitionDuration: "1000ms" }}
            />
            <span className="relative font-display text-4xl text-brand">{count}</span>
          </div>
          <p className="text-xl font-medium" aria-live="polite">
            {breathingIn ? "Breathe in through your nose…" : "And out through your mouth…"}
          </p>
          <button type="button" onClick={() => setOn(false)} className="btn-quiet">
            Stop
          </button>
        </>
      ) : (
        <>
          <p className="text-lg">While you wait for a call back, breathe slowly with me.</p>
          <button
            type="button"
            onClick={() => {
              setTick(0);
              setOn(true);
            }}
            className="btn w-auto px-8"
          >
            Breathe with me
          </button>
        </>
      )}
      <a className="text-xs text-ink-soft underline" href={BREATHE.source.url} target="_blank" rel="noreferrer">
        {BREATHE.source.title}
      </a>
    </div>
  );
}
