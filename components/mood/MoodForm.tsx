"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ResultView } from "@/components/ResultView";
import { saveMood } from "@/lib/mood/actions";
import { evaluate } from "@/lib/safety/engine";
import { ANSWERS, MOOD_SAYS, needsFull, QUESTIONS } from "@/lib/safety/mood";
import { CRISIS_LINES } from "@/lib/safety/sources";

// Two questions; all nine only when the first two point that way. Every answer stays on screen until she sends it.
export function MoodForm() {
  const [state, action, pending] = useActionState(saveMood, undefined);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null]);
  const full = answers.length === QUESTIONS.length;
  const ready = answers.every((a) => a !== null);
  const goesOn = !full && ready && needsFull(answers as number[]);

  if (state?.level === "urgent") return <ResultView result={evaluate({ signs: ["harm_thoughts"] })} voice={false} />;
  if (state?.level)
    return (
      <section className="settle card flex flex-col gap-4" aria-live="polite">
        <h2 className="text-3xl leading-tight">{MOOD_SAYS[state.level]}</h2>
        {state.error && <p className="error">{state.error}</p>}
        {state.level === "call_doctor" && (
          <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4">
            <p className="font-medium">{CRISIS_LINES[1].name}</p>
            <p className="text-sm text-ink-soft">{CRISIS_LINES[1].note} Someone to talk to while you wait for your appointment.</p>
            <a className="btn-quiet w-fit" href={`tel:${CRISIS_LINES[1].call}`}>
              {CRISIS_LINES[1].label}
            </a>
          </div>
        )}
        <Link href="/home" className="btn w-fit px-8">
          Back to today
        </Link>
      </section>
    );

  return (
    <form action={action} className="flex flex-col gap-5">
      <p className="text-lg text-ink-soft">Over the last two weeks, how often have you been bothered by…</p>
      {answers.map((value, i) => (
        <fieldset key={i} className="card flex flex-col gap-3">
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="text-lg font-medium">{QUESTIONS[i]}</p>
          {i === 8 && <p className="text-sm text-ink-soft">If you answer anything but “Not at all”, your care team and anyone you share urgent alerts with will be told you need support. Not your answers.</p>}
          <div className="grid gap-2 sm:grid-cols-4">
            {ANSWERS.map((label, v) => (
              <label key={v} className="btn-quiet min-h-12 cursor-pointer text-center has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand">
                <input type="radio" name={`q${i}`} value={v} required checked={value === v} onChange={() => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {state?.error && <p role="alert" className="error">{state.error}</p>}
      {goesOn ? (
        <button type="button" className="btn" onClick={() => setAnswers((a) => [...a, ...Array(QUESTIONS.length - 2).fill(null)])}>
          A few more questions
        </button>
      ) : (
        <button className="btn" disabled={!ready || pending}>
          {pending ? "Saving…" : "Done"}
        </button>
      )}
    </form>
  );
}
