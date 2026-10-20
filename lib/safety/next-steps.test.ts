import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate } from "./engine.ts";
import { canBreathe, nextSteps, NEXT_STEPS_SOURCE } from "./next-steps.ts";

test("CDC's tips, with her partner by name when she has one", () => {
  const steps = nextSteps({ companion: "Sam" }).map((s) => s.text);
  assert.match(steps[0], /pregnant in the past year/);
  assert.match(steps[1], /^Ask Sam to come with you/);
  assert.match(nextSteps({}).map((s) => s.text)[1], /^Bring a friend or family member/);
  assert.match(NEXT_STEPS_SOURCE.url, /cdc\.gov\/hearher/);
});

test("no step treats, doses or names a condition", () => {
  for (const s of nextSteps({})) assert.doesNotMatch(s.text, /take \d|mg\b|ibuprofen|tylenol|preeclampsia|depression|diagnos/i);
});

test("breathing along is offered for a headache, never for chest pain, trouble breathing or thoughts of harm", () => {
  assert.equal(canBreathe(evaluate({ signs: ["headache"] }).reasons), true);
  for (const s of ["breathing", "chest_heart", "harm_thoughts"] as const) assert.equal(canBreathe(evaluate({ signs: [s] }).reasons), false, s);
});
