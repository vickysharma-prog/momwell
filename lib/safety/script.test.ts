import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluate } from "./engine.ts";
import { tellThem } from "./script.ts";

test("pregnant: her weeks and each warning, with her numbers", () => {
  const r = evaluate({ signs: ["headache"], bp: { systolic: 152, diastolic: 97 } });
  assert.equal(tellThem({ kind: "pregnant" }, {}, 27, r.reasons), "I am 27 weeks pregnant, and I am having headache that won't go away or gets worse over time and a blood pressure of 152/97.");
});

test("after birth: AWHONN's 'I gave birth on' with her date", () => {
  const r = evaluate({ signs: [], temp: { value: 101.2, unit: "F" } });
  assert.equal(tellThem({ kind: "after_birth", days: 10 }, { birth_date: "2026-10-10" }, null, r.reasons), "I gave birth on October 10, and I am having a temperature of 101.2°F.");
});

test("stage unknown still says pregnant or in the last year", () => {
  const r = evaluate({ signs: ["breathing", "chest_heart"] });
  assert.match(tellThem({ kind: "unknown" }, {}, null, r.reasons)!, /^I am pregnant or gave birth in the last year, and I am having trouble breathing and chest pain/);
});

test("nothing to say when nothing is a warning", () => {
  assert.equal(tellThem({ kind: "pregnant" }, {}, 20, evaluate({ signs: [] }).reasons), undefined);
  assert.equal(tellThem({ kind: "pregnant" }, {}, 20, evaluate({ signs: [], temp: { value: 37.5, unit: "F" } }).reasons), undefined);
});
