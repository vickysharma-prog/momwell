// Safe Watch against live Qloo (cached after the first run, so it costs quota once).
import assert from "node:assert/strict";
import { test } from "node:test";
import { search } from "./api.ts";
import { isSafe, safeWatch } from "./safewatch.ts";

test("a Gilmore Girls fan gets gentle shows, and never Everwood", async () => {
  const [gg] = await search("Gilmore Girls", 1, "urn:entity:tv_show");
  const picks = await safeWatch([gg.entity_id], "tv_show", 8);
  assert.ok(picks.length >= 5, `only ${picks.length} picks`);
  assert.ok(!picks.some((p) => p.name === "Everwood"));
  assert.ok(!picks.some((p) => p.entity_id === gg.entity_id), "not the show she already loves");
  assert.ok(picks.every(isSafe));
});
