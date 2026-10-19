import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PHOTOS } from "@/lib/landing/photos";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold tracking-widest text-brand uppercase">{children}</p>;
}

const STAKES = [
  { big: "4 in 5", text: "pregnancy-related deaths in the US were judged preventable by the review committees that study them.", source: "CDC, Maternal Mortality Review Committees, 2020", url: "https://archive.cdc.gov/www_cdc_gov/maternal-mortality/php/data-research/index.html" },
  { big: "1 in 4", text: "of those deaths had a mental health condition among the circumstances that contributed.", source: "CDC, Circumstances Contributing to Pregnancy-Related Deaths, 2020", url: "https://archive.cdc.gov/www_cdc_gov/maternal-mortality/php/report/index.html" },
  { big: "3×", text: "Black mothers in the US die at about three times the rate of White mothers.", source: "NCHS, Maternal Mortality Rates in the United States, 2024", url: "https://www.cdc.gov/nchs/data/hestat/hestat113.htm" },
];

// The stakes, stated plainly and sourced.
export function Stakes() {
  return (
    <section className="border-y border-line bg-paper-raised">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="reveal grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <h2 className="text-4xl leading-tight sm:text-5xl">Most maternal deaths in the US can be prevented. Too many begin with a sign nobody caught.</h2>
          <p className="text-lg leading-relaxed text-ink-soft lg:pt-3">
            The committees that review every pregnancy-related death keep naming the same gaps: warning signs not recognised in time, mothers and families who didn’t know what to look for, and care that thins out after the baby is born. Momwell is built to close those gaps, every single day.
          </p>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {STAKES.map((s) => (
            <div key={s.big} className="reveal flex flex-col gap-4 bg-paper-raised p-8">
              <p className="font-display text-6xl text-brand">{s.big}</p>
              <p className="text-lg leading-snug">{s.text}</p>
              <a href={s.url} target="_blank" rel="noreferrer" className="mt-auto text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-ink">
                {s.source}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    name: "Her body",
    title: "Warning signs, checked every day",
    text: "A 30-second check-in, tapped or spoken. The CDC’s 15 urgent maternal warning signs, blood pressure and fever are checked by tested rules, never guessed by AI. A warning gets one calm screen and 911.",
  },
  {
    name: "Her mind",
    title: "Never alone with it",
    text: "When she’s struggling, Momwell listens. Thoughts of harm bring the 988 Lifeline and the National Maternal Mental Health Hotline at once, and the people she chose are told she needs them.",
  },
  {
    name: "Her people",
    title: "One circle around her",
    text: "Her partner gets the alert. Her OB-GYN sees what she reported and marks it seen. Her family gets the help she actually wants. She decides who sees what.",
  },
  {
    name: "Her life",
    title: "Made for her, powered by Qloo",
    text: "Gentle shows with upsetting themes left out, food near her with what to ask for while pregnant, music for the birth. Care that knows her is care she opens every day.",
  },
];

// The whole ecosystem, in four parts.
export function Pillars() {
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
      <div className="reveal max-w-3xl">
        <Eyebrow>One companion for the whole journey</Eyebrow>
        <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Everything a mother needs to stay well, in one place.</h2>
      </div>
      <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2">
        {PILLARS.map((p, i) => (
          <article key={p.name} className="reveal flex gap-6 border-t border-line pt-8">
            <span className="font-display text-2xl text-brand">0{i + 1}</span>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold tracking-wider text-ink-soft uppercase">{p.name}</p>
              <h3 className="text-2xl font-semibold">{p.title}</h3>
              <p className="text-lg leading-relaxed text-ink-soft">{p.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const JOURNEY = [
  { stage: "Pregnancy", photo: PHOTOS.nursery, points: ["A daily check-in by week", "Warning signs and blood pressure, checked by rules", "Food that’s safe to enjoy, shows that won’t upset her"] },
  { stage: "Birth", photo: PHOTOS.bedside, points: ["A calm birth playlist from the music she loves", "Her partner and family told the moment she needs them", "Her care team in the loop"] },
  { stage: "The first year", photo: PHOTOS.firstYear, points: ["Warning signs after birth, watched for the full year", "Help with how she feels, and crisis lines one tap away", "Her circle, on the same page"] },
];

// Three photographs edge to edge, the page as the canvas: what Momwell does at each stage, written on the moment.
export function Journey() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 pt-28 pb-14 sm:px-8">
        <div className="reveal max-w-3xl">
          <Eyebrow>Pregnancy, birth and the year after</Eyebrow>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Most care thins out after the six-week visit. Momwell stays the whole year.</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-3">
        {JOURNEY.map((j) => (
          <article key={j.stage} className="group relative min-h-[560px] overflow-hidden">
            <Image src={j.photo.src} alt={j.photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-[1.2s] group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a2e]/85 via-[#1f1a2e]/25 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8 text-white sm:p-10">
              <h3 className="font-display text-3xl">{j.stage}</h3>
              <ul className="flex flex-col gap-2.5">
                {j.points.map((p) => (
                  <li key={p} className="flex gap-3 leading-snug opacity-95">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-honey" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// The product itself: real screens from the demo family.
export function SeeItWork() {
  return (
    <section id="safety" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
      <div className="reveal grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <Eyebrow>How Momwell keeps watch</Eyebrow>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">When something is wrong, she knows what to do, and so do her people.</h2>
        </div>
        <p className="text-lg leading-relaxed text-ink-soft lg:pt-10">
          Maya, 27 weeks, told Momwell her head had been pounding all morning and gave her blood pressure. The rules found a warning sign. She saw one clear step and 911; her partner was alerted; her OB-GYN saw what she wrote and marked it seen.
        </p>
      </div>
      <div className="reveal mt-14 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <figure className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-3xl border border-line bg-paper-raised shadow-[0_30px_80px_-40px_rgba(31,26,46,0.4)]">
            <Image src="/screens/talk.png" alt="Maya tells Momwell her head has been pounding and gives her blood pressure; Momwell shows: get medical care now, call 911, with each reason and its CDC or ACOG source" width={2040} height={1640} className="h-auto w-full" />
          </div>
          <figcaption className="text-sm text-ink-soft">Her words, the rules’ answer: one step, 911, and every reason with its source.</figcaption>
        </figure>
        <figure className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-3xl border border-line bg-paper-raised shadow-[0_30px_80px_-40px_rgba(31,26,46,0.4)]">
            <Image src="/screens/care-team.png" alt="Dr Lee's view in Momwell: Maya needs you to check on her now, with what she reported and a Seen button" width={2560} height={1280} className="h-auto w-full" />
          </div>
          <figcaption className="text-sm text-ink-soft">Her OB-GYN’s screen: the alert, what she reported, and “Seen”.</figcaption>
        </figure>
      </div>
      <div className="reveal mt-14 grid gap-6 rounded-3xl border border-line bg-paper-raised p-8 sm:grid-cols-3 sm:p-10">
        {[
          ["Rules, not guesses", "Warning signs are decided by tested rules on the CDC, ACOG and NIH lists. The AI understands her words; it never decides whether she is safe."],
          ["Never a diagnosis", "Momwell never names a condition and never suggests a medicine. It tells her what to do next and who to call."],
          ["She decides who sees what", "Each person sees only what she shares. Her partner can get an alert without seeing what she reported."],
        ].map(([t, d]) => (
          <div key={t} className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{t}</h3>
            <p className="leading-relaxed text-ink-soft">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Why Qloo is the reason it works: taste is what brings her back, and that's what keeps the daily check-in alive.
export function MadeForHer() {
  return (
    <section className="bg-brand text-on-brand">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <div className="reveal flex flex-col gap-6">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-80">Powered by Qloo</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">Safety only works if she opens it every day. She opens what knows her.</h2>
          <p className="text-lg leading-relaxed opacity-85">
            Pregnancy apps lose mothers because they feel generic. Momwell learns her taste through Qloo’s taste intelligence across shows, music, food and places, and turns it into something that feels made for her each day. Every visit is a check-in.
          </p>
          <Link href="/demo" className="mt-2 flex h-14 w-fit items-center rounded-full bg-paper-raised px-8 text-lg font-semibold text-brand transition active:scale-[0.98]">
            See Maya’s picks
          </Link>
        </div>
        <div className="reveal flex flex-col gap-4">
          <div className="rounded-3xl bg-white/10 p-7 ring-1 ring-white/15">
            <p className="text-sm font-semibold tracking-wider uppercase opacity-70">Safe Watch</p>
            <p className="mt-3 font-display text-2xl leading-snug">Maya loves Gilmore Girls. Momwell suggests Sweet Magnolias and Bunheads, and quietly leaves out Everwood, a story built around a mother’s death.</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-7 ring-1 ring-white/15">
            <p className="text-sm font-semibold tracking-wider uppercase opacity-70">Food near her</p>
            <p className="mt-3 text-lg leading-relaxed">Vegetarian places in Austin that fit her taste, each with what to ask for: “Choose cooked rolls: raw fish is on the FDA’s avoid list in pregnancy.”</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-7 ring-1 ring-white/15">
            <p className="text-sm font-semibold tracking-wider uppercase opacity-70">Her birth playlist</p>
            <p className="mt-3 text-lg leading-relaxed">From Adele and Norah Jones to calm artists for the hospital bag, with nothing harsh.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Audiences() {
  const cards = [
    { id: "families", photo: PHOTOS.partner, eyebrow: "For partners and families", title: "Know how to help, and know the moment she needs you.", points: ["Alerts when she reports a warning sign", "What she chooses to share, nothing more", "One place for the whole family"] },
    { id: "clinicians", photo: PHOTOS.clinician, eyebrow: "For OB-GYNs, midwives and doulas", title: "See what matters between visits.", points: ["Alerts with the reason, and a “Seen” she can see", "Her check-ins, blood pressure and own words", "Invite a patient, or be invited by one"] },
  ];
  return (
    <section className="grid md:grid-cols-2">
      {cards.map((c) => (
        <article key={c.id} id={c.id} className="relative flex min-h-[620px] scroll-mt-24 items-end overflow-hidden">
          <Image src={c.photo.src} alt={c.photo.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a2e]/90 via-[#1f1a2e]/35 to-transparent" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 p-8 text-white sm:p-12">
            <p className="text-sm font-semibold tracking-widest uppercase opacity-80">{c.eyebrow}</p>
            <h2 className="max-w-lg text-3xl leading-tight sm:text-4xl">{c.title}</h2>
            <ul className="flex flex-col gap-2.5">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3 text-lg leading-snug">
                  <svg className="mt-1 shrink-0 text-honey" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  );
}

const FAQ = [
  ["Who is Momwell for?", "Mothers in the US through pregnancy and the year after birth, the people who support them, and their care teams."],
  ["Does it replace my doctor?", "No. Momwell helps you notice warning signs, tells you when to call, and keeps your care team in the loop. Your doctor decides your care."],
  ["How does it decide something is urgent?", "With rules built on the CDC’s urgent maternal warning signs and blood pressure limits from ACOG and NIH, tested sign by sign. The AI never makes that call."],
  ["Who can see my check-ins?", "Only the people you choose, and only the parts you choose. Your partner can get alerts without seeing what you reported."],
  ["What does it cost?", "Nothing. Momwell is free for every mother and her people."],
  ["What if it’s an emergency?", "Call 911. If you are having thoughts of harming yourself or your baby, call or text 988, any time."],
];

export function Faq() {
  return (
    <section className="border-t border-line bg-paper-raised">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-28 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="reveal text-4xl leading-tight sm:text-5xl">Questions, answered plainly.</h2>
        <div className="flex flex-col">
          {FAQ.map(([q, a]) => (
            <details key={q} className="reveal group border-b border-line py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-medium">
                {q}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCall() {
  return (
    <section className="relative overflow-hidden">
      <Image src={PHOTOS.firstYear.src} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[#1f1a2e]/65" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-32 text-white sm:px-8">
        <h2 className="max-w-3xl text-4xl leading-tight sm:text-6xl">Every day, a little care. Every warning sign, caught in time.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/demo" className="flex h-14 items-center rounded-full bg-white px-8 text-lg font-semibold text-brand transition active:scale-[0.98]">
            Try it as Maya
          </Link>
          <Link href="/signup" className="flex h-14 items-center rounded-full border border-white/50 px-7 text-lg font-medium text-white transition hover:bg-white/10">
            Start for free
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo size={30} />
          <p className="text-ink-soft">The care companion for pregnancy and the year after birth. Momwell does not give medical advice or diagnoses.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold">In an emergency, call 911.</p>
          <p className="text-ink-soft">Thoughts of harming yourself or your baby: call or text 988.</p>
          <p className="text-ink-soft">National Maternal Mental Health Hotline: 1-833-852-6262, call or text, 24/7.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Sources</p>
          <a className="underline-offset-4 hover:underline" href="https://www.cdc.gov/hearher/maternal-warning-signs/index.html" target="_blank" rel="noreferrer">CDC Hear Her: urgent maternal warning signs</a>
          <a className="underline-offset-4 hover:underline" href="https://www.fda.gov/food/consumers/people-risk-foodborne-illness" target="_blank" rel="noreferrer">FDA: food safety in pregnancy</a>
          <p>Photography from Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
