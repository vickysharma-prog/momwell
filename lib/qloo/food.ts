// Places to eat near her, ranked by her taste, fitting her diet, with the FDA notes for each. No bars: a night out
// for drinks isn't what she's after.
import { notesFor, DIETS, type Diet, type FoodNote } from "../food/fda.ts";
import { insights, placesToTry, tagId, type Entity } from "./api.ts";

const NIGHTLIFE = /:(bar|sports_bar|wine_bar|cocktail_bar|pub|night_?club|nightlife|lounge|brewery|brewpub|beer_garden|hookah|karaoke|dive_bar|gay_bar|music_venue|tavern)$/;

/** A place to eat, not a place to drink. */
export const isEatery = (e: Entity) => !(e.tags ?? []).some((t) => NIGHTLIFE.test(tagId(t)));

export type Meal = { entity: Entity; notes: FoodNote[] };

export async function nearbyFood(likedIds: string[], location: string, diets: Diet[] = [], take = 6): Promise<Meal[]> {
  const tags = ["urn:tag:genre:place:restaurant", ...diets.map((d) => DIETS[d])];
  for (const place of placesToTry(location)) {
    const found = await insights({
      "filter.type": "urn:entity:place",
      "filter.tags": tags.join(","),
      "operator.filter.tags": "intersection",
      "filter.location.query": place,
      "signal.interests.entities": likedIds.join(",") || undefined,
      take: take * 4,
    });
    const eat = found.filter(isEatery).slice(0, take);
    if (eat.length) return eat.map((entity) => ({ entity, notes: notesFor((entity.tags ?? []).map(tagId)) }));
  }
  return [];
}
