"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { saveTaste, searchTaste } from "@/lib/taste/actions";
import type { Kind, Liked, Taste } from "@/lib/taste/taste";

const SECTIONS: { kind: Kind; title: string; hint: string }[] = [
  { kind: "tv_show", title: "Shows you love", hint: "Gilmore Girls, Ted Lasso…" },
  { kind: "movie", title: "Films you love", hint: "Little Women, Paddington…" },
  { kind: "artist", title: "Music you love", hint: "Adele, Norah Jones…" },
];
const DIET_LABEL = { vegetarian: "Vegetarian", vegan: "Vegan", gluten_free: "Gluten-free", halal: "Halal", kosher: "Kosher" } as const;

function Search({ kind, hint, onPick }: { kind: Kind; hint: string; onPick: (l: Liked) => void }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Liked[]>([]);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) return;
    // Wait for a pause in typing, so each word doesn't cost a Qloo call.
    timer.current = setTimeout(() => start(async () => setFound(await searchTaste(q, kind))), 350);
    return () => clearTimeout(timer.current);
  }, [q, kind]);

  return (
    <div className="relative">
      <input value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder={hint} aria-label={`Search ${kind.replace("_", " ")}s`} />
      {pending && <span className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />}
      <AnimatePresence>
        {q.trim().length >= 2 && found.length > 0 && (
          <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-[0_20px_40px_-20px_rgba(31,26,46,0.35)]">
            {found.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(f);
                    setQ("");
                    setFound([]);
                  }}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-brand-soft"
                >
                  {f.name}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// What she loves: her city, her diet, and a few shows, films and artists, searched live in Qloo.
export function TastePicker({ initial }: { initial: Taste | null }) {
  const [liked, setLiked] = useState<Liked[]>(initial?.liked ?? []);
  const [state, action, saving] = useActionState(saveTaste, undefined);

  return (
    <form action={action} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <input type="hidden" name="liked" value={JSON.stringify(liked)} />
      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.kind} className="card flex flex-col gap-4">
            <h2 className="text-2xl">{s.title}</h2>
            <Search kind={s.kind} hint={s.hint} onPick={(l) => setLiked((all) => (all.some((x) => x.id === l.id) ? all : [...all, l]))} />
            <div className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {liked
                  .filter((l) => l.kind === s.kind)
                  .map((l) => (
                    <motion.button
                      key={l.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setLiked((all) => all.filter((x) => x.id !== l.id))}
                      className="flex min-h-10 items-center gap-2 rounded-full bg-brand-soft px-4 text-sm font-medium text-brand"
                      aria-label={`Remove ${l.name}`}
                    >
                      {l.name}
                      <span aria-hidden="true">×</span>
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl">Where you live</h2>
          <input name="city" defaultValue={initial?.city ?? ""} className="field" placeholder="City, state (Austin, TX)" maxLength={80} aria-label="City and state" />
        </section>
        <section className="card flex flex-col gap-4">
          <h2 className="text-2xl">How you eat</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIET_LABEL) as (keyof typeof DIET_LABEL)[]).map((d) => (
              <label key={d} className="btn-quiet min-h-10 cursor-pointer gap-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" name="diets" value={d} defaultChecked={initial?.diets.includes(d)} className="accent-[var(--brand)]" />
                {DIET_LABEL[d]}
              </label>
            ))}
          </div>
        </section>
        {state?.error && <p role="alert" className="error">{state.error}</p>}
        {state?.saved && <p role="status" className="font-medium text-brand">Saved. Your picks for today are ready.</p>}
        <button className="btn" disabled={saving}>
          {saving ? "Saving…" : "Save what I love"}
        </button>
      </aside>
    </form>
  );
}
