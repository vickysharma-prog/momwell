// Shapes taken from real Qloo place results (Austin, Brooklyn and Houston, Oct 2026).
import assert from "node:assert/strict";
import { test } from "node:test";
import { fitsDiet, isMealPlace } from "./food.ts";

const place = (name: string, ...kinds: string[]) => ({
  entity_id: name,
  name,
  tags: kinds.map((k) => ({ id: k.includes(":") ? `urn:tag:${k}` : `urn:tag:genre:place:restaurant:${k}` })),
});

test("restaurants stay: pizza, Chinese, a buffet, breakfast, a sandwich shop, a vegan curbside", () => {
  for (const p of [
    place("Roppolo's Pizzeria", "pizza_takeout", "italian", "genre:place:restaurant", "category:place:pizza_restaurant"),
    place("Jimmy's House", "chinese", "asian", "genre:place:restaurant"),
    place("Kins Dining", "buffet", "category:place:buffet_restaurant"),
    place("The Breakfast Klub", "breakfast", "category:place:breakfast_restaurant"),
    place("Subway", "sandwich_shop", "fast_food", "caterer", "category:place:sandwich_shop"),
    place("Arlo's Curbside", "vegan", "category:place:vegan_restaurant"),
    place("A steakhouse", "category:place:steak_house", "genre:place:restaurant"),
  ])
    assert.equal(isMealPlace(p), true, p.name);
});

test("businesses that only have food inside are left out: a mall, an event hall, a park, a bike shop, a class, a club", () => {
  for (const p of [
    place("Westfield World Trade Center", "genre:place:restaurant", "genre:place:shopping_mall", "category:place:department_store", "genre:place:shopping"),
    place("Coppertank Events Center", "banquet_hall", "genre:place:event_venue", "category:place:banquet_hall"),
    place("Fairytale Island", "cafe", "genre:place:amusement_park", "category:place:childrens_party_service"),
    place("Flat Track Coffee", "cafe", "genre:place:bicycle_shop", "category:place:electric_bicycle_store"),
    place("Honey Art Cafe", "coffee_shop", "art_cafe", "genre:place:painting_lessons"),
    place("Little Italy", "genre:place:restaurant", "category:place:restaurant", "genre:place:market", "genre:place:tourist_attraction"),
    place("Faculty Club", "american", "genre:place:university", "category:place:social_club"),
    place("Araya Artisan Chocolate", "dessert_shop", "genre:place:gift_shop", "category:place:candy_store"),
  ])
    assert.equal(isMealPlace(p), false, p.name);
});

test("coffee, ice cream and cake aren't dinner", () => {
  for (const p of [
    place("Starbucks", "coffee_shop", "cafe", "espresso_bar", "genre:place:restaurant", "genre:place:coffee_store"),
    place("Amy's Ice Creams", "dessert_shop", "ice_cream_shop", "genre:place:restaurant", "category:place:ice_cream_shop"),
    place("Rocheli Patisserie", "bakery", "genre:place:restaurant", "category:place:bakery"),
    place("Bae", "frozen_yogurt_shop", "dessert_shop", "category:place:frozen_yogurt_shop"),
  ])
    assert.equal(isMealPlace(p), false, p.name);
});

test("bars and pubs are left out, even with a kitchen", () => {
  assert.equal(isMealPlace(place("Sports bar", "sports_bar", "american")), false);
  assert.equal(isMealPlace(place("A pub", "pub")), false);
  assert.equal(isMealPlace(place("Hookah", "mediterranean", "category:place:hookah_bar")), false);
  assert.equal(isMealPlace(place("Widow Jane Distillery", "distillery", "genre:place:restaurant", "category:place:distillery")), false);
  assert.equal(isMealPlace(place("Moonshine Deck", "bar_grill", "genre:place:restaurant", "category:place:bar_grill")), false);
  assert.equal(isMealPlace(place("Loose Caboose", "hamburger", "category:place:hamburger_restaurant")), true);
  // A grill that also has a bar is still a restaurant.
  assert.equal(isMealPlace(place("McCormick's", "bar_grill", "seafood", "category:place:fine_dining_restaurant")), true);
});

test("a restaurant that also has a bar or hosts events stays, when Qloo names its kitchen", () => {
  for (const p of [
    place("Aba Austin", "bar", "mediterranean", "genre:place:restaurant", "category:place:bar", "category:place:mediterranean_restaurant"),
    place("Citizen Eatery", "vegetarian", "vegan", "bar", "gastropub", "category:place:bar", "category:place:vegetarian_restaurant"),
    place("RA Sushi", "bar", "sushi", "japanese", "category:place:bar", "category:place:sushi_restaurant"),
    place("Clark's Oyster Bar", "bar", "seafood", "oyster_bar", "category:place:bar", "category:place:seafood_restaurant"),
    place("El Arroyo", "bar", "tex_mex", "genre:place:tourist_attraction", "category:place:event_venue", "category:place:tex_mex_restaurant"),
    place("Kaskade", "polish", "genre:place:event_venue", "category:place:polish_restaurant"),
    place("Jacoby's", "southern_restaurant_us", "genre:place:general_store", "category:place:american_restaurant"),
    place("La Condesa", "mexican", "bar", "lounge_bar", "category:place:mexican_restaurant"),
  ])
    assert.equal(isMealPlace(p), true, p.name);
});

test("a bar, a venue or a landmark with only Qloo's plain restaurant tag isn't shown", () => {
  for (const p of [
    place("The Lucky Duck", "bar", "genre:place:restaurant", "category:place:restaurant", "category:place:bar"),
    place("Lost & Found", "bar_grill", "genre:place:restaurant", "category:place:restaurant", "category:place:bar_grill"),
    place("Seaside Lounge", "bar", "bar_grill", "category:place:bar"),
    place("Tea Kettle Cafe", "tea_house", "cafe", "category:place:restaurant", "category:place:event_venue", "genre:place:tea_store"),
    place("The Crown", "bar", "lounge_bar", "category:place:bar"),
  ])
    assert.equal(isMealPlace(p), false, p.name);
  assert.equal(isMealPlace(place("Austin Taco Project", "genre:place:restaurant", "category:place:restaurant")), true);
});

test("cake shops, bubble tea, juice and coffee roasters aren't dinner, in any of Qloo's spellings", () => {
  for (const p of [
    place("Lady Quack's Bakery and Cake Shop", "bakery", "coffee_shop", "cake_shop", "wedding_bakery", "category:place:cake_shop"),
    place("The Berry Bar", "frozen_yogurt_shop", "bubble_tea_store", "category:place:bubble_tea_store"),
    place("A juice shop", "juice_shop", "category:place:juice_shop"),
    place("A coffee roaster", "coffee_roastery", "genre:place:restaurant", "category:place:coffee_roastery"),
  ])
    assert.equal(isMealPlace(p), false, p.name);
});

test("wine bars, beer halls, cocktail bars and clubs are left out even with a kitchen", () => {
  for (const p of [
    place("June's", "wine_bar", "american", "category:place:american_restaurant"),
    place("A beer hall", "beer_hall", "german", "category:place:german_restaurant"),
    place("Oasis", "bar", "seafood", "category:place:cocktail_bar", "category:place:american_restaurant"),
    place("Trinity Place", "irish_pub", "american", "category:place:american_restaurant"),
    place("Belle Station", "brunch", "genre:place:night_club", "category:place:brunch_restaurant"),
    place("A movie theater", "american", "genre:place:movie_theater", "category:place:american_restaurant"),
  ])
    assert.equal(isMealPlace(p), false, p.name);
});

test("a place with no restaurant kind at all isn't shown", () => {
  assert.equal(isMealPlace(place("Mystery", "genre:place:restaurant")), false);
  assert.equal(isMealPlace({ entity_id: "x", name: "x" }), false);
});

test("for a vegetarian or vegan, no steakhouse or seafood place; anyone else, any restaurant", () => {
  const steak = place("Morton's", "steak_house", "american", "category:place:steak_house");
  const seafood = place("McCormick's", "bar_grill", "seafood");
  const bbq = place("Smokehouse", "category:place:barbecue_restaurant");
  const thai = place("Thai Kitchen", "thai");
  for (const p of [steak, seafood, bbq]) {
    assert.equal(fitsDiet(p, ["vegetarian"]), false, p.name);
    assert.equal(fitsDiet(p, ["vegan"]), false, p.name);
    assert.equal(fitsDiet(p, ["halal"]), true, p.name);
    assert.equal(fitsDiet(p, []), true, p.name);
  }
  assert.equal(fitsDiet(thai, ["vegetarian"]), true);
});
