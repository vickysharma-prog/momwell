import assert from "node:assert/strict";
import { test } from "node:test";
import { measure } from "./measure.ts";
import { SIGN_IDS } from "./signs.ts";
import { signsInWords } from "./words.ts";
import { NEGATIVES, POSITIVES } from "./words.dataset.ts";

test("the dataset covers every warning sign", () => {
  const covered = new Set(POSITIVES.flatMap((p) => p.signs));
  for (const id of SIGN_IDS.filter((s) => s !== "bleeding_after")) assert.ok(covered.has(id), id);
});

test("the word scan misses no warning sign in the labelled messages", () => {
  const s = measure(signsInWords, POSITIVES);
  assert.deepEqual(s.missedMessages, []);
  assert.equal(s.recall, 1);
});

test("the word scan stays quiet on everyday messages and a plain no", () => {
  const s = measure(signsInWords, NEGATIVES);
  assert.deepEqual(s.flaggedClean, []);
});

test("measure counts true and false positives and misses", () => {
  const s = measure(() => ["headache"], [{ text: "a", signs: ["headache"] }, { text: "b", signs: [] }, { text: "c", signs: ["fever"] }]);
  assert.deepEqual([s.truePositives, s.falsePositives, s.falseNegatives], [1, 2, 1]);
  assert.deepEqual(s.missedMessages, ["c"]);
  assert.deepEqual(s.flaggedClean, ["b"]);
});
