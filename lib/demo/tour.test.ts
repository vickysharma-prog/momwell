import assert from "node:assert/strict";
import { test } from "node:test";
import { stepDone, STEPS } from "./tour.ts";

test("six steps, each a different screen of the story", () => {
  assert.equal(STEPS.length, 6);
  assert.equal(new Set(STEPS.map((s) => s.key)).size, 6);
});

test("each screen ticks off its step", () => {
  assert.equal(stepDone("/check-in/abc", "mother", false), "checkin");
  assert.equal(stepDone("/check-in", "mother", false), null);
  assert.equal(stepDone("/home", "circle", false), "sam");
  assert.equal(stepDone("/patients/x", "care_team", false), "lee");
  assert.equal(stepDone("/talk", "mother", false), "talk");
  assert.equal(stepDone("/for-you", "mother", true), "foryou");
  assert.equal(stepDone("/baby", "mother", true), "baby");
  assert.equal(stepDone("/baby", "mother", false), null);
});
