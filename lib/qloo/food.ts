// Places to eat near her, ranked by her taste, fitting her diet, with the FDA notes for each. Qloo's place results
// pass through plain rules before she sees one: a real meal (not only coffee or ice cream), not a bar, not a business
// that merely has a café in it (a mall, an event hall, a club), and for a vegetarian, not a steakhouse with a salad.
import { notesFor, DIETS, type Diet, type FoodNote } from "../food/fda.ts";
import { insights, placesToTry, tagId, type Entity } from "./api.ts";

const NIGHTLIFE = /^(bar|sports_bar|wine_bar|cocktail_bar|pub|night_?club|nightlife|lounge|brewery|brewpub|beer_garden|hookah|hookah_bar|karaoke|dive_bar|gay_bar|music_venue|tavern|distillery|winery|taproom|saloon|speakeasy)$/;
// Somewhere that isn't a restaurant, even when Qloo also tags a café or a counter inside it.
const NOT_FOOD =
  /^(shopping|shopping_mall|department_store|.*clothing_store|shoe_store|gift_shop|candy_store|grocery_store|supermarket|convenience_store|gas_station|market|event_venue|banquet_hall|wedding_venue|amusement_park|amusement_center|playground|.*party_.*|party_planner|tourist_attraction|.*_lessons|.*bicycle.*|hotel|casino|stadium|arena|gym|fitness_center|movie_theater|bowling_alley|golf_course|.*club|university|college|school)$/;
// Food, but not a meal on its own: what she'd bring home for dinner is a restaurant. A bar & grill counts only with a
// real kitchen kind beside it (seafood, fine dining), not alone.
const SNACK = /^(bar_grill|cafe|coffee_shop|coffee_store|espresso_bar|internet_cafe|art_cafe|tea_house|bubble_tea|juice_bar|dessert_shop|ice_cream_shop|frozen_yogurt_shop|donut_shop|bakery|patisserie|candy_store|chocolate_shop|caterer|banquet_hall)$/;
const MEAL_CATEGORY = /(_restaurant|^restaurant|^steak_house|^diner|^deli|^bistro|^sandwich_shop|^buffet)$/;
const MEAT_CENTERED = /(steak|seafood|bbq|barbecue|churrascaria|chicken_wings|wings|hot_dog|oyster|crab|fish_and_chips)/;
const VEG = /(vegetarian|vegan)/;

/** The kinds of place Qloo says this is: "italian", "coffee_shop", "shopping_mall"… from its genre and category tags. */
function kindsOf(e: Entity) {
  const ids = (e.tags ?? []).map(tagId);
  const restaurant = ids.flatMap((t) => t.match(/^urn:tag:genre:place:restaurant:([a-z_]+)$/)?.[1] ?? []);
  const category = ids.flatMap((t) => t.match(/^urn:tag:category:place:([a-z_]+)$/)?.[1] ?? []);
  const other = ids.flatMap((t) => t.match(/^urn:tag:genre:place:([a-z_]+)$/)?.[1] ?? []).filter((k) => k !== "restaurant");
  return { restaurant, category, all: [...restaurant, ...category, ...other] };
}

/** A place to sit down to a meal, or to bring one home from. */
export function isMealPlace(e: Entity) {
  const k = kindsOf(e);
  if (k.all.some((x) => NIGHTLIFE.test(x) || NOT_FOOD.test(x))) return false;
  return k.restaurant.some((x) => !SNACK.test(x)) || k.category.some((x) => MEAL_CATEGORY.test(x) && !SNACK.test(x.replace(/_restaurant$/, "")));
}

/** Her diet, kept: for a vegetarian or vegan, no place built around meat or fish. */
export const fitsDiet = (e: Entity, diets: Diet[]) => !diets.some((d) => d === "vegetarian" || d === "vegan") || !kindsOf(e).all.some((x) => MEAT_CENTERED.test(x));

const vegFirst = (e: Entity) => (kindsOf(e).all.some((x) => VEG.test(x)) ? 0 : 1);

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
    const veg = diets.includes("vegetarian") || diets.includes("vegan");
    // A stable sort keeps Qloo's taste order within each group.
    const eat = found
      .filter((e) => isMealPlace(e) && fitsDiet(e, diets))
      .sort((a, b) => (veg ? vegFirst(a) - vegFirst(b) : 0))
      .slice(0, take);
    if (eat.length) return eat.map((entity) => ({ entity, notes: notesFor((entity.tags ?? []).map(tagId), 2, diets) }));
  }
  return [];
}
