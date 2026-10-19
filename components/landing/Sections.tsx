import Link from "next/link";
import { Logo } from "@/components/Logo";

const FACTS = [
  {
    big: "4 in 5",
    text: "pregnancy-related deaths in the US could have been prevented.",
    source: "CDC, Maternal Mortality Review Committees, 2020",
    url: "https://archive.cdc.gov/www_cdc_gov/maternal-mortality/php/data-research/index.html",
  },
  {
    big: "17.9",
    text: "mothers died for every 100,000 babies born in the US in 2024.",
    source: "NCHS, Maternal Mortality Rates in the United States, 2024",
    url: "https://www.cdc.gov/nchs/data/hestat/hestat113.htm",
  },
  {
    big: "3×",
    text: "Black mothers die at about three times the rate of White mothers.",
    source: "NCHS, Maternal Mortality Rates in the United States, 2024",
    url: "https://www.cdc.gov/nchs/data/hestat/hestat113.htm",
  },
];

export function Facts() {
  return (
    <section className="border-y border-line bg-paper-raised">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
        {FACTS.map((f) => (
          <div key={f.big} className="reveal flex flex-col gap-3">
            <p className="font-display text-6xl text-brand">{f.big}</p>
            <p className="text-lg leading-snug">{f.text}</p>
            <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
              {f.source}
            </a>
          </div>
        ))}
      </div>
      <p className="reveal mx-auto max-w-3xl px-5 pb-16 text-center font-display text-2xl leading-snug sm:text-3xl">
        Review committees keep finding the same thing: warning signs noticed too late. Momwell is built so they are noticed every day.
      </p>
    </section>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    </span>
  );
}

const STEPS = [
  {
    icon: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
    title: "She checks in, 30 seconds a day",
    text: "Tap what’s true, add a blood pressure if she took one, or just talk. Momwell greets her by week and by name, and asks what matters today.",
  },
  {
    icon: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    title: "Warning signs are caught in time",
    text: "CDC’s 15 urgent maternal warning signs and blood pressure limits are checked by tested rules, never by a guess. A warning gets a calm screen, one clear step and 911.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    title: "Her people move as one team",
    text: "Her partner gets the alert, her care team sees what she reported and marks it seen, her family gets the help she actually wants. She decides who sees what.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="reveal max-w-2xl">
        <p className="text-sm font-semibold tracking-widest text-brand uppercase">How it works</p>
        <h2 className="mt-3 text-4xl leading-tight sm:text-5xl">A daily check-in she wants to open, and a team that never misses a sign.</h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="reveal flex flex-col gap-5 rounded-[28px] border border-line bg-paper-raised p-7 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(14,74,71,0.4)]">
            <div className="flex items-center justify-between">
              <Icon d={s.icon} />
              <span className="font-display text-3xl text-line">0{i + 1}</span>
            </div>
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FOR_HER = [
  ["Food she can eat today", "Dishes and nearby places that fit her taste, her trimester and her cravings, with the FDA’s list of foods to avoid checked for her."],
  ["Safe Watch", "Shows, music and podcasts picked from what she loves, with upsetting themes about pregnancy and loss filtered out."],
  ["Her birth playlist", "Calm music for the hospital bag, from the artists she already plays."],
  ["Help she actually wants", "Her circle’s tasks matched to her taste: the right dinner, the right gift, the right kind of company."],
];

export function MadeForHer() {
  return (
    <section id="for-her" className="scroll-mt-24 bg-brand text-on-brand">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal flex flex-col gap-5">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-80">Made for her</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">Moms leave apps that feel generic. Momwell feels like hers.</h2>
          <p className="text-lg leading-relaxed opacity-85">
            Momwell learns her taste through Qloo’s taste intelligence: the food, shows, music and places she loves. That is what brings her back each morning, and a daily check-in is how a warning sign gets caught in time.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FOR_HER.map(([title, text]) => (
            <div key={title} className="reveal rounded-[24px] bg-white/8 p-6 ring-1 ring-white/15">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed opacity-80">{text}</p>
              <p className="mt-4 text-xs font-semibold tracking-wider uppercase opacity-60">From Qloo</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const AUDIENCES = [
  {
    id: "people",
    eyebrow: "Her people",
    title: "Partner, family and friends, finally on the same page.",
    points: ["“What she needs today” tasks, matched to her taste", "The partner gets alerts and the night shifts", "A meal train and gifts she’ll actually like", "Only what she chooses to share, removable in one click"],
  },
  {
    id: "care-teams",
    eyebrow: "Care teams",
    title: "Her OB-GYN, midwife and doula see what matters between visits.",
    points: ["Alerts with a reason, and a “Seen” she can see", "Her check-ins, blood pressure and questions in one place", "Postpartum contact by 3 weeks, visit by 12, tracked", "Invite a patient, or be invited by one"],
  },
];

export function Audiences() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 py-24 sm:px-8 md:grid-cols-2">
      {AUDIENCES.map((a) => (
        <div key={a.id} id={a.id} className="reveal flex scroll-mt-24 flex-col gap-6 rounded-[32px] border border-line bg-paper-raised p-8 sm:p-10">
          <p className="text-sm font-semibold tracking-widest text-brand uppercase">{a.eyebrow}</p>
          <h2 className="text-3xl leading-tight sm:text-4xl">{a.title}</h2>
          <ul className="flex flex-col gap-3">
            {a.points.map((p) => (
              <li key={p} className="flex gap-3 text-lg leading-snug">
                <svg className="mt-1 shrink-0 text-brand" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

const PROMISES = [
  ["Rules, not guesses", "Warning signs come from the CDC, ACOG and NIH, and are decided by tested rules. The AI understands her words and writes the reply; it never decides if she is safe."],
  ["Never a diagnosis", "Momwell never names a condition and never suggests a medicine. It tells her what to do next and who to call."],
  ["She decides who sees what", "Every person sees only what she shares with them. She can change that, or remove someone, at any time."],
  ["Help is one tap away", "A warning shows 911 first. Thoughts of harm bring the 988 Lifeline and the National Maternal Mental Health Hotline, 24/7."],
];

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-24 border-t border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="reveal max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-brand uppercase">Safety and privacy</p>
          <h2 className="mt-3 text-4xl leading-tight sm:text-5xl">Built like it matters, because it does.</h2>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {PROMISES.map(([title, text]) => (
            <div key={title} className="reveal flex flex-col gap-3 border-t border-line pt-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-lg leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  ["Who is Momwell for?", "Moms through pregnancy and the year after birth, the people who support them, and their care teams in the US."],
  ["Does it replace my doctor?", "No. Momwell helps you notice warning signs, tells you when to call, and keeps your care team in the loop. Your doctor decides your care."],
  ["What does it cost?", "Nothing. Momwell is free for every mom and her people."],
  ["Who can see my check-ins?", "Only the people you choose, and only the parts you choose. Your partner can get alerts without seeing what you reported."],
  ["What if it’s an emergency?", "Call 911. If you are having thoughts of harming yourself or your baby, call or text 988, any time."],
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <h2 className="reveal text-4xl">Questions</h2>
      <div className="mt-10 flex flex-col">
        {FAQ.map(([q, a]) => (
          <details key={q} className="reveal group border-b border-line py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-medium">
              {q}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FinalCall() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <div className="reveal mx-auto flex max-w-6xl flex-col items-center gap-7 rounded-[40px] bg-brand-soft px-6 py-20 text-center">
        <h2 className="max-w-2xl text-4xl leading-tight sm:text-5xl">Every day, a little care. Every warning, caught in time.</h2>
        <Link href="/signup" className="flex h-14 items-center rounded-full bg-brand px-9 text-lg font-semibold text-on-brand transition active:scale-[0.98]">
          Start for free
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo size={30} />
          <p className="text-ink-soft">Care for pregnancy and the year after birth. Momwell does not give medical advice or diagnoses.</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-5 text-sm leading-relaxed">
          <p className="font-semibold">In an emergency, call 911.</p>
          <p className="text-ink-soft">Thoughts of harming yourself or your baby: call or text 988.</p>
          <p className="text-ink-soft">National Maternal Mental Health Hotline: 1-833-852-6262.</p>
        </div>
      </div>
    </footer>
  );
}
