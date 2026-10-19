import assert from "node:assert/strict";
import { test } from "node:test";
import { isEatery } from "./food.ts";

const place = (...tags: string[]) => ({ entity_id: "p", name: "p", tags: tags.map((id) => ({ id })) });

test("bars and pubs are left out, restaurants and cafés stay", () => {
  assert.equal(isEatery(place("urn:tag:genre:place:restaurant", "urn:tag:genre:place:restaurant:sports_bar")), false);
  assert.equal(isEatery(place("urn:tag:genre:place:restaurant:pub")), false);
  assert.equal(isEatery(place("urn:tag:genre:place:restaurant", "urn:tag:cuisine:qloo:italian")), true);
  assert.equal(isEatery(place("urn:tag:cuisine:qloo:coffee_and_bakery")), true);
});

test("a bakery that serves beer is still a bakery", () => {
  assert.equal(isEatery(place("urn:tag:cuisine:qloo:coffee_and_bakery", "urn:tag:offerings:place:beer")), true);
});
