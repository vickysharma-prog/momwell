import assert from "node:assert/strict";
import { test } from "node:test";
import { askLine, readAsk } from "./asks.ts";

const fd = (entries: [string, string][]) => {
  const f = new FormData();
  for (const [k, v] of entries) f.append(k, v);
  return f;
};

test("an ask with no day is for today", () => {
  assert.deepEqual(readAsk(fd([["kind", "meal"], ["note", " Thai, no raw fish "]]), "2026-10-20"), { ok: true, value: { kind: "meal", note: "Thai, no raw fish", needed_on: "2026-10-20" } });
});

test("a day in the past becomes today; a future day stays", () => {
  const past = readAsk(fd([["kind", "groceries"], ["needed_on", "2026-10-01"]]), "2026-10-20");
  const later = readAsk(fd([["kind", "groceries"], ["needed_on", "2026-10-22"]]), "2026-10-20");
  assert.ok(past.ok && past.value.needed_on === "2026-10-20");
  assert.ok(later.ok && later.value.needed_on === "2026-10-22");
});

test("an unknown kind is refused", () => {
  assert.equal(readAsk(fd([["kind", "laundry_robot"]]), "2026-10-20").ok, false);
});

test("an ask reads plainly to her circle", () => {
  assert.equal(askLine("night_feeds", "2026-10-20", "2026-10-20"), "Take the night feeds, today");
  assert.match(askLine("ride", "2026-10-22", "2026-10-20"), /^Drive me to an appointment, Thursday, Oct 22$/);
});
