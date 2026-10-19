import Link from "next/link";
import { markSeen } from "@/lib/checkin/actions";
import type { Role } from "@/lib/people/signup";

export type Alert = { id: string; mother_id: string; checkin_id: string; level: "urgent" | "call_doctor"; created_at: string; seen_at: string | null; mother: { name: string }; seer: { name: string } | null; checkin: { subject: "mother" | "baby" } | null };

// Alerts as each role should read them. The check-in comes back under row-level security, so it's there (and linked)
// only for people she shares that kind of check-in with; for the rest, an alert says only that she needs them.
export function AlertList({ alerts, role }: { alerts: Alert[]; role: Role }) {
  const mine = role === "mother";
  return (
    <section className="flex flex-col gap-3" aria-label="Alerts">
      <h2 className="text-2xl">{mine ? "Your alerts" : "Alerts"}</h2>
      {alerts.map((a) => (
        <article key={a.id} className={`flex flex-col gap-2 rounded-3xl p-5 transition ${a.seen_at ? "border border-line bg-paper-raised" : "bg-alarm-soft"}`}>
          <p className="text-lg font-medium">
            {a.checkin?.subject === "baby"
              ? mine
                ? a.level === "urgent"
                  ? "You reported a warning sign for your baby"
                  : "You were told to call your baby’s doctor"
                : a.level === "urgent"
                  ? `${a.mother.name}’s baby needs care now`
                  : `${a.mother.name} was told to call the baby’s doctor`
              : mine
                ? a.level === "urgent"
                  ? "You reported a warning sign"
                  : "Your blood pressure was high"
                : `${a.mother.name} ${a.level === "urgent" ? "needs you to check on her now" : "was told to call her doctor"}`}
          </p>
          <p className="text-sm text-ink-soft">
            {new Date(a.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            {a.seen_at ? ` · Seen by ${a.seer?.name ?? "her care team"}` : " · Not seen yet"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {!mine && a.checkin && (
              <Link className="font-medium text-brand underline underline-offset-4" href={`/check-in/${a.checkin_id}`}>
                What she reported
              </Link>
            )}
            {role === "care_team" && !a.seen_at && (
              <form action={markSeen.bind(null, a.id)}>
                <button className="btn-quiet" data-sound="done">Seen</button>
              </form>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
