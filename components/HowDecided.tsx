import type { SupabaseClient } from "@supabase/supabase-js";
import type { Level, Reason } from "@/lib/safety/engine";
import { trail, type CheckInSource } from "@/lib/safety/trail";

type CheckIn = { id: string; mother_id: string; source: CheckInSource; subject?: "mother" | "baby"; engine_version: string; level: Level; reasons: Reason[]; systolic: number | null };

// "How this was decided", opened on demand: what she said, the rules that fired with their sources, who was told
// and whether it was seen. Read under row-level security, so each viewer sees only what they may.
export async function HowDecided({ db, checkin, open = false }: { db: SupabaseClient; checkin: CheckIn; open?: boolean }) {
  const alerting = checkin.level === "urgent" || checkin.level === "call_doctor";
  const [{ data: links }, { data: alert }] = alerting
    ? await Promise.all([
        db.from("links").select("relation, partner, kind, sees, other:profiles!links_person_id_fkey(name)").eq("mother_id", checkin.mother_id),
        db.from("alerts").select("seen_at, seer:profiles!alerts_seen_by_fkey(name)").eq("checkin_id", checkin.id).maybeSingle(),
      ])
    : [{ data: [] }, { data: null }];
  const told = ((links ?? []) as unknown as { relation: string; partner: boolean; kind: string; sees: string[]; other: { name: string } | null }[])
    .filter((l) => l.sees.includes("alerts") && l.other)
    .map((l) => `${l.other!.name} (${l.partner ? "partner" : l.relation || (l.kind === "care_team" ? "care team" : "circle")})`);
  const a = alert as unknown as { seen_at: string | null; seer: { name: string } | null } | null;
  const steps = trail({ source: checkin.source, subject: checkin.subject, engineVersion: checkin.engine_version, level: checkin.level, reasons: checkin.reasons, hadBp: Boolean(checkin.systolic), told, seenBy: a?.seen_at ? (a.seer?.name ?? "Her care team") : null });

  return (
    <details open={open} className="group rounded-3xl border border-line bg-paper-raised">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold">
        How this was decided
        <span className="text-ink-soft transition group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>
      <ol className="flex flex-col gap-4 border-t border-line px-6 py-5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{s.title}</p>
              <p className="text-ink-soft">{s.detail}</p>
              {s.link && (
                <a href={s.link.url} target="_blank" rel="noreferrer" className="text-sm text-ink-soft underline underline-offset-4">
                  {s.link.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
