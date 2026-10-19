import assert from "node:assert/strict";
import { test } from "node:test";
import { ACTION, evaluate, NOTE_UNREAD, type CheckIn, type Level } from "./engine.ts";
import { SIGN_IDS, SIGNS, signsFor } from "./signs.ts";
import { CRISIS_LINES, SOURCES } from "./sources.ts";

const level = (c: Partial<CheckIn>) => evaluate({ signs: [], ...c }).level;
const bp = (systolic: number, diastolic: number) => level({ bp: { systolic, diastolic } });
const tempF = (value: number) => level({ temp: { value, unit: "F" } });
const tempC = (value: number) => level({ temp: { value, unit: "C" } });

test("CDC's list has all 15 signs, each once", () => {
  assert.equal(SIGNS.length, 15);
  assert.equal(new Set(SIGN_IDS).size, 15);
});

// Structural: a sign added to the list is covered here without writing a new test, and can never be quiet.
for (const id of SIGN_IDS) {
  test(`sign "${id}" alone means get care now`, () => {
    const r = evaluate({ signs: [id] });
    assert.equal(r.level, "urgent");
    assert.equal(r.reasons[0].id, id);
    assert.equal(r.reasons[0].source.url, SOURCES.cdcHearHer.url);
  });
}

test("nothing reported is the only way to get 'none'", () => {
  assert.equal(level({}), "none");
  assert.equal(level({ bp: { systolic: 118, diastolic: 76 }, temp: { value: 98.6, unit: "F" } }), "none");
});

test("an unknown sign id is treated as urgent, never ignored", () => {
  assert.equal(evaluate({ signs: ["made_up" as never] }).level, "urgent");
});

test("thoughts of harm open the crisis lines; nothing else does", () => {
  assert.equal(evaluate({ signs: ["harm_thoughts"] }).crisis, true);
  for (const id of SIGN_IDS.filter((i) => i !== "harm_thoughts")) assert.equal(evaluate({ signs: [id] }).crisis, false, id);
  assert.equal(CRISIS_LINES[0].call, "988");
});

test("fever: 100.4°F is the line", () => {
  assert.equal(tempF(100.3), "none");
  assert.equal(tempF(100.4), "urgent");
  assert.equal(tempF(103), "urgent");
});

test("fever in Celsius: 38°C is the line", () => {
  assert.equal(tempC(37.9), "none");
  assert.equal(tempC(38), "urgent");
});

test("a tapped fever and a fever reading are one reason, with her number", () => {
  const r = evaluate({ signs: ["fever"], temp: { value: 101.2, unit: "F" } });
  assert.equal(r.reasons.length, 1);
  assert.match(r.reasons[0].text, /101\.2°F/);
});

test("blood pressure: 140/90 means call the doctor, either number alone", () => {
  assert.equal(bp(139, 89), "none");
  assert.equal(bp(140, 80), "call_doctor");
  assert.equal(bp(120, 90), "call_doctor");
  assert.equal(bp(140, 90), "call_doctor");
});

test("blood pressure: 160/110 means care now, either number alone", () => {
  assert.equal(bp(159, 109), "call_doctor");
  assert.equal(bp(160, 100), "urgent");
  assert.equal(bp(150, 110), "urgent");
  assert.equal(bp(180, 120), "urgent");
});

test("readings that can't be right ask her to check, never say all is well", () => {
  const cases: [Level, Level][] = [
    [bp(90, 120), "check"], // the numbers swapped
    [bp(1400, 90), "check"],
    [bp(0, 0), "check"],
    [bp(120.5, 80), "check"],
    [tempF(1004), "check"],
    [tempF(37.5), "check"], // Celsius typed as Fahrenheit
    [tempC(99), "check"], // Fahrenheit typed as Celsius
    [tempF(Number.NaN), "check"],
  ];
  for (const [got, want] of cases) assert.equal(got, want);
});

test("the worst reason leads, and a sign outranks a bad reading", () => {
  const r = evaluate({ signs: ["headache"], bp: { systolic: 145, diastolic: 85 }, temp: { value: 2, unit: "C" } });
  assert.equal(r.level, "urgent");
  assert.deepEqual(r.reasons.map((x) => x.level), ["urgent", "call_doctor", "check"]);
});

test("every reason names its source", () => {
  const r = evaluate({ signs: [...SIGN_IDS], bp: { systolic: 170, diastolic: 115 }, temp: { value: 39, unit: "C" } });
  for (const reason of r.reasons) assert.match(reason.source.url, /^https:\/\//, reason.id);
  assert.equal(evaluate({ signs: [], bp: { systolic: 145, diastolic: 80 } }).reasons[0].source.url, SOURCES.acogBloodPressure.url);
  assert.equal(evaluate({ signs: [], bp: { systolic: 165, diastolic: 80 } }).reasons[0].source.url, SOURCES.nihSevereBloodPressure.url);
});

test("nothing she reads names a condition: the app never diagnoses", () => {
  const conditions = /preeclampsia|eclampsia|sepsis|embolism|hemorrhage|haemorrhage|cardiomyopathy|stroke|infection|depression|psychosis|blood clot|thrombosis|hellp|diagnos/i;
  const r = evaluate({ signs: [...SIGN_IDS], bp: { systolic: 170, diastolic: 115 }, temp: { value: 39, unit: "C" } });
  const shown = [...r.reasons.map((x) => x.text), ...Object.values(ACTION), NOTE_UNREAD, ...SIGNS.flatMap((s) => [s.label, s.detail]), ...CRISIS_LINES.map((c) => c.note)];
  for (const line of shown) assert.doesNotMatch(line, conditions, line);
});

test("the engine records which version decided", () => {
  assert.match(evaluate({ signs: [] }).version, /^\d{4}-\d{2}-\d{2}\.\d+$/);
});

test("pregnant: every sign but bleeding after birth", () => {
  const ids = signsFor({ kind: "pregnant" }).map((s) => s.id);
  assert.equal(ids.length, 14);
  assert.ok(!ids.includes("bleeding_after") && ids.includes("baby_movement") && ids.includes("leg_arm"));
});

test("after birth: no pregnancy-only signs", () => {
  const ids = signsFor({ kind: "after_birth", days: 3 }).map((s) => s.id);
  assert.ok(!ids.includes("baby_movement") && !ids.includes("bleeding_pregnant"));
  assert.ok(ids.includes("bleeding_after") && ids.includes("leg_arm"));
  assert.equal(ids.length, 13);
});

test("the leg or arm sign lasts six weeks after birth", () => {
  assert.ok(signsFor({ kind: "after_birth", days: 42 }).some((s) => s.id === "leg_arm"));
  assert.ok(!signsFor({ kind: "after_birth", days: 43 }).some((s) => s.id === "leg_arm"));
});

test("the rest last the year after birth", () => {
  assert.equal(signsFor({ kind: "after_birth", days: 365 }).length, 12);
  assert.equal(signsFor({ kind: "after_birth", days: 366 }).length, 0);
});

test("not knowing her stage shows every sign", () => {
  assert.equal(signsFor({ kind: "unknown" }).length, 15);
});

test("a note the rules can't read is never called a clear day", () => {
  const r = evaluate({ signs: [], note: "chest pain since this morning" });
  assert.equal(r.level, "none");
  assert.equal(r.noteUnread, true);
  assert.doesNotMatch(NOTE_UNREAD, /Nothing you told us/);
  assert.equal(evaluate({ signs: [], note: "   " }).noteUnread, false);
});
