// Nearby food against live Qloo (cached after the first run).
import assert from "node:assert/strict";
import { test } from "node:test";
import { search } from "./api.ts";
import { fitsDiet, isMealPlace, nearbyFood } from "./food.ts";

test("vegetarian places near Austin for a Gilmore Girls fan, no bars, each with its FDA notes", async () => {
  const [gg] = await search("Gilmore Girls", 1, "urn:entity:tv_show");
  const meals = await nearbyFood([gg.entity_id], "Austin, TX", ["vegetarian"], 6);
  assert.ok(meals.length >= 4, `only ${meals.length}`);
  for (const m of meals) {
    assert.ok(isMealPlace(m.entity) && fitsDiet(m.entity, ["vegetarian"]), m.entity.name);
    assert.ok((m.entity.tags ?? []).some((t) => (t.id ?? t.tag_id) === "urn:tag:dietary_option:qloo:vegetarian"), m.entity.name);
    assert.ok(Array.isArray(m.notes));
  }
});
