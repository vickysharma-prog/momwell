import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateBaby } from "../safety/baby.ts";
import { evaluate } from "../safety/engine.ts";
import { SIGN_IDS } from "../safety/signs.ts";
import { aboutHer } from "./voice.ts";

test("every reason the engine writes reads about her, not to her", () => {
  const r = evaluate({ signs: [...SIGN_IDS], bp: { systolic: 170, diastolic: 115 }, temp: { value: 39, unit: "C" } });
  for (const reason of r.reasons) assert.doesNotMatch(aboutHer(reason.text), /\b(you|your)\b/i, reason.text);
});

test("the numbers stay as they were", () => {
  assert.equal(aboutHer("Your blood pressure is 152/96. 140/90 or higher means calling your doctor right away."), "Her blood pressure was 152/96. 140/90 or higher means calling her doctor right away.");
});

test("a baby check-in reads about her baby", () => {
  for (const r of evaluateBaby({ signs: ["baby_blue"], temp: { value: 101, unit: "F" } }, 20).reasons) assert.doesNotMatch(aboutHer(r.text), /\byour?\b/i);
  assert.equal(aboutHer(evaluateBaby({ signs: ["baby_dry"] }, 20).reasons[0].text), "She reported about her baby: no wet diaper in 8 hours.");
});
