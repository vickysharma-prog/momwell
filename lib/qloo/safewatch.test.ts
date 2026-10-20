import assert from "node:assert/strict";
import { test } from "node:test";
import { AVOID_TAGS, isSafe } from "./safewatch.ts";

const show = (name: string, ...tags: string[]) => ({ entity_id: name, name, tags: tags.map((id) => ({ id })) });

test("a show about a mother's death is never safe", () => {
  assert.equal(isSafe(show("Everwood", "urn:tag:keyword:media:death_of_mother", "urn:tag:genre:media:drama")), false);
});

test("Qloo's two tag spellings are both caught", () => {
  assert.equal(isSafe({ entity_id: "x", name: "x", tags: [{ tag_id: "urn:tag:keyword:qloo:cancer" }] }), false);
  assert.equal(isSafe({ entity_id: "y", name: "y", tags: [{ id: "urn:tag:keyword:qloo:cancer" }] }), false);
});

test("a light comedy is safe, and so is a show with no tags", () => {
  assert.equal(isSafe(show("Hart of Dixie", "urn:tag:genre:media:comedy", "urn:tag:keyword:qloo:small_town")), true);
  assert.equal(isSafe({ entity_id: "z", name: "z" }), true);
});

test("every theme we leave out is a real tag id", () => {
  for (const t of AVOID_TAGS) assert.match(t, /^urn:tag:(keyword|theme|subgenre|genre):(qloo|media):[a-z_]+$/, t);
  assert.equal(new Set(AVOID_TAGS).size, AVOID_TAGS.length);
});

test("a theme is caught whichever namespace carries it: Ginny & Georgia's self-harm and teen pregnancy", () => {
  assert.equal(isSafe(show("Ginny & Georgia", "urn:tag:keyword:media:self_harm", "urn:tag:genre:qloo:comedy")), false);
  assert.equal(isSafe(show("x", "urn:tag:keyword:media:teen_pregnancy")), false);
  assert.equal(isSafe(show("x", "urn:tag:keyword:media:abortion")), false);
  assert.equal(isSafe(show("x", "urn:tag:keyword:media:domestic_violence")), false);
  // An audience or style tag with a similar word is not a theme.
  assert.equal(isSafe(show("x", "urn:tag:audience:qloo:grief")), true);
});

test("a marriage ending is left out: Fleishman Is in Trouble", () => {
  assert.equal(isSafe(show("Fleishman Is in Trouble", "urn:tag:keyword:qloo:divorce", "urn:tag:genre:qloo:drama")), false);
  assert.equal(isSafe(show("x", "urn:tag:keyword:media:end_of_a_marriage")), false);
  assert.equal(isSafe(show("x", "urn:tag:keyword:media:infidelity")), false);
});
