// Safe Watch: shows, films and music picked from what she loves, with themes that can hurt in pregnancy and the year
// after birth taken out. Qloo filters them by tag; we check the tags again on what comes back, so a missed filter
// never reaches her.
import { insights, tagId, type Entity } from "./api.ts";

// Found by searching Qloo's tags (19 Oct 2026). Everwood carries death_of_mother, Chasing Life cancer; Fleishman Is in
// Trouble divorce (22 Oct): a marriage ending is a hard watch in the year after birth.
export const AVOID_TAGS = [
  "urn:tag:keyword:media:death_of_mother",
  "urn:tag:keyword:media:unplanned_pregnancy",
  "urn:tag:keyword:qloo:pregnancy",
  "urn:tag:theme:qloo:pregnancy",
  "urn:tag:subgenre:qloo:pregnancy",
  "urn:tag:keyword:qloo:childbirth",
  "urn:tag:keyword:qloo:abortion",
  "urn:tag:keyword:qloo:grief",
  "urn:tag:theme:qloo:grief",
  "urn:tag:theme:qloo:grief_and_healing",
  "urn:tag:keyword:qloo:suicide",
  "urn:tag:keyword:qloo:domestic_violence",
  "urn:tag:keyword:qloo:terminal_illness",
  "urn:tag:keyword:qloo:cancer",
  "urn:tag:genre:media:death",
  "urn:tag:genre:media:horror",
  "urn:tag:keyword:qloo:horror",
  "urn:tag:theme:qloo:horror",
  "urn:tag:theme:qloo:tragedy",
  "urn:tag:keyword:qloo:tragedy",
  "urn:tag:keyword:qloo:divorce",
] as const;

// What comes back is checked by the theme itself, whichever of Qloo's namespaces carries it (Ginny & Georgia has
// keyword:media:self_harm, not keyword:qloo:self_harm), and for a few themes the request above doesn't name.
export const AVOID_THEMES = new Set([
  ...AVOID_TAGS.map((t) => t.split(":").at(-1)!),
  "self_harm",
  "teen_pregnancy",
  "unwanted_pregnancy",
  "miscarriage",
  "stillbirth",
  "infertility",
  "child_death",
  "death_of_child",
  "end_of_a_marriage",
  "infidelity",
  "postpartum_depression",
]);
const KINDS = new Set(["keyword", "theme", "subgenre", "genre", "plot"]);
export const isSafe = (e: Entity) =>
  !(e.tags ?? []).some((t) => {
    const parts = tagId(t).split(":");
    return KINDS.has(parts[2]) && AVOID_THEMES.has(parts.at(-1)!);
  });

export type Kind = "tv_show" | "movie";

/** Shows or films like the ones she loves, without the themes above. */
export async function safeWatch(likedIds: string[], kind: Kind = "tv_show", take = 8): Promise<Entity[]> {
  if (!likedIds.length) return [];
  const found = await insights({
    "filter.type": `urn:entity:${kind}`,
    "signal.interests.entities": likedIds.join(","),
    "filter.exclude.tags": AVOID_TAGS.join(","),
    take: take + 6,
  });
  return found.filter((e) => isSafe(e) && !likedIds.includes(e.entity_id)).slice(0, take);
}
