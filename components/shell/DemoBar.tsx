import Link from "next/link";
import { setDemoBorn, switchDemo } from "@/lib/demo/actions";
import type { Role } from "@/lib/people/signup";
import { DemoTour } from "./DemoTour";

const WHO: { role: Role; name: string; label: string }[] = [
  { role: "mother", name: "Maya", label: "Mom" },
  { role: "circle", name: "Sam", label: "Partner" },
  { role: "care_team", name: "Dr Lee", label: "OB-GYN" },
];

// What to try next as each person, so a first visit follows the story: Maya reports, Sam is alerted, Dr Lee sees it.
const NEXT: Record<Role, { text: string; href: string; cta: string }> = {
  mother: { text: "Tell Momwell how you feel, or see what Qloo picked for you.", href: "/talk", cta: "Talk to Momwell" },
  circle: { text: "Sam got this morning’s alert, without the private detail.", href: "/home", cta: "See Sam’s alert" },
  care_team: { text: "Dr Lee's patients, the one who needs a look first at the top.", href: "/home", cta: "Open the queue" },
};

// Shown only inside a demo family: who you're seeing Momwell as, a one-click switch, and the next thing to try.
export function DemoBar({ role, born }: { role: Role; born: boolean }) {
  const next = NEXT[role];
  return (
    <div className="border-b border-line bg-brand-soft print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 md:px-10">
        <span className="rounded-full bg-paper-raised px-3 py-1 text-xs font-semibold tracking-wider text-brand uppercase">Demo</span>
        <span className="hidden text-sm sm:inline">Viewing as</span>
        <div className="flex gap-1 rounded-full bg-paper-raised p-1" role="group" aria-label="Switch person">
          {WHO.map((w) => (
            <form key={w.role} action={switchDemo.bind(null, w.role)}>
              <button aria-pressed={w.role === role} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${w.role === role ? "bg-brand text-on-brand" : "text-ink-soft hover:text-ink"}`}>
                {w.name} <span className="hidden opacity-70 sm:inline">· {w.label}</span>
              </button>
            </form>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-paper-raised p-1" role="group" aria-label="Where Maya is">
          {[false, true].map((b) => (
            <form key={String(b)} action={setDemoBorn.bind(null, b)}>
              <button aria-pressed={b === born} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${b === born ? "bg-brand text-on-brand" : "text-ink-soft hover:text-ink"}`}>
                {b ? <>6 weeks<span className="hidden sm:inline"> after birth</span></> : "27 weeks"}
              </button>
            </form>
          ))}
        </div>
        <span className="hidden text-sm text-ink-soft xl:inline">{next.text}</span>
        <Link href={next.href} className="ml-auto text-sm font-semibold text-brand underline underline-offset-4">
          {next.cta}
        </Link>
      </div>
      <DemoTour role={role} born={born} />
    </div>
  );
}
