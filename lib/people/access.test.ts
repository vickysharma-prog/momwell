import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { defaultSees, SCOPES } from "./access.ts";

test("a friend sees tasks and the baby, nothing clinical", () => {
  assert.deepEqual(defaultSees({ kind: "circle", partner: false }), ["tasks", "baby"]);
});

test("the partner also gets alerts and appointments", () => {
  const sees = defaultSees({ kind: "circle", partner: true });
  assert.ok(sees.includes("alerts") && sees.includes("appointments"));
});

test("nobody in the circle sees her mood screening by default", () => {
  for (const partner of [true, false]) assert.ok(!defaultSees({ kind: "circle", partner }).includes("mood"));
});

test("the care team sees the clinical picture but not circle tasks", () => {
  const sees = defaultSees({ kind: "care_team" });
  assert.ok(sees.includes("mood") && sees.includes("checkins") && !sees.includes("tasks"));
});

test("the database allows exactly the scopes the app knows", () => {
  const sql = readFileSync(new URL("../../db/migrations/001_people.sql", import.meta.url), "utf8");
  const listed = sql.match(/s <@ array\[([^\]]+)\]/)![1].match(/'([a-z_]+)'/g)!.map((s) => s.slice(1, -1));
  assert.deepEqual(listed, [...SCOPES]);
});
