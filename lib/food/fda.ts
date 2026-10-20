// What to watch for at a place, from the FDA's advice for pregnancy, matched to its Qloo cuisine and genre tags.
// Plain rules, never the model. Each note names one thing to ask for, not a diagnosis or a ban on the place.
export const FDA_SOURCE = {
  title: "FDA: People at risk of foodborne illness (pregnancy)",
  url: "https://www.fda.gov/food/consumers/people-risk-foodborne-illness",
  checked: "2026-10-19",
};

export type FoodNote = { id: string; text: string };

const RULES: { id: string; match: RegExp; text: string }[] = [
  { id: "raw_fish", match: /sushi|sashimi|poke|japanese|raw_bar|oyster|ceviche/, text: "Choose cooked rolls and dishes: raw fish and raw shellfish are on the FDA’s avoid list in pregnancy." },
  { id: "seafood", match: /seafood|fish/, text: "Pick seafood that’s cooked through, not raw or partly cooked." },
  { id: "cold_cuts", match: /sandwich|deli|charcuterie|sub_shop/, text: "Cold cuts only if they’re heated until steaming hot." },
  { id: "soft_cheese", match: /mexican|latin|french|italian|cheese|pizza|neapolitan/, text: "Ask that soft cheeses (queso fresco, brie, fresh mozzarella) are made with pasteurized milk." },
  { id: "meat", match: /steak|burger|barbecue|bbq|grill|korean/, text: "Order meat cooked through, not rare or pink." },
  { id: "eggs", match: /brunch|breakfast|diner|bakery/, text: "Eggs cooked until yolks and whites are firm; skip anything with raw egg." },
  { id: "juice", match: /juice|smoothie/, text: "Only pasteurized juice." },
  { id: "sprouts", match: /salad|vegan|vegetarian|healthy|poke/, text: "Ask for no raw sprouts." },
];

// Only what kind of place it is counts: its cuisines and restaurant genres, not every dish or offering Qloo lists.
const KIND = /^urn:tag:(cuisine:qloo|genre:place:restaurant):/;

// What her diet already rules out, so a note about it would only be noise: no meat or fish for a vegetarian, and no
// cheese or eggs either for a vegan.
const SKIP: Partial<Record<Diet, string[]>> = {
  vegetarian: ["raw_fish", "seafood", "cold_cuts", "meat"],
  vegan: ["raw_fish", "seafood", "cold_cuts", "meat", "soft_cheese", "eggs"],
};

/** The FDA notes for a place, from its tag ids, for her diet: the most important first, at most `max`. */
export function notesFor(tagIds: string[], max = 2, diets: Diet[] = []): FoodNote[] {
  const words = tagIds.filter((t) => KIND.test(t)).map((t) => t.split(":").slice(3).join(":")).join(" ");
  const skip = new Set(diets.flatMap((d) => SKIP[d] ?? []));
  return RULES.filter((r) => !skip.has(r.id) && r.match.test(words)).slice(0, max).map(({ id, text }) => ({ id, text }));
}

// Diets she can pick, as Qloo's dietary tags.
export const DIETS = {
  vegetarian: "urn:tag:dietary_option:qloo:vegetarian",
  vegan: "urn:tag:dietary_option:qloo:vegan",
  gluten_free: "urn:tag:dietary_option:qloo:gluten_free",
  halal: "urn:tag:dietary_option:qloo:halal",
  kosher: "urn:tag:dietary_option:qloo:kosher",
} as const;
export type Diet = keyof typeof DIETS;
