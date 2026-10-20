import Link from "next/link";
import { Suspense } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { safeWatch } from "@/lib/qloo/safewatch";
import { idsOf, type Taste } from "@/lib/taste/taste";

type Tile = { href: string; title: string; status: React.ReactNode; tone: "brand" | "honey" | "alarm" | "soft"; icon: string };

const TONE: Record<Tile["tone"], string> = {
  brand: "bg-brand text-on-brand",
  honey: "bg-honey/30 text-ink",
  alarm: "bg-alarm-soft text-[var(--alarm)]",
  soft: "bg-brand-soft text-brand",
};

// Simple line icons, one path each.
const ICONS: Record<string, string> = {
  talk: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z",
  qloo: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z",
  help: "M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.5 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21Z",
  mood: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-7a4.5 4.5 0 0 0 7 0M9 10h.01M15 10h.01",
  baby: "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 16c0-3.3 2.7-6 6-6s6 2.7 6 6",
  care: "M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z",
};

function TileCard({ t }: { t: Tile }) {
  return (
    <Link href={t.href} className="card group flex flex-col gap-3 p-4 sm:p-5">
      <span className={`flex size-10 items-center justify-center rounded-2xl ${TONE[t.tone]}`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS[t.icon]} />
        </svg>
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-semibold leading-snug">{t.title}</span>
        <span className="text-sm leading-snug text-ink-soft">{t.status}</span>
      </span>
    </Link>
  );
}

// One Qloo pick by name, from the same cached query as her For you page.
async function QlooPick({ db, motherId }: { db: SupabaseClient; motherId: string }) {
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", motherId).maybeSingle();
  const ids = idsOf(data as Taste | null);
  if (!ids.length) return <>Tell us what you love, and Qloo finds gentle shows, food and music</>;
  const [pick] = await safeWatch(ids, "tv_show", 8);
  return pick ? <>Tonight: {pick.name}, a gentle pick from what you love</> : <>Gentle shows, food near you and calm music</>;
}

export type ShowcaseFacts = {
  motherId: string;
  helpLine: string;
  moodDue: boolean;
  lastMood: string | null;
  baby: { born: boolean; age: string | null };
  careTeam: string | null;
};

// Everything Momwell does for her, at a glance, each with what's true today: the first thing a new visitor sees.
export function Showcase({ db, facts }: { db: SupabaseClient; facts: ShowcaseFacts }) {
  const tiles: Tile[] = [
    { href: "/talk", title: "Talk to Momwell", status: "Answers at once; warning signs go to the rules, never a guess", tone: "brand", icon: "talk" },
    {
      href: "/for-you",
      title: "For you, through Qloo",
      status: (
        <Suspense fallback="Picked from what you love">
          <QlooPick db={db} motherId={facts.motherId} />
        </Suspense>
      ),
      tone: "honey",
      icon: "qloo",
    },
    { href: "/help", title: "Help from your people", status: facts.helpLine, tone: "soft", icon: "help" },
    { href: "/mood", title: "Mood check", status: facts.moodDue ? "Due now · two minutes, the questions doctors use" : `Done ${facts.lastMood} · next in two weeks`, tone: facts.moodDue ? "alarm" : "soft", icon: "mood" },
    {
      href: "/baby",
      title: facts.baby.born ? "Your baby" : "After the birth",
      status: facts.baby.born ? `${facts.baby.age} · check on your baby’s warning signs` : "Baby check-ins for the whole first year",
      tone: "soft",
      icon: "baby",
    },
    { href: "/people", title: "Your care team", status: facts.careTeam ? `${facts.careTeam} sees your check-ins and alerts` : "Invite your doctor to see your check-ins", tone: "soft", icon: "care" },
  ];
  return (
    <section aria-label="Everything Momwell does for you" className="flex flex-col gap-3">
      <h2 className="text-2xl">Everything Momwell does for you</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((t) => (
          <TileCard key={t.href} t={t} />
        ))}
      </div>
    </section>
  );
}
