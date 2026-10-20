import Link from "next/link";
import { Greeting } from "@/components/Greeting";
import { CircleShowcase } from "@/components/CircleShowcase";
import { Showcase } from "@/components/Showcase";
import { Guide } from "@/components/Guide";
import { AlertList, type Alert } from "@/components/AlertList";
import { AppPage } from "@/components/AppPage";
import { CareHome } from "@/components/care/CareHome";
import type { Scope } from "@/lib/people/access";
import { ASK_KINDS, askLine, type AskKind } from "@/lib/help/asks";
import { requireMe } from "@/lib/people/me";
import { dateIn, formatIn } from "@/lib/time";
import { myTz } from "@/lib/tz";
import { moodDue } from "@/lib/safety/mood";
import { babyAge, stageFrom, weeksPregnant } from "@/lib/safety/stage";

type Linked = { mother_id: string; person_id: string; kind: string; relation: string; partner: boolean; sees: Scope[]; other: { name: string; phone?: string | null } };
type HelpAsk = { id: string; mother_id: string; kind: AskKind; needed_on: string; taken_by: string | null; mom: { name: string } | null; taker: { name: string } | null };
type CheckIn = { id: string; created_at: string; level: "urgent" | "call_doctor" | "check" | "none"; subject: "mother" | "baby" };

const LEVEL: Record<CheckIn["level"], { label: string; dot: string }> = {
  urgent: { label: "Warning sign", dot: "bg-alarm" },
  call_doctor: { label: "Call your doctor", dot: "bg-honey" },
  check: { label: "Reading to check", dot: "bg-line" },
  none: { label: "All clear", dot: "bg-brand" },
};

const dayOf = (tz: string) => (iso: string) => formatIn(tz, iso, { weekday: "short", month: "short", day: "numeric" });

// Today: for her, the check-in first, then her alerts and people; for her circle, the alerts first; for her care
// team, the triage queue.
export default async function Today() {
  const { db, me } = await requireMe();
  const tz = await myTz();
  const day = dayOf(tz);
  const todayDate = dateIn(tz);
  if (me.role === "care_team") return <CareHome db={db} me={me} />;
  const mine = me.role === "mother";
  const [{ data: links }, { data: alerts }, { data: checkins }, { data: dates }, { data: asks }, { data: lastMood }] = await Promise.all([
    mine
      ? db.from("links").select("*, other:profiles!links_person_id_fkey(name)").eq("mother_id", me.id).order("created_at")
      : db.from("links").select("*, other:profiles!links_mother_id_fkey(name, phone)").eq("person_id", me.id).order("created_at"),
    // Row-level security returns only alerts for moms who share alerts with this person (or her own).
    db.from("alerts").select("id, mother_id, checkin_id, level, created_at, seen_at, mother:profiles!alerts_mother_id_fkey(name), seer:profiles!alerts_seen_by_fkey(name), checkin:checkins(subject)").order("seen_at", { ascending: false, nullsFirst: true }).order("created_at", { ascending: false }).limit(20),
    mine ? db.from("checkins").select("id, created_at, level, subject").eq("mother_id", me.id).order("created_at", { ascending: false }).limit(6) : Promise.resolve({ data: [] }),
    mine ? db.from("mothers").select("due_date, birth_date").eq("id", me.id).maybeSingle() : Promise.resolve({ data: null }),
    // What she asked her circle for, from today on (row-level security: hers, or moms who share ways to help).
    db.from("asks").select("id, mother_id, kind, needed_on, taken_by, mom:profiles!asks_mother_id_fkey(name), taker:profiles!asks_taken_by_fkey(name)").eq("done", false).gte("needed_on", todayDate).order("needed_on").limit(6),
    mine ? db.from("moods").select("created_at").eq("mother_id", me.id).order("created_at", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const help = (asks ?? []) as unknown as HelpAsk[];
  const helpCard = help.length > 0 && (
    <section className="card flex flex-col gap-3" aria-label="Help">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{mine ? "Help today" : "She asked for"}</h2>
        <Link href="/help" className="text-sm font-medium text-brand underline underline-offset-4">
          {mine ? "Ask for more" : "See all"}
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {help.map((a) => (
          <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span>{mine ? askLine(a.kind, a.needed_on, todayDate) : `${a.mom?.name}: ${askLine(a.kind, a.needed_on, todayDate).toLowerCase()}`}</span>
            <span className={`text-sm font-medium ${a.taken_by ? "text-brand" : "text-ink-soft"}`}>{a.taken_by ? (a.taken_by === me.id ? "You’re on it" : `${a.taker?.name} is on it`) : "Waiting"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
  const people = (links ?? []) as Linked[];
  const recent = (checkins ?? []) as CheckIn[];
  const today = new Date();
  const stage = stageFrom(dates ?? {}, today);
  const lastMine = recent.find((c) => c.subject === "mother");
  const doneToday = lastMine && dateIn(tz, lastMine.created_at) === todayDate;

  return (
    <AppPage>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl sm:text-5xl">Hi, {me.name}</h1>
        <p className="text-lg text-ink-soft">
          {mine
            ? stage.kind === "pregnant" && dates?.due_date
              ? `${weeksPregnant(dates.due_date, today)} weeks pregnant`
              : stage.kind === "after_birth"
                ? `${stage.days} days since your baby was born`
                : "Add your due date in today’s check-in so we show the right signs."
            : "Here’s how you can help today."}
        </p>
      </header>
      {mine ? <Greeting name={me.name} /> : <Guide line="guide_partner" />}
      {mine && (
        <Showcase
          db={db}
          facts={{
            motherId: me.id,
            helpLine: help.length
              ? `${help.length} ${help.length === 1 ? "ask" : "asks"} today${((t) => (t ? ` · ${t.taker?.name ?? "someone"} has ${ASK_KINDS[t.kind].short.toLowerCase()}` : ""))(help.find((a) => a.taken_by))}`
              : "Ask for a meal, a ride or the night feeds",
            moodDue: moodDue(lastMood?.created_at ?? null, today),
            lastMood: lastMood ? day(lastMood.created_at) : null,
            baby: { born: stage.kind === "after_birth", age: stage.kind === "after_birth" ? babyAge(stage.days) : null },
            careTeam: people.find((p) => p.kind === "care_team")?.other.name ?? null,
          }}
        />
      )}

      {mine ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <section className="relative overflow-hidden rounded-[32px] bg-brand p-7 text-on-brand sm:p-9">
              <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-white/8" />
              <p className="relative text-sm font-semibold tracking-widest uppercase opacity-80">Today’s check-in</p>
              <p className="relative mt-3 font-display text-3xl leading-tight sm:text-4xl">{doneToday ? "You’ve checked in today. Thank you." : "How are you feeling today?"}</p>
              <p className="relative mt-2 opacity-85">{doneToday ? `${LEVEL[lastMine.level].label} · ${day(lastMine.created_at)}` : "Thirty seconds. Tap what’s true."}</p>
              <Link href="/check-in" className="relative mt-6 inline-flex h-14 items-center rounded-full bg-paper-raised px-8 text-lg font-semibold text-brand transition active:scale-[0.98]">
                {doneToday ? "Check in again" : "Check in today"}
              </Link>
            </section>

            <section className="flex flex-col gap-3" aria-label="Recent check-ins">
              <h2 className="text-2xl">Recent check-ins</h2>
              {recent.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-line p-6 text-ink-soft">Your check-ins will show here.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-paper-raised">
                  {recent.map((c) => (
                    <li key={c.id}>
                      <Link href={`/check-in/${c.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-paper">
                        <span className={`size-2.5 rounded-full ${LEVEL[c.level].dot}`} aria-hidden="true" />
                        <span className="font-medium">{c.subject === "baby" ? `Baby: ${LEVEL[c.level].label.toLowerCase()}` : LEVEL[c.level].label}</span>
                        <span className="ml-auto text-sm text-ink-soft">{day(c.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-6">
            {(alerts ?? []).length > 0 && <AlertList alerts={alerts as unknown as Alert[]} role={me.role} tz={tz} />}
            {helpCard}
            <section className="card flex flex-col gap-4" aria-label="Your people">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Your people</h2>
                <Link href="/people" className="text-sm font-medium text-brand underline underline-offset-4">
                  {people.length ? "Manage" : "Invite"}
                </Link>
              </div>
              {people.length === 0 ? (
                <p className="text-ink-soft">Invite your partner, family and care team so they can help.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {people.map((p) => (
                    <li key={p.person_id} className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand">{p.other.name.slice(0, 1).toUpperCase()}</span>
                      <span className="font-medium">{p.other.name}</span>
                      <span className="text-sm text-ink-soft">{p.partner ? "partner" : p.relation || (p.kind === "care_team" ? "care team" : "circle")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : (
        <>
        {people.map((p) => {
          const mine = help.find((a) => a.mother_id === p.mother_id && a.taken_by === me.id);
          return (
            <CircleShowcase
              key={p.mother_id}
              db={db}
              facts={{
                mom: { id: p.mother_id, name: p.other.name, phone: p.other.phone ?? null },
                unseen: ((alerts ?? []) as unknown as Alert[]).filter((a) => a.mother_id === p.mother_id && !a.seen_at).length,
                asks: help.filter((a) => a.mother_id === p.mother_id).length,
                mine: mine ? ASK_KINDS[mine.kind].short.toLowerCase() : null,
              }}
            />
          );
        })}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {(alerts ?? []).length > 0 ? (
            <AlertList alerts={alerts as unknown as Alert[]} role={me.role} tz={tz} />
          ) : (
            <section className="rounded-[32px] bg-brand-soft p-8">
              <h2 className="text-2xl">No alerts</h2>
              <p className="mt-2 text-ink-soft">{people.length ? "Everyone is all clear. We’ll tell you the moment someone needs you." : "Accept an invite link from a mom to get started."}</p>
            </section>
          )}
          {helpCard}
          <section className="card flex flex-col gap-4" aria-label="Moms">
            <h2 className="text-2xl">Moms you’re helping</h2>
            {people.length === 0 ? (
              <p className="text-ink-soft">Nobody yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {people.map((p) => (
                  <li key={p.mother_id} className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-honey font-semibold text-[#1f1a2e]">{p.other.name.slice(0, 1).toUpperCase()}</span>
                    <span className="font-medium">{p.other.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        </>
      )}
    </AppPage>
  );
}
