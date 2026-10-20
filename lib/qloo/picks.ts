// What the companion's Qloo tools return: gentle shows, food near her with the FDA's notes, calm music. One place for
// both callers: the eve agent's tools (find_shows, find_food, find_music) and Talk's rules, which call the same tools
// straight away for the requests they recognise. They ask Qloo exactly what her For you page asks (eight of each), so
// the answers come from the same cache.
import { FDA_SOURCE } from "../food/fda.ts";
import { idsOf, type Taste } from "../taste/taste.ts";
import { nearbyFood } from "./food.ts";
import { birthPlaylist } from "./music.ts";
import { safeWatch } from "./safewatch.ts";

export type Pick = { name: string; image: string | null; address?: string | null; askFor?: string[] };
export type Picks = { from?: "Qloo"; source?: string; picks: Pick[]; next?: string };

export async function showPicks(taste: Taste | null, kind: "tv_show" | "movie" = "tv_show"): Promise<Picks> {
  const watched = idsOf(taste, ["tv_show", "movie"]);
  const ids = watched.length ? watched : idsOf(taste);
  if (!ids.length) return { picks: [], next: "Ask what shows or films she loves, then use remember_love." };
  const picks = (await safeWatch(ids, kind, 8)).slice(0, 6);
  return { from: "Qloo", picks: picks.map((p) => ({ name: p.name, image: p.properties?.image?.url ?? null })) };
}

export async function foodPicks(taste: Taste | null): Promise<Picks> {
  if (!taste?.city) return { picks: [], next: "Ask which city she lives in; she can add it on the What you love page." };
  const meals = (await nearbyFood(idsOf(taste), taste.city, taste.diets, 8)).slice(0, 6);
  return {
    from: "Qloo",
    source: FDA_SOURCE.url,
    picks: meals.map((m) => ({ name: m.entity.name, address: m.entity.properties?.address ?? null, image: m.entity.properties?.image?.url ?? null, askFor: m.notes.map((n) => n.text) })),
  };
}

export async function musicPicks(taste: Taste | null): Promise<Picks> {
  const artists = idsOf(taste, ["artist"]);
  const ids = artists.length ? artists : idsOf(taste);
  if (!ids.length) return { picks: [], next: "Ask which artists she loves, then use remember_love." };
  const picks = await birthPlaylist(ids, 8);
  return { from: "Qloo", picks: picks.map((p) => ({ name: p.name, image: p.properties?.image?.url ?? null })) };
}
