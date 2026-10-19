import assert from "node:assert/strict";
import { test } from "node:test";
import { isCalm } from "./music.ts";

const artist = (...tags: string[]) => ({ entity_id: "a", name: "a", tags: tags.map((id) => ({ id })) });

test("metal, hardcore and punk are left off the birth playlist", () => {
  assert.equal(isCalm(artist("urn:tag:genre:music:melodic_death_metal")), false);
  assert.equal(isCalm(artist("urn:tag:genre:music:metalcore")), false);
  assert.equal(isCalm(artist("urn:tag:genre:music:punk")), false);
});

test("folk, soul and pop stay", () => {
  assert.equal(isCalm(artist("urn:tag:genre:music:indie_folk", "urn:tag:genre:music:soul")), true);
  assert.equal(isCalm(artist("urn:tag:genre:music:pop")), true);
});
