import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate } from "./engine.ts";
import { SIGN_IDS, type SignId } from "./signs.ts";
import { actionFor, CALL_911, needs911 } from "./tier.ts";

test("AWHONN's 911 signs call 911: chest pain, trouble breathing, thoughts of harm", () => {
  for (const id of ["breathing", "chest_heart", "harm_thoughts"] as SignId[]) assert.equal(needs911(evaluate({ signs: [id] }).reasons), true, id);
});

test("every other CDC sign means calling her doctor now, not 911", () => {
  for (const id of SIGN_IDS.filter((s) => !(CALL_911 as readonly string[]).includes(s))) assert.equal(needs911(evaluate({ signs: [id] }).reasons), false, id);
});

test("160/110 calls 911 (NIH); 140/90 and a fever call her doctor", () => {
  assert.equal(needs911(evaluate({ signs: [], bp: { systolic: 162, diastolic: 100 } }).reasons), true);
  assert.equal(needs911(evaluate({ signs: [], bp: { systolic: 150, diastolic: 95 } }).reasons), false);
  assert.equal(needs911(evaluate({ signs: [], temp: { value: 101, unit: "F" } }).reasons), false);
});

test("one 911 sign among others still calls 911", () => {
  assert.equal(needs911(evaluate({ signs: ["headache", "chest_heart"] }).reasons), true);
});

test("a sign we don't recognise calls 911, never quiet", () => {
  assert.equal(needs911(evaluate({ signs: ["made_up" as SignId] }).reasons), true);
});

test("nothing reported calls no one", () => {
  assert.equal(needs911(evaluate({ signs: [] }).reasons), false);
});

test("one sentence for the screen and the companion: 911 for breathing, her doctor for a headache", () => {
  assert.equal(actionFor(evaluate({ signs: ["breathing"] })), "Call 911 now.");
  assert.match(actionFor(evaluate({ signs: ["headache"] })), /^Call your doctor now\. If you can't reach them, call 911 or go to the nearest emergency room\.$/);
  assert.match(actionFor(evaluate({ signs: [] })), /Nothing you told us/);
});
