"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { demoGo } from "@/lib/demo/actions";
import { stepDone, STEPS, type StepKey } from "@/lib/demo/tour";
import type { Role } from "@/lib/people/signup";

// Progress is kept per demo family, so a fresh family starts the story from the beginning.
const keyFor = (family: string) => `momwell-tour-${family}`;
const openKey = (family: string) => `momwell-tour-open-${family}`;
const listeners = new Set<() => void>();
const read = (family: string): string => {
  try {
    return localStorage.getItem(keyFor(family)) ?? "[]";
  } catch {
    return "[]";
  }
};
const mark = (family: string, k: StepKey) => {
  try {
    const done: string[] = JSON.parse(read(family));
    if (!done.includes(k)) localStorage.setItem(keyFor(family), JSON.stringify([...done, k]));
  } catch {}
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// The story in six steps, under the demo bar: each one tap away (as the right person, at the right point in the
// story), ticked off as it's seen.
export function DemoTour({ role, born, family }: { role: Role; born: boolean; family: string }) {
  const path = usePathname();
  const done: string[] = JSON.parse(useSyncExternalStore(subscribe, () => read(family), () => "[]"));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const k = stepDone(path, role, born);
    if (k) mark(family, k);
  }, [path, role, born, family]);

  useEffect(() => {
    try {
      if (localStorage.getItem(openKey(family)) === "no") setOpen(false);
    } catch {}
  }, [family]);
  const toggle = () => {
    setOpen(!open);
    try {
      localStorage.setItem(openKey(family), open ? "no" : "yes");
    } catch {}
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 pb-3 md:px-10">
      <button type="button" onClick={toggle} className="flex w-fit items-center gap-2 text-sm font-semibold text-brand" aria-expanded={open}>
        The story in six steps · {done.length} of {STEPS.length} seen
        <span aria-hidden="true" className={`transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <ol className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {STEPS.map((s, i) => {
            const seen = done.includes(s.key);
            return (
              <li key={s.key} className="relative shrink-0">
                <form action={demoGo.bind(null, s.as, s.path, s.born)}>
                  <button className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${seen ? "border-brand bg-paper-raised text-brand" : "border-line bg-paper-raised text-ink hover:border-brand"}`}>
                    <span className={`flex size-5 items-center justify-center rounded-full text-xs font-semibold ${seen ? "bg-brand text-on-brand" : "bg-brand-soft text-brand"}`} aria-hidden="true">
                      {seen ? "✓" : i + 1}
                    </span>
                    {s.title}
                    {seen && <span className="sr-only">(seen)</span>}
                  </button>
                </form>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
