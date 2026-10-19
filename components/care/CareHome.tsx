import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppPage } from "@/components/AppPage";
import { myPatients } from "@/lib/care/patients";
import { STATUS, triage, type Status } from "@/lib/care/triage";

const TONE: Record<string, string> = {
  alarm: "bg-alarm-soft text-[#5c1a12]",
  honey: "bg-honey/25 text-[#5a3d00]",
  muted: "bg-line/70 text-ink-soft",
  brand: "bg-brand-soft text-brand",
};

const ago = (iso: string | null, now: Date) => {
  if (!iso) return "Never";
  const mins = Math.round((now.getTime() - Date.parse(iso)) / 60_000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} days ago`;
};

// The clinician's home: every patient as a triage queue, the one who needs a look first at the top, with the reason.
export async function CareHome({ db, me }: { db: SupabaseClient; me: { id: string; name: string } }) {
  const now = new Date();
  const queue = triage(await myPatients(db, me.id, now), now);
  const count = (s: Status) => queue.filter((p) => p.status === s).length;

  return (
    <AppPage className="max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl sm:text-5xl">Patients</h1>
          <p className="text-lg text-ink-soft">Sorted by who needs you first. Warning signs are decided by the CDC, ACOG and NIH rules, not by AI.</p>
        </div>
        <Link href="/people" className="btn-quiet">
          Invite a patient
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["urgent", "call", "quiet", "clear"] as const).map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-paper-raised p-4">
            <p className="font-display text-4xl">{count(s)}</p>
            <p className="text-sm text-ink-soft">{STATUS[s].label}</p>
          </div>
        ))}
      </div>

      {queue.length === 0 ? (
        <section className="rounded-[28px] bg-brand-soft p-8">
          <h2 className="text-2xl">No patients yet</h2>
          <p className="mt-2 text-ink-soft">Invite a patient, or ask her to invite you from her Momwell.</p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-paper-raised">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line text-sm text-ink-soft">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last check-in</th>
                <th className="px-5 py-3 font-medium">Last BP</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {queue.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-ink-soft">{p.stage}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${TONE[STATUS[p.status].tone]}`}>{STATUS[p.status].label}</span>
                    <p className="mt-1 text-sm text-ink-soft">{p.reason}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{ago(p.lastCheckIn, now)}</td>
                  <td className="px-5 py-4 font-medium tabular-nums">{p.lastBp ?? "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/patients/${p.id}`} className="font-semibold text-brand underline underline-offset-4">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPage>
  );
}
