import Link from "next/link";
import { ACTION, NOTE_UNREAD, type Result } from "@/lib/safety/engine";
import { CRISIS_LINES } from "@/lib/safety/sources";

// What she sees after a check-in. A warning sign gets a calm, distinct screen with one clear thing to do.
export function ResultView({ result }: { result: Pick<Result, "level" | "reasons" | "crisis" | "noteUnread"> }) {
  const alarm = result.level === "urgent" || result.level === "call_doctor";
  return (
    <section className={`flex flex-col gap-5 rounded-3xl p-6 ${alarm ? "bg-[var(--alarm-soft)]" : "card"}`} aria-live="assertive">
      <h2 className="text-3xl font-semibold leading-tight">{alarm ? ACTION[result.level] : result.level === "check" ? "Let’s check that again" : "Thank you for checking in"}</h2>
      {alarm && (
        <a className="btn bg-[var(--alarm)]" href="tel:911">
          Call 911
        </a>
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
      {result.level === "none" && <p className="muted text-lg">{result.noteUnread ? NOTE_UNREAD : ACTION.none}</p>}
      {result.level === "check" && <p className="muted text-lg">{ACTION.check}</p>}
      {(result.level === "check" || result.noteUnread) && (
        <Link className="btn-quiet" href="/check-in">
          Back to the list
        </Link>
      )}
    </section>
  );
}
