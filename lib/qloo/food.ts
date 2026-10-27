// Places to eat near her, ranked by her taste, fitting her diet, with the FDA notes for each. Qloo's place results
// pass through plain rules before she sees one: a real meal (not only coffee or ice cream), not a bar, not a business
// that merely has a café in it (a mall, an event hall, a club), and for a vegetarian, not a steakhouse with a salad.
import { notesFor, DIETS, type Diet, type FoodNote } from "../food/fda.ts";
import { insights, placesToTry, tagId, type Entity } from "./api.ts";

// A place built around drinking, even with a kitchen.
const NIGHTLIFE = /^(sports_bar|wine_bar|cocktail_bar|piano_bar|pub|irish_pub|night_?club|nightlife|lounge|brewery|brewpub|beer_garden|beer_hall|hookah|hookah_bar|karaoke|dive_bar|gay_bar|music_venue|live_music_venue|dance_hall|tavern|distillery|winery|taproom|saloon|speakeasy)$/;
// Somewhere that isn't a restaurant, even when Qloo also tags a café or a counter inside it.
const NOT_FOOD =
  /^(shopping|shopping_mall|department_store|.*clothing_store|shoe_store|gift_shop|candy_store|grocery_store|supermarket|convenience_store|gas_station|banquet_hall|amusement_park|amusement_center|playground|.*party_.*|party_planner|.*_lessons|.*bicycle.*|hotel|casino|stadium|arena|gym|fitness_center|movie_theater|bowling_alley|golf_course|park|festival|.*club|university|college|school)$/;
// A restaurant can also have a bar, host weddings or be a landmark (RA Sushi, El Arroyo). These count against a place
// only when Qloo names no kitchen beside them.
const ALSO = /^(bar|lounge_bar|event_venue|wedding_venue|tourist_attraction|market|cultural_landmark|historical_landmark|general_store)$/;
// Food, but not a meal on its own: what she'd bring home for dinner is a restaurant. Matched on word parts, because Qloo
// spells one kind several ways (cake_shop, wedding_bakery, bubble_tea_store). A bar & grill counts only with a real
// kitchen kind beside it (seafood, fine dining), not alone.
const SNACK = /(bar_grill|cafe|coffee|espresso|tea_house|tea_store|tea_room|bubble_tea|juice|dessert|ice_cream|yogurt|donut|doughnut|bakery|(^|_)cake|patisserie|pastry|candy|chocolate|caterer)/;
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
  const meals = [...k.restaurant, ...k.category.filter((x) => MEAL_CATEGORY.test(x))]
    .map((x) => x.replace(/_restaurant$/, ""))
    .filter((x) => !SNACK.test(x) && !ALSO.test(x));
  if (meals.some((x) => x !== "restaurant")) return true;
  // Only Qloo's plain "restaurant": enough on its own, not beside a bar, a café, a venue or a market.
  return meals.length > 0 && !k.all.some((x) => ALSO.test(x) || SNACK.test(x));
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
