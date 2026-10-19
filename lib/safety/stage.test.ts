import assert from "node:assert/strict";
import { test } from "node:test";
import { stageFrom, weeksPregnant } from "./stage.ts";

const today = new Date(2026, 9, 19);

test("no dates: unknown, so every sign shows", () => {
  assert.deepEqual(stageFrom({}, today), { kind: "unknown" });
});

test("a due date: pregnant", () => {
  assert.deepEqual(stageFrom({ due_date: "2027-01-10" }, today), { kind: "pregnant" });
});

test("a birth date counts the days since", () => {
  assert.deepEqual(stageFrom({ birth_date: "2026-10-19" }, today), { kind: "after_birth", days: 0 });
  assert.deepEqual(stageFrom({ birth_date: "2026-09-07" }, today), { kind: "after_birth", days: 42 });
});

test("a birth date wins over a due date", () => {
  assert.equal(stageFrom({ due_date: "2026-10-25", birth_date: "2026-10-10" }, today).kind, "after_birth");
});

test("a birth date in the future isn't trusted", () => {
  assert.deepEqual(stageFrom({ birth_date: "2026-12-01", due_date: "2026-12-05" }, today), { kind: "unknown" });
});

test("weeks pregnant: 40 at the due date, counting back", () => {
  assert.equal(weeksPregnant("2026-10-19", today), 40);
  assert.equal(weeksPregnant("2026-11-16", today), 36);
  assert.equal(weeksPregnant("2027-07-01", today), 3);
  assert.equal(weeksPregnant("2027-08-01", today), 0);
});
