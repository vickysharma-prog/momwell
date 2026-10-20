import Link from "next/link";
import { Suspense } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QlooBadge } from "@/components/QlooBadge";
import { foodPicks, showPicks } from "@/lib/qloo/picks";
import type { Taste } from "@/lib/taste/taste";

const TONE = { brand: "bg-brand text-on-brand", alarm: "bg-[var(--alarm)] text-white", honey: "bg-honey/30 text-ink", soft: "bg-brand-soft text-brand" } as const;
const ICON = {
  call: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  help: "M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.5 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21Z",
  qloo: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z",
  signs: "M12 3 2.5 20h19L12 3ZM12 10v4M12 17h.01",
} as const;

function Tile({ href, title, status, tone, icon }: { href: string; title: string; status: React.ReactNode; tone: keyof typeof TONE; icon: keyof typeof ICON }) {
  const qloo = icon === "qloo";
  const inner = (
    <>
      <span className={`flex size-10 items-center justify-center rounded-2xl ${TONE[tone]}`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICON[icon]} />
        </svg>
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-semibold leading-snug">{title}</span>
        <span className="text-sm leading-snug text-ink-soft">{status}</span>
        {qloo && <QlooBadge className="mt-1 self-start" />}
      </span>
    </>
  );
  return href.startsWith("tel:") ? (
    <a href={href} className="card group flex flex-col gap-3 p-4 sm:p-5">
      {inner}
    </a>
  ) : (
    <Link href={href} className="card group flex flex-col gap-3 p-4 sm:p-5">
      {inner}
    </Link>
  );
}

// A night in she'd love, from her taste through Qloo: the same cached picks as her own For you page.
async function NightIn({ db, motherId }: { db: SupabaseClient; motherId: string }) {
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", motherId).maybeSingle();
  const taste = data as Taste | null;
  if (!taste) return <>Her favourite shows and food, once she adds them</>;
  const [show, food] = await Promise.all([showPicks(taste).catch(() => null), foodPicks(taste).catch(() => null)]);
  const s = show?.picks[0]?.name;
  const f = food?.picks[0]?.name;
  return s || f ? <>A night in: {[s, f && `dinner from ${f}`].filter(Boolean).join(", with ")}</> : <>Gentle shows and food she’d love</>;
}

export type CircleFacts = { mom: { id: string; name: string; phone: string | null }; unseen: number; asks: number; mine: string | null };

// Everything her partner or family can do today, at a glance: call her, take something off her plate, plan a night
// in she'd love, and know the signs.
export function CircleShowcase({ db, facts }: { db: SupabaseClient; facts: CircleFacts }) {
  const { mom } = facts;
  return (
    <section aria-label={`How you can help ${mom.name}`} className="flex flex-col gap-3">
      <h2 className="text-2xl">How you can help {mom.name}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {mom.phone && <Tile href={`tel:${mom.phone}`} title={`Call ${mom.name}`} status={facts.unseen ? "She needs you to check on her now" : "One tap away"} tone={facts.unseen ? "alarm" : "brand"} icon="call" />}
        <Tile href="/help" title="Take something on" status={facts.asks ? `${facts.asks} ${facts.asks === 1 ? "ask" : "asks"} today${facts.mine ? ` · you have ${facts.mine}` : ""}` : "Nothing asked yet today"} tone="soft" icon="help" />
        <Tile
          href="/help"
          title="Something she’d love, through Qloo"
          status={
            <Suspense fallback="Picked from what she loves">
              <NightIn db={db} motherId={mom.id} />
            </Suspense>
          }
          tone="honey"
          icon="qloo"
        />
        <Tile href="/signs" title="Know her warning signs" status="Which mean 911, which mean her doctor now" tone="soft" icon="signs" />
      </div>
    </section>
  );
}
