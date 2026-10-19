import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppPage } from "@/components/AppPage";
import { FDA_SOURCE } from "@/lib/food/fda";
import { nearbyFood } from "@/lib/qloo/food";
import { birthPlaylist } from "@/lib/qloo/music";
import { safeWatch } from "@/lib/qloo/safewatch";
import type { Entity } from "@/lib/qloo/api";
import { requireMe } from "@/lib/people/me";
import { idsOf, type Taste } from "@/lib/taste/taste";

function FromQloo() {
  return <p className="text-xs font-semibold tracking-wider text-ink-soft uppercase">From Qloo</p>;
}

function Tile({ e, children }: { e: Entity; children?: React.ReactNode }) {
  const img = e.properties?.image?.url;
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-paper-raised transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(31,26,46,0.35)]">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element -- Qloo's image hosts vary; a plain img avoids allow-listing each
        <img src={img} alt="" loading="lazy" className="aspect-[4/3] w-full bg-brand-soft object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-brand-soft to-honey/30" aria-hidden="true">
          <span className="font-signature text-6xl text-brand">{e.name.slice(0, 1)}</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="leading-snug font-semibold">{e.name}</h3>
        {children}
      </div>
    </article>
  );
}

function Shelf({ title, note, items, render }: { title: string; note: string; items: Entity[]; render?: (e: Entity) => React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl">{title}</h2>
          <p className="text-ink-soft">{note}</p>
        </div>
        <FromQloo />
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((e) => (
            <Tile key={e.entity_id} e={e}>
              {render?.(e)}
            </Tile>
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-6 text-ink-soft">Add a few more things you love to see picks here.</p>
      )}
    </section>
  );
}

async function Watch({ ids }: { ids: string[] }) {
  return <Shelf title="Safe Watch" note="Shows like the ones you love, with loss, grief and pregnancy scares left out." items={await safeWatch(ids, "tv_show", 8)} />;
}

async function Music({ ids }: { ids: string[] }) {
  return <Shelf title="Your birth playlist" note="Calm artists for the hospital bag, from the music you already play." items={await birthPlaylist(ids, 8)} />;
}

async function Food({ ids, taste }: { ids: string[]; taste: Taste }) {
  if (!taste.city) return <p className="rounded-3xl border border-dashed border-line p-6 text-ink-soft">Add your city to see places to eat near you.</p>;
  const meals = await nearbyFood(ids, taste.city, taste.diets, 8);
  const notes = new Map(meals.map((m) => [m.entity.entity_id, m.notes]));
  return (
    <div className="flex flex-col gap-3">
      <Shelf
        title={`Food near ${taste.city.split(",")[0]}`}
        note="Places that fit your taste and the way you eat, with what to ask for while you’re pregnant."
        items={meals.map((m) => m.entity)}
        render={(e) => (
          <>
            <p className="text-sm text-ink-soft">{e.properties?.address}</p>
            {notes.get(e.entity_id)?.map((n) => (
              <p key={n.id} className="rounded-xl bg-honey/20 px-3 py-2 text-sm">
                {n.text}
              </p>
            ))}
          </>
        )}
      />
      <a href={FDA_SOURCE.url} target="_blank" rel="noreferrer" className="text-sm text-ink-soft underline underline-offset-4">
        {FDA_SOURCE.title}
      </a>
    </div>
  );
}

function Loading({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-4" aria-busy="true">
      <h2 className="text-2xl">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-brand-soft" />
        ))}
      </div>
    </section>
  );
}

// Made for her today, from what she loves: each shelf loads on its own so a slow answer never holds the page.
export default async function ForYou() {
  const { db, me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", me.id).maybeSingle();
  const taste = data as Taste | null;
  const ids = idsOf(taste);
  const watchIds = idsOf(taste, ["tv_show", "movie"]);
  const musicIds = idsOf(taste, ["artist"]);

  return (
    <AppPage>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl">Made for you</h1>
          <p className="text-lg text-ink-soft">From what you love, through Qloo’s taste intelligence.</p>
        </div>
        <Link href="/taste" className="btn-quiet">
          {ids.length ? "Change what I love" : "Tell us what you love"}
        </Link>
      </header>
      {!taste || !ids.length ? (
        <section className="rounded-[32px] bg-brand-soft p-8">
          <h2 className="text-2xl">Start with a few favourites</h2>
          <p className="mt-2 max-w-xl text-ink-soft">Pick a couple of shows and artists you love and your city. Momwell will find gentle shows, a calm birth playlist and food that’s safe to enjoy.</p>
          <Link href="/taste" className="btn mt-6 w-auto px-8">
            Tell us what you love
          </Link>
        </section>
      ) : (
        <>
          <Suspense fallback={<Loading title="Safe Watch" />}>
            <Watch ids={watchIds.length ? watchIds : ids} />
          </Suspense>
          <Suspense fallback={<Loading title="Food near you" />}>
            <Food ids={ids} taste={taste} />
          </Suspense>
          <Suspense fallback={<Loading title="Your birth playlist" />}>
            <Music ids={musicIds.length ? musicIds : ids} />
          </Suspense>
        </>
      )}
    </AppPage>
  );
}
