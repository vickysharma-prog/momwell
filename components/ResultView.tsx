import Link from "next/link";
import type { Contact } from "@/lib/people/contacts";
import { BABY_ACTION } from "@/lib/safety/baby";
import { ACTION, NOTE_UNREAD, type Result } from "@/lib/safety/engine";
import { CRISIS_LINES } from "@/lib/safety/sources";
import { canBreathe, nextSteps, NEXT_STEPS_SOURCE } from "@/lib/safety/next-steps";
import { needs911, TIER_SOURCE } from "@/lib/safety/tier";
import { babyLineFor, lineFor } from "@/lib/voice/lines";
import { Breathe } from "./Breathe";
import { Speak } from "./Speak";

// What she sees after a check-in. A warning sign gets a calm, distinct screen with one clear thing to do: 911 only
// for the signs AWHONN says call 911 for, otherwise her doctor now; her people one tap away; and the words to say.
export function ResultView({
  result,
  voice = true,
  baby = false,
  contacts = [],
  script,
  told = [],
}: {
  result: Pick<Result, "level" | "reasons" | "crisis" | "noteUnread">;
  voice?: boolean;
  baby?: boolean;
  contacts?: Contact[];
  script?: string;
  told?: string[];
}) {
  const alarm = result.level === "urgent" || result.level === "call_doctor";
  const emergency = alarm && (baby ? result.level === "urgent" : needs911(result.reasons));
  // Her doctor for her, the baby's doctor for the baby; her people either way.
  const doctor = contacts.find((c) => c.kind === (baby ? "baby_doctor" : "care_team"));
  const others = contacts.filter((c) => c !== doctor && c.kind !== "baby_doctor" && !(baby && c.kind === "care_team"));
  const heading = baby ? BABY_ACTION[result.level] : emergency ? "Call 911 now." : alarm ? "Call your doctor now." : result.level === "check" ? "Let’s check that again" : "Thank you for checking in";

  return (
    <section className={`settle flex flex-col gap-5 rounded-3xl p-6 ${alarm ? "bg-[var(--alarm-soft)]" : "card"}`} aria-live="assertive">
      <h2 className="text-3xl font-semibold leading-tight">{heading}</h2>
      {voice && <Speak line={baby ? babyLineFor(result.level) : lineFor(result, emergency)} />}

      {emergency && (
        <a className="btn calm-glow bg-[var(--alarm)]" href="tel:911">
          Call 911
        </a>
      )}
      {alarm && !emergency && doctor && (
        <a className="btn calm-glow bg-[var(--alarm)]" href={`tel:${doctor.phone}`}>
          Call {doctor.name}
        </a>
      )}
      {alarm && others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((c) => (
            <a key={c.phone} className="btn-quiet bg-paper-raised" href={`tel:${c.phone}`}>
              Call {c.name} <span className="ml-1 text-ink-soft">· {c.label}</span>
            </a>
          ))}
          {emergency && doctor && (
            <a className="btn-quiet bg-paper-raised" href={`tel:${doctor.phone}`}>
              Call {doctor.name} <span className="ml-1 text-ink-soft">· {doctor.label}</span>
            </a>
          )}
        </div>
      )}
      {alarm && told.length > 0 && (
        <p className="font-medium">
          We let {told.length === 1 ? told[0] : `${told.slice(0, -1).join(", ")} and ${told.at(-1)}`} know.
        </p>
      )}
      {alarm && baby && !emergency && (
        <p className="text-lg">
          If it feels like an emergency,{" "}
          <a className="font-semibold underline underline-offset-4" href="tel:911">
            call 911
          </a>
          .
        </p>
      )}
      {alarm && !emergency && !baby && (
        <p className="text-lg">
          {doctor ? "" : "Call your doctor’s office now. "}Can’t reach them? Call 911 or go to the nearest emergency room.{" "}
          <a className="font-semibold underline underline-offset-4" href="tel:911">
            Call 911
          </a>
        </p>
      )}
      {alarm && script && (
        <div className="rounded-2xl bg-paper-raised p-4">
          <p className="text-sm font-semibold text-ink-soft">Tell them</p>
          <p className="text-lg">“{script}”</p>
        </div>
      )}

      {result.crisis && (
        <div className="flex flex-col gap-3">
          <p className="text-lg">You don’t have to carry this alone. If you might act on these thoughts, call 911 now.</p>
          {CRISIS_LINES.map((line) => (
            <div key={line.name} className="card flex flex-col gap-2">
              <p className="font-medium">{line.name}</p>
              <p className="muted text-sm">{line.note}</p>
              <div className="flex gap-2">
                <a className="btn" href={`tel:${line.call}`}>{line.label}</a>
                <a className="btn-quiet" href={`sms:${line.text}`}>Text</a>
              </div>
            </div>
          ))}
        </div>
      )}
      {result.reasons.length > 0 && (
        <ul className="flex flex-col gap-3">
          {result.reasons.map((r) => (
            <li key={r.id}>
              <p className="text-lg">{r.text}</p>
              <a className="muted text-sm underline" href={r.source.url} target="_blank" rel="noreferrer">
                {r.source.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      {alarm && !baby && (
        <div className="flex flex-col gap-3 rounded-2xl bg-paper-raised p-4">
          <p className="font-semibold">While you get care</p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            {nextSteps({ companion: others.find((c) => c.label === "partner")?.name }).map((s) => (
              <li key={s.text}>{s.text}</li>
            ))}
          </ol>
          <a className="muted text-sm underline" href={NEXT_STEPS_SOURCE.url} target="_blank" rel="noreferrer">
            {NEXT_STEPS_SOURCE.title}
          </a>
        </div>
      )}
      {alarm && !emergency && !baby && canBreathe(result.reasons) && <Breathe />}
      {result.level === "none" && <p className="text-lg">You know your body best. If something feels wrong, even if it isn’t on the list, call your doctor.</p>}
      {alarm && !baby && (
        <a className="muted text-sm underline" href={TIER_SOURCE.url} target="_blank" rel="noreferrer">
          When to call 911 and when to call your doctor: {TIER_SOURCE.title}
        </a>
      )}
      {result.level === "none" && <p className="muted text-lg">{result.noteUnread ? NOTE_UNREAD : ACTION.none}</p>}
      {result.level === "check" && <p className="muted text-lg">{ACTION.check}</p>}
      {(result.level === "check" || (result.level === "none" && result.noteUnread)) && (
        <Link className="btn-quiet" href="/check-in">
          Back to the list
        </Link>
      )}
    </section>
  );
}
