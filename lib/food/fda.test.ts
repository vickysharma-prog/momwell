import assert from "node:assert/strict";
import { test } from "node:test";
import { notesFor } from "./fda.ts";

const ids = (tags: string[]) => notesFor(tags).map((n) => n.id);

test("a sushi place says to choose cooked rolls", () => {
  assert.ok(ids(["urn:tag:genre:place:restaurant:sushi", "urn:tag:cuisine:qloo:japanese"]).includes("raw_fish"));
});

test("a deli says cold cuts only if steaming hot", () => {
  assert.deepEqual(ids(["urn:tag:genre:place:restaurant:sandwich_shop"]), ["cold_cuts"]);
});

test("a Mexican or Neapolitan place asks about pasteurized cheese", () => {
  assert.ok(ids(["urn:tag:cuisine:qloo:mexican"]).includes("soft_cheese"));
  assert.ok(ids(["urn:tag:cuisine:qloo:neapolitan"]).includes("soft_cheese"));
});

test("a steakhouse says cooked through; brunch says firm eggs", () => {
  assert.ok(ids(["urn:tag:cuisine:qloo:brazilian_steakhouse"]).includes("meat"));
  assert.ok(ids(["urn:tag:genre:place:restaurant:brunch"]).includes("eggs"));
});

test("a plain Chinese restaurant has nothing to flag", () => {
  assert.deepEqual(ids(["urn:tag:cuisine:qloo:chinese", "urn:tag:genre:place:restaurant"]), []);
});

test("only the kind of place counts, not a dish or an offering", () => {
  assert.deepEqual(ids(["urn:tag:cuisine:qloo:coffee_and_bakery", "urn:tag:specialty_dish:place:breakfast_sandwich", "urn:tag:offerings:place:salads"]), ["eggs"]);
});

test("at most two notes, the most important first", () => {
  assert.deepEqual(ids(["urn:tag:cuisine:qloo:sushi", "urn:tag:cuisine:qloo:seafood", "urn:tag:cuisine:qloo:steakhouse", "urn:tag:genre:place:restaurant:brunch"]), ["raw_fish", "seafood"]);
});

test("each note appears once, and none names an illness", () => {
  const n = notesFor(["urn:tag:cuisine:qloo:seafood", "urn:tag:cuisine:qloo:sushi", "urn:tag:cuisine:qloo:fish"], 10);
  assert.equal(new Set(n.map((x) => x.id)).size, n.length);
  for (const x of notesFor(["sushi", "deli", "mexican", "steak", "brunch", "juice", "salad", "seafood"].map((w) => `urn:tag:cuisine:qloo:${w}`), 10))
    assert.doesNotMatch(x.text, /listeria|toxoplasm|salmonella|infection|miscarriage/i);
});
