import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StartDemo } from "@/components/StartDemo";

const PEOPLE = [
  { name: "Maya", who: "27 weeks pregnant, in Austin", what: "Her check-in, Talk to Momwell, a mood check, picks made for her through Qloo, and her baby six weeks after the birth." },
  { name: "Sam", who: "Maya’s partner", what: "The alert he got, without the private detail, her number one tap away, and her asks to take on." },
  { name: "Dr Lee", who: "Maya’s OB-GYN", what: "Her patients as a queue, Maya first and why, her blood pressure and mood, and a call in one tap." },
];

// The way in for judges and the curious: a fresh demo family of their own, with synthetic data, in one click.
export default function Demo() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8">
      <Link href="/" aria-label="Momwell home">
        <Logo size={32} />
      </Link>
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-5xl leading-tight">Meet Maya’s family.</h1>
        <p className="text-xl leading-relaxed text-ink-soft">
          One click opens Momwell as Maya. A six-step story under the bar walks you through it, and you can switch to Sam or Dr Lee, or to six weeks after the birth, with one tap. Your own copy with made-up data, cleared after two days.
        </p>
        <StartDemo />
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {PEOPLE.map((p) => (
          <article key={p.name} className="card flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft font-display text-xl text-brand">{p.name.slice(0, 1)}</span>
            <h2 className="text-2xl">{p.name}</h2>
            <p className="text-sm font-medium text-brand">{p.who}</p>
            <p className="text-ink-soft">{p.what}</p>
          </article>
        ))}
      </div>
      <p className="text-sm text-ink-soft">Momwell does not give medical advice. In an emergency, call 911.</p>
    </main>
  );
}
