import assert from "node:assert/strict";
import { test } from "node:test";
import { statusOf, triage } from "./triage.ts";

const now = new Date("2026-10-20T12:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const base = { unseenUrgent: 0, unseenCall: 0, lastCheckIn: ago(0), lastLevel: "none" as const };

test("an unseen urgent alert comes before everything", () => {
  assert.equal(statusOf({ ...base, unseenUrgent: 1, unseenCall: 2 }, now).status, "urgent");
});

test("an unseen call-her alert comes next", () => {
  assert.equal(statusOf({ ...base, unseenCall: 1 }, now).status, "call");
});

test("three quiet days are flagged; two are not", () => {
  assert.equal(statusOf({ ...base, lastCheckIn: ago(3) }, now).status, "quiet");
  assert.equal(statusOf({ ...base, lastCheckIn: ago(2) }, now).status, "clear");
});

test("someone who never checked in is new, not clear", () => {
  assert.equal(statusOf({ ...base, lastCheckIn: null, lastLevel: null }, now).status, "new");
});

test("seen alerts no longer hold her at the top", () => {
  assert.equal(statusOf({ ...base, lastLevel: "urgent" }, now).status, "clear");
});

test("the queue: urgent, call, quiet, new, clear; the longest waiting first within each", () => {
  const order = triage(
    [
      { name: "Clear", ...base },
      { name: "Urgent recent", ...base, unseenUrgent: 1, lastCheckIn: ago(0) },
      { name: "Quiet", ...base, lastCheckIn: ago(5) },
      { name: "Urgent older", ...base, unseenUrgent: 1, lastCheckIn: ago(1) },
      { name: "New", ...base, lastCheckIn: null, lastLevel: null },
      { name: "Call", ...base, unseenCall: 1 },
    ],
    now,
  ).map((p) => p.name);
  assert.deepEqual(order, ["Urgent older", "Urgent recent", "Call", "Quiet", "New", "Clear"]);
});
