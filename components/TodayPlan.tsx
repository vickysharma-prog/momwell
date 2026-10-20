import Link from "next/link";
import { QlooBadge } from "@/components/QlooBadge";
import type { PlanPicks, TraceStep } from "@/lib/plan/make";

export type PlanRow = { mother_id: string; picks: PlanPicks; note_her: string; note_circle: string; made_by: "agent" | "rules"; trace: TraceStep[] };
export type First = { text: string; href: string; urgent?: boolean } | null;

const WHO: Record<TraceStep["who"], string> = { Momwell: "bg-brand-soft text-brand", Qloo: "bg-honey/30 text-ink", Rules: "bg-paper text-ink-soft" };

// Today's plan: what the rules say comes first (decided live, never by the model), then an evening Momwell's planner
// chose through Qloo, with every step it took one tap away.
export function TodayPlan({ plan, first, forCircle, name }: { plan: PlanRow | null; first: First; forCircle?: boolean; name?: string }) {
  const p = plan?.picks;
  const items = p ? ([["Watch", p.show], ["Dinner from", p.place], ["Listen to", p.artist]] as const).filter(([, x]) => x) : [];
  return (
    <section className="card flex flex-col gap-4" aria-label="Today’s plan">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl">{forCircle ? `Today’s plan for ${name}` : "Today’s plan"}</h2>
        {items.length > 0 && <QlooBadge />}
      </div>
      {first && (
        <Link href={first.href} className={`rounded-2xl px-4 py-3 font-semibold ${first.urgent ? "bg-alarm-soft text-alarm" : "bg-brand-soft text-brand"}`}>
          First: {first.text}
        </Link>
      )}
      {!plan ? (
        <p className="text-ink-soft">Momwell is putting {forCircle ? "her" : "your"} evening together through Qloo. It will be here in a moment.</p>
      ) : (
        <>
          <p>{forCircle ? plan.note_circle : plan.note_her}</p>
          {items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map(([label, x]) => (
                <li key={label} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Qloo's image hosts vary */}
                  {x!.image ? <img src={x!.image} alt="" className="size-11 rounded-xl object-cover" /> : <span className="size-11 rounded-xl bg-paper" aria-hidden="true" />}
                  <span>
                    <span className="text-sm text-ink-soft">{label} </span>
                    <span className="font-semibold">{x!.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-ink-soft">{plan.made_by === "agent" ? "How Momwell made this" : "Put together by rules today"}</summary>
            <ol className="mt-3 flex flex-col gap-2">
              {plan.trace.map((s, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${WHO[s.who]}`}>{s.who}</span>
                  <span className="text-ink-soft">{s.did}</span>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </section>
  );
}
