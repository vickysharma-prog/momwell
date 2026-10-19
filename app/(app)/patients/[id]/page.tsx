import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppPage } from "@/components/AppPage";
import { BpChart } from "@/components/care/BpChart";
import { HowDecided } from "@/components/HowDecided";
import { PrintButton } from "@/components/care/PrintButton";
import { markAllSeen } from "@/lib/care/actions";
import { stageLabel } from "@/lib/care/patients";
import { statusOf, STATUS } from "@/lib/care/triage";
import { aboutHer, LEVEL_FOR_TEAM, LEVEL_FOR_TEAM_BABY } from "@/lib/care/voice";
import { requireMe } from "@/lib/people/me";
import type { Reason } from "@/lib/safety/engine";
import { band, QUESTIONS, type MoodLevel } from "@/lib/safety/mood";
import type { CheckInSource } from "@/lib/safety/trail";

type Mood = { id: string; created_at: string; kind: "phq2" | "phq9"; answers: number[]; score: number; level: MoodLevel };
type CheckIn = { id: string; source: CheckInSource; subject: "mother" | "baby"; engine_version: string; created_at: string; level: keyof typeof LEVEL_FOR_TEAM; systolic: number | null; diastolic: number | null; temp_value: number | null; temp_unit: string | null; note: string; reasons: Reason[] };

const DOT: Record<string, string> = { urgent: "bg-alarm", call_doctor: "bg-honey", check: "bg-line", none: "bg-brand" };
const aboutBaby = (a: { checkin: unknown }) => (a.checkin as { subject?: string } | null)?.subject === "baby";
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// One patient, for her care team: status, blood pressure over time, every check-in in her words and the rules',
// and a summary to print before a visit. Row-level security means only her care team gets here with data.
export default async function PatientPage({ params }: PageProps<"/patients/[id]">) {
  const { id } = await params;
  const { db, me } = await requireMe();
  if (me.role !== "care_team") redirect("/home");

  const [{ data: profile }, { data: dates }, { data: checkins }, { data: alerts }, { data: moodRows }] = await Promise.all([
    db.from("profiles").select("name").eq("id", id).maybeSingle(),
    db.from("mothers").select("due_date, birth_date").eq("id", id).maybeSingle(),
    db.from("checkins").select("id, created_at, level, systolic, diastolic, temp_value, temp_unit, note, reasons, source, subject, engine_version").eq("mother_id", id).order("created_at", { ascending: false }).limit(60),
    db.from("alerts").select("id, level, seen_at, checkin:checkins(subject)").eq("mother_id", id).is("seen_at", null),
    db.from("moods").select("id, created_at, kind, answers, score, level").eq("mother_id", id).order("created_at", { ascending: false }).limit(12),
  ]);
  const moods = (moodRows ?? []) as Mood[];
  if (!profile) notFound();
  const list = (checkins ?? []) as CheckIn[];
  const hers = list.filter((c) => c.subject === "mother");
  const now = new Date();
  const open = alerts ?? [];
  const { status, reason } = statusOf(
    { unseenUrgent: open.filter((a) => a.level === "urgent").length, unseenCall: open.filter((a) => a.level === "call_doctor").length, babyUrgent: open.filter((a) => a.level === "urgent" && aboutBaby(a)).length, babyCall: open.filter((a) => a.level === "call_doctor" && aboutBaby(a)).length, lastCheckIn: hers[0]?.created_at ?? null, lastLevel: hers[0]?.level ?? null, lastMood: moods[0] ? { level: moods[0].level, at: moods[0].created_at } : null },
    now,
  );
  const bp = list.filter((c) => c.systolic && c.diastolic).map((c) => ({ at: c.created_at, systolic: c.systolic!, diastolic: c.diastolic! }));
  const twoWeeks = list.filter((c) => now.getTime() - Date.parse(c.created_at) < 14 * 86_400_000);
  const warnings = twoWeeks.filter((c) => c.level === "urgent" || c.level === "call_doctor");
  const notes = twoWeeks.filter((c) => c.note);

  return (
    <AppPage className="max-w-6xl print:max-w-none print:p-0">
      <Link href="/home" className="text-ink-soft underline underline-offset-4 print:hidden">
        All patients
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl sm:text-5xl">{profile.name}</h1>
          <p className="text-lg text-ink-soft">{stageLabel(dates, now)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {open.length > 0 && (
            <form action={markAllSeen.bind(null, id)}>
              <button className="btn w-auto px-6">Mark {open.length === 1 ? "alert" : `${open.length} alerts`} seen</button>
            </form>
          )}
          <PrintButton />
        </div>
      </header>

      <section className={`flex flex-wrap items-center gap-3 rounded-2xl p-5 ${status === "urgent" ? "bg-alarm-soft" : status === "call" ? "bg-honey/20" : "bg-brand-soft"}`}>
        <span className="font-semibold">{STATUS[status].label}</span>
        <span className="text-ink-soft">{reason}</span>
      </section>

      <section className="card flex flex-col gap-4" aria-label="Visit summary, last 14 days">
        <h2 className="text-2xl">Visit summary · last 14 days</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-display text-4xl">{twoWeeks.length}</p>
            <p className="text-sm text-ink-soft">check-ins</p>
          </div>
          <div>
            <p className="font-display text-4xl">{warnings.length}</p>
            <p className="text-sm text-ink-soft">with a warning sign or high reading</p>
          </div>
          <div>
            <p className="font-display text-4xl tabular-nums">{bp[0] ? `${bp[0].systolic}/${bp[0].diastolic}` : "—"}</p>
            <p className="text-sm text-ink-soft">latest blood pressure</p>
          </div>
        </div>
        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1 border-t border-line pt-4">
            {warnings.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-semibold">{when(c.created_at)}{c.subject === "baby" ? ", baby" : ""}:</span> {c.reasons.map((r) => aboutHer(r.text)).join(" ")}
              </li>
            ))}
          </ul>
        )}
        {notes.length > 0 && (
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-sm font-semibold">In her words</p>
            <ul className="flex flex-col gap-1">
              {notes.map((c) => (
                <li key={c.id} className="text-sm text-ink-soft">
                  “{c.note}” · {when(c.created_at)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {moods.length > 0 && (
        <section className="card flex flex-col gap-4" aria-label="Mood checks">
          <h2 className="text-2xl">Mood checks</h2>
          <ul className="flex flex-col divide-y divide-line">
            {moods.map((m) => (
              <li key={m.id} className="flex flex-col gap-1 py-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className={`size-2.5 rounded-full ${DOT[m.level]}`} aria-hidden="true" />
                  <span className="font-semibold">
                    {m.kind === "phq2" ? `PHQ-2: ${m.score} of 6, negative` : `PHQ-9: ${m.score} of 27, ${band(m.score)}`}
                  </span>
                  <span className="ml-auto text-sm text-ink-soft">{when(m.created_at)}</span>
                </div>
                {m.kind === "phq9" && m.answers[8] > 0 && <p className="text-sm font-medium text-alarm">Item 9 (thoughts of self-harm): {m.answers[8]} of 3</p>}
                {m.kind === "phq9" && (
                  <details className="text-sm text-ink-soft">
                    <summary className="cursor-pointer">Her answers</summary>
                    <ol className="mt-2 flex flex-col gap-1">
                      {QUESTIONS.map((q, i) => (
                        <li key={q}>
                          {m.answers[i]} · {q}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card flex flex-col gap-4">
        <h2 className="text-2xl">Blood pressure</h2>
        <BpChart points={bp} />
      </section>

      <section className="flex flex-col gap-3 print:break-before-page">
        <h2 className="text-2xl">Check-ins</h2>
        {list.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-ink-soft">No check-ins shared yet.</p>}
        <ol className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-paper-raised">
          {list.map((c, i) => (
            <li key={c.id} className="flex flex-col gap-2 px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`size-2.5 rounded-full ${DOT[c.level]}`} aria-hidden="true" />
                <span className="font-semibold">{(c.subject === "baby" ? LEVEL_FOR_TEAM_BABY : LEVEL_FOR_TEAM)[c.level]}</span>
                <span className="ml-auto text-sm text-ink-soft">{when(c.created_at)}</span>
              </div>
              {c.reasons.map((r) => (
                <p key={r.id} className="text-ink-soft">
                  {aboutHer(r.text)}{" "}
                  <a href={r.source.url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2">
                    source
                  </a>
                </p>
              ))}
              {c.note && <p className="rounded-xl bg-paper px-4 py-2 text-ink">“{c.note}”</p>}
              {/* The audit trail for the latest warnings; older ones stay one tap away on their own page. */}
              {i < 5 && (c.level === "urgent" || c.level === "call_doctor") && <HowDecided db={db} checkin={{ ...c, mother_id: id }} />}
            </li>
          ))}
        </ol>
      </section>
    </AppPage>
  );
}
