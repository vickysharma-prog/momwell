import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppPage } from "@/components/AppPage";
import { AskForm } from "@/components/help/AskForm";
import { letGo, markDone, removeAsk, takeAsk } from "@/lib/help/actions";
import { ASK_KINDS, askLine, type AskKind } from "@/lib/help/asks";
import { requireMe } from "@/lib/people/me";
import { nearbyFood } from "@/lib/qloo/food";
import { idsOf, type Taste } from "@/lib/taste/taste";
import type { SupabaseClient } from "@supabase/supabase-js";

type Ask = { id: string; mother_id: string; kind: AskKind; note: string; needed_on: string; taken_by: string | null; done: boolean; mom: { name: string } | null; taker: { name: string } | null };

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const today = () => daysAgo(0);

// For a dinner ask: places that fit her taste and diet, from Qloo, with what to ask for while she's pregnant.
async function MealIdeas({ db, motherId }: { db: SupabaseClient; motherId: string }) {
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", motherId).maybeSingle();
  const taste = data as Taste | null;
  if (!taste?.city) return null;
  const meals = await nearbyFood(idsOf(taste), taste.city, taste.diets, 3);
  if (!meals.length) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4">
      <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">Places she’d love · from Qloo</p>
      {meals.map((m) => (
        <div key={m.entity.entity_id}>
          <p className="font-medium">{m.entity.name}</p>
          <p className="text-sm text-ink-soft">{m.entity.properties?.address}</p>
          {m.notes[0] && <p className="text-sm">{m.notes[0].text}</p>}
        </div>
      ))}
    </div>
  );
}

export default async function Help() {
  const { db, me } = await requireMe();
  if (me.role === "care_team") redirect("/home");
  const mine = me.role === "mother";
  const { data } = await db
    .from("asks")
    .select("id, mother_id, kind, note, needed_on, taken_by, done, mom:profiles!asks_mother_id_fkey(name), taker:profiles!asks_taken_by_fkey(name)")
    .gte("needed_on", daysAgo(2))
    .order("needed_on")
    .order("created_at");
  const asks = (data ?? []) as unknown as Ask[];
  const open = asks.filter((a) => !a.done);
  const done = asks.filter((a) => a.done);

  return (
    <AppPage>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl sm:text-5xl">{mine ? "Help from your people" : "How you can help"}</h1>
        <p className="text-lg text-ink-soft">{mine ? "Ask for what would make today easier. Only the people you share ways to help with see it." : "What she asked for. Take one, and she’ll see it’s yours."}</p>
      </header>
      <div className={`grid items-start gap-6 ${mine ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}`}>
        {mine && <AskForm />}
        <section className="flex flex-col gap-3" aria-label="Asks">
          {open.length === 0 && <p className="rounded-3xl border border-dashed border-line p-6 text-ink-soft">{mine ? "Nothing asked yet." : "Nothing she needs right now. You’ll see it here the moment she asks."}</p>}
          {open.map((a) => (
            <article key={a.id} className={`card flex flex-col gap-3 ${a.taken_by ? "" : "border-brand"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-semibold">{mine ? askLine(a.kind, a.needed_on, today()) : `${a.mom?.name ?? "She"} would love: ${askLine(a.kind, a.needed_on, today()).toLowerCase()}`}</p>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${a.taken_by ? "bg-brand-soft text-brand" : "bg-honey/25"}`}>{a.taken_by ? (a.taken_by === me.id ? "You’re on it" : `${a.taker?.name ?? "Someone"} is on it`) : "Waiting"}</span>
              </div>
              {a.note && <p className="text-ink-soft">“{a.note}”</p>}
              {!mine && a.kind === "meal" && (
                <Suspense fallback={null}>
                  <MealIdeas db={db} motherId={a.mother_id} />
                </Suspense>
              )}
              <div className="flex flex-wrap gap-2">
                {!mine && !a.taken_by && (
                  <form action={takeAsk.bind(null, a.id)}>
                    <button className="btn w-auto px-6">I’ll do it</button>
                  </form>
                )}
                {!mine && a.taken_by === me.id && (
                  <>
                    <form action={markDone.bind(null, a.id)}>
                      <button className="btn w-auto px-6">Done</button>
                    </form>
                    <form action={letGo.bind(null, a.id)}>
                      <button className="btn-quiet">Let go</button>
                    </form>
                  </>
                )}
                {mine && (
                  <>
                    {a.taken_by && (
                      <form action={markDone.bind(null, a.id)}>
                        <button className="btn-quiet">Mark done</button>
                      </form>
                    )}
                    <form action={removeAsk.bind(null, a.id)}>
                      <button className="text-sm text-ink-soft underline underline-offset-4">Take back</button>
                    </form>
                  </>
                )}
              </div>
            </article>
          ))}
          {done.length > 0 && (
            <p className="text-sm text-ink-soft">
              Done lately: {done.map((a) => `${ASK_KINDS[a.kind].short}${a.taker ? ` by ${a.taker.name}` : ""}`).join(" · ")}
            </p>
          )}
        </section>
      </div>
    </AppPage>
  );
}
