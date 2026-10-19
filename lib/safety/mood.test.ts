import assert from "node:assert/strict";
import { test } from "node:test";
import { band, moodDue, needsFull, QUESTIONS, scoreMood, validAnswers } from "./mood.ts";

// Nine answers with the given total spread over the first eight items (item nine stays 0).
const nine = (total: number) => {
  const a = Array(9).fill(0);
  for (let i = 0; total > 0; i = (i + 1) % 8, total--) a[i]++;
  return a;
};

test("there are nine questions, the first two are the PHQ-2", () => {
  assert.equal(QUESTIONS.length, 9);
  assert.match(QUESTIONS[0], /interest or pleasure/);
  assert.match(QUESTIONS[1], /down, depressed, or hopeless/);
});

test("the PHQ-2 gate: 2 stops, 3 goes on to all nine", () => {
  assert.equal(needsFull([1, 1]), false);
  assert.equal(needsFull([2, 1]), true);
  assert.equal(needsFull([0, 3]), true);
  assert.deepEqual(scoreMood([1, 1]), { kind: "phq2", score: 2, level: "none", band: "PHQ-2 negative", crisis: false, version: scoreMood([0, 0]).version });
  assert.throws(() => scoreMood([2, 1]));
});

test("every band boundary", () => {
  for (const [s, b] of [[4, "minimal"], [5, "mild"], [9, "mild"], [10, "moderate"], [14, "moderate"], [15, "moderately severe"], [19, "moderately severe"], [20, "severe"], [24, "severe"]] as const) {
    assert.equal(band(s), b, `score ${s}`);
    assert.equal(scoreMood(nine(s)).band, b, `answers summing to ${s}`);
  }
});

test("9 is nothing to act on; 10 means talk to her doctor", () => {
  assert.equal(scoreMood(nine(9)).level, "none");
  assert.equal(scoreMood(nine(10)).level, "call_doctor");
  assert.equal(scoreMood(nine(24)).level, "call_doctor");
});

test("any answer but 'not at all' on thoughts of harm is urgent with the crisis lines, whatever the score", () => {
  for (const v of [1, 2, 3]) {
    const a = [0, 0, 0, 0, 0, 0, 0, 0, v];
    const r = scoreMood(a);
    assert.equal(r.level, "urgent", `item 9 = ${v}`);
    assert.equal(r.crisis, true);
  }
  assert.equal(scoreMood(nine(0)).crisis, false);
});

test("anything that isn't two or nine answers of 0 to 3 is refused", () => {
  for (const bad of [[], [1], [0, 0, 0], Array(9).fill(4), [0, -1], [0, 1.5], "00", null, Array(10).fill(0)]) {
    assert.equal(validAnswers(bad), false, JSON.stringify(bad));
  }
  assert.throws(() => scoreMood([0, 0, 0]));
});

test("due every two weeks, and the first time", () => {
  const now = new Date("2026-10-20T12:00:00Z");
  assert.equal(moodDue(null, now), true);
  assert.equal(moodDue("2026-10-07T12:00:00Z", now), false);
  assert.equal(moodDue("2026-10-06T12:00:00Z", now), true);
});
