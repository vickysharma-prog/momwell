import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateBaby } from "./baby.ts";
import { evaluate } from "./engine.ts";
import { trail } from "./trail.ts";

const from = (input: Parameters<typeof evaluate>[0], extra: Partial<Parameters<typeof trail>[0]> = {}) => {
  const r = evaluate(input);
  return trail({ source: "tap", engineVersion: r.version, level: r.level, reasons: r.reasons, hadBp: Boolean(input.bp), told: [], seenBy: null, ...extra });
};

test("every trail says the rules decided, with the engine version, and never a model", () => {
  const steps = from({ signs: ["headache"] });
  assert.match(steps[1].detail, /rules engine \(version \d{4}-\d{2}-\d{2}\.\d+\)/);
  assert.match(steps[1].detail, /No AI model made this decision/);
});

test("a talk check-in says the companion may only add signs", () => {
  assert.match(from({ signs: ["headache"] }, { source: "talk" })[0].detail, /may add a sign, never remove one/);
});

test("each rule that fired is listed with its source", () => {
  const steps = from({ signs: ["headache"], bp: { systolic: 150, diastolic: 95 } });
  const rules = steps.filter((s) => s.title.startsWith("Rule:"));
  assert.equal(rules.length, 2);
  assert.ok(rules.every((r) => r.link?.url.startsWith("https://")));
  assert.ok(steps.some((s) => s.title === "Blood pressure limits"));
});

test("a warning says who was told and whether it was seen", () => {
  const steps = from({ signs: ["headache"] }, { told: ["Sam (partner)", "Dr Lee (OB-GYN)"], seenBy: "Dr Lee" });
  assert.match(steps.find((s) => s.title === "Who was told")!.detail, /Sam \(partner\), Dr Lee \(OB-GYN\)/);
  assert.equal(steps.find((s) => s.title === "Seen")!.detail, "Dr Lee marked it seen.");
});

test("a clear day has no alert steps", () => {
  const steps = from({ signs: [] });
  assert.ok(steps.some((s) => s.title === "No rule fired"));
  assert.ok(!steps.some((s) => s.title === "Who was told"));
});

test("a mood check-in says it came from the PHQ-9 thoughts-of-harm question, and nothing else of her answers", () => {
  const first = from({ signs: ["harm_thoughts"] }, { source: "mood" })[0];
  assert.match(first.detail, /PHQ-9/);
  assert.match(first.detail, /stay in her mood check/);
});

test("a baby check-in says so, calls 911 by name, and its detail follows baby updates", () => {
  const steps = trail({ source: "tap", subject: "baby", engineVersion: "baby-x", level: "urgent", reasons: evaluateBaby({ signs: ["baby_blue"] }, 10).reasons, hadBp: false, told: ["Sam (partner)"], seenBy: null });
  assert.equal(steps[0].title, "About her baby");
  assert.ok(steps.some((s) => s.title === "Rule: call 911"));
  assert.match(steps.find((s) => s.title === "Who was told")!.detail, /baby updates/);
  const watch = trail({ source: "tap", subject: "baby", engineVersion: "baby-x", level: "none", reasons: evaluateBaby({ signs: [], temp: { value: 101, unit: "F" } }, 200).reasons, hadBp: false, told: [], seenBy: null });
  assert.ok(watch.some((s) => s.title === "Rule: when to call"));
});
