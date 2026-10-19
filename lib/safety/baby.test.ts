import assert from "node:assert/strict";
import { test } from "node:test";
import { BABY_SIGNS, babySignsFor, evaluateBaby, FEVER_CALL_DAYS, NEWBORN_DAYS, type BabySignId } from "./baby.ts";
import { SIGN_IDS } from "./signs.ts";

const F = (value: number) => ({ temp: { value, unit: "F" as const } });

test("blue lips and struggling to breathe are 911; every other sign is call the doctor now", () => {
  for (const s of BABY_SIGNS) {
    const r = evaluateBaby({ signs: [s.id] }, 10);
    assert.equal(r.level, s.id === "baby_blue" || s.id === "baby_breathing" ? "urgent" : "call_doctor", s.id);
    assert.equal(r.reasons[0].source.url, s.source.url);
    assert.match(r.reasons[0].text, /^You told us about your baby: /);
  }
});

test("the worst sign leads", () => {
  const r = evaluateBaby({ signs: ["baby_dry", "baby_blue"] }, 40);
  assert.equal(r.level, "urgent");
  assert.equal(r.reasons[0].id, "baby_blue");
});

test("under 3 months, 100.4°F is a call now and 100.3°F is not", () => {
  assert.equal(evaluateBaby({ signs: [], ...F(100.4) }, FEVER_CALL_DAYS - 1).level, "call_doctor");
  assert.equal(evaluateBaby({ signs: [], temp: { value: 38, unit: "C" } }, 20).level, "call_doctor");
  assert.equal(evaluateBaby({ signs: [], ...F(100.3) }, 20).level, "none");
  assert.deepEqual(evaluateBaby({ signs: [], ...F(100.3) }, 20).reasons, []);
});

test("from 3 months, a fever alone says when to call, without calling it urgent", () => {
  const r = evaluateBaby({ signs: [], ...F(101.5) }, FEVER_CALL_DAYS);
  assert.equal(r.level, "none");
  assert.equal(r.reasons[0].id, "baby_fever_watch");
  assert.match(r.reasons[0].text, /more than 24 hours/);
});

test("a temperature that can't be a baby's is asked again, never read as fine", () => {
  assert.equal(evaluateBaby({ signs: [], ...F(37.5) }, 20).level, "check");
  assert.equal(evaluateBaby({ signs: [], temp: { value: 99, unit: "C" } }, 20).level, "check");
  assert.equal(evaluateBaby({ signs: [], ...F(Number.NaN) }, 20).level, "check");
});

test("an unknown sign is urgent, never silent", () => {
  assert.equal(evaluateBaby({ signs: ["made_up" as BabySignId] }, 20).level, "urgent");
});

test("the newborn 'seems sick' sign is shown only in the first month", () => {
  assert.ok(babySignsFor(NEWBORN_DAYS - 1).some((s) => s.id === "baby_newborn_sick"));
  assert.ok(!babySignsFor(NEWBORN_DAYS).some((s) => s.id === "baby_newborn_sick"));
  assert.equal(babySignsFor(200).length, BABY_SIGNS.length - 1);
});

test("baby sign ids never collide with hers, and no text names a medicine or an illness", () => {
  for (const s of BABY_SIGNS) {
    assert.ok(!(SIGN_IDS as string[]).includes(s.id));
    assert.doesNotMatch(s.label, /tylenol|acetaminophen|ibuprofen|motrin|meningitis|sepsis|jaundice|dehydrat/i);
  }
  assert.equal(evaluateBaby({ signs: ["baby_dry"] }, 20).crisis, false);
});
