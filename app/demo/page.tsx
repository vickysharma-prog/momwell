import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StartDemo } from "@/components/StartDemo";

const PEOPLE = [
  { name: "Maya", who: "27 weeks pregnant, in Austin", what: "Her daily check-in, a warning sign from this morning, a talk with Momwell, and picks made for her through Qloo." },
  { name: "Sam", who: "Maya’s partner", what: "The alert he got this morning, without the private detail, and what Maya shares with him." },
  { name: "Dr Lee", who: "Maya’s OB-GYN", what: "What Maya reported, her blood pressure and her own words, and marking the alert seen." },
];

// The way in for judges and the curious: a fresh demo family of their own, with synthetic data, in one click.
export default function Demo() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8">
      <Link href="/" aria-label="Momwell home">
        <Logo size={32} />
      </Link>
      <header className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-5xl leading-tight">Meet Maya’s family.</h1>
        <p className="text-xl leading-relaxed text-ink-soft">
          One click opens Momwell as Maya, with her partner and her OB-GYN a tap away. It’s your own copy with made-up data, so try anything: it’s cleared after two days.
        </p>
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
      <StartDemo />
      <p className="text-sm text-ink-soft">Momwell does not give medical advice. In an emergency, call 911.</p>
    </main>
  );
}
