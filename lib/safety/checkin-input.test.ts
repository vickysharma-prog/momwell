import assert from "node:assert/strict";
import { test } from "node:test";
import { readCheckIn } from "./checkin-input.ts";

const fd = (entries: [string, string][]) => {
  const f = new FormData();
  for (const [k, v] of entries) f.append(k, v);
  return f;
};

test("an empty check-in is fine: nothing to report", () => {
  assert.deepEqual(readCheckIn(fd([])), { ok: true, value: { signs: [], note: "" } });
});

test("signs, blood pressure and temperature come through as numbers", () => {
  const r = readCheckIn(fd([["signs", "headache"], ["signs", "vision"], ["systolic", "150"], ["diastolic", "95"], ["temp", "38.2"], ["temp_unit", "C"], ["note", "  tired "]]));
  assert.deepEqual(r, { ok: true, value: { signs: ["headache", "vision"], note: "tired", bp: { systolic: 150, diastolic: 95 }, temp: { value: 38.2, unit: "C" } } });
});

test("blank number fields are left out, not zero", () => {
  const r = readCheckIn(fd([["systolic", ""], ["diastolic", ""], ["temp", ""]]));
  assert.deepEqual(r, { ok: true, value: { signs: [], note: "" } });
});

test("half a blood pressure asks for the other half", () => {
  const r = readCheckIn(fd([["systolic", "150"]]));
  assert.equal(r.ok, false);
});

test("a made-up sign is refused, not silently dropped", () => {
  assert.equal(readCheckIn(fd([["signs", "nope"]])).ok, false);
});

test("text where a number belongs is refused", () => {
  assert.equal(readCheckIn(fd([["temp", "hot"]])).ok, false);
});
