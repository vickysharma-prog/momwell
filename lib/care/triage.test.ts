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

test("a mood check that suggests a talk puts her in call-her for two weeks, after unseen alerts", () => {
  assert.deepEqual(statusOf({ ...base, lastMood: { level: "call_doctor", at: ago(1) } }, now), { status: "call", reason: "Mood check suggests a talk (PHQ-9 of 10 or more)" });
  assert.equal(statusOf({ ...base, lastMood: { level: "urgent", at: ago(0) } }, now).reason, "Mood check: thoughts of self-harm");
  assert.equal(statusOf({ ...base, unseenUrgent: 1, lastMood: { level: "call_doctor", at: ago(1) } }, now).status, "urgent");
  assert.equal(statusOf({ ...base, lastMood: { level: "call_doctor", at: ago(14) } }, now).status, "clear");
  assert.equal(statusOf({ ...base, lastMood: { level: "none", at: ago(1) } }, now).status, "clear");
});

test("an alert about her baby says so, not blood pressure", () => {
  assert.equal(statusOf({ ...base, unseenCall: 1, babyCall: 1 }, now).reason, "Baby: told to call the baby’s doctor, not yet seen");
  assert.equal(statusOf({ ...base, unseenUrgent: 1, babyUrgent: 1 }, now).reason, "Baby: 1 urgent alert not yet seen");
  assert.equal(statusOf({ ...base, unseenCall: 2, babyCall: 1 }, now).reason, "Blood pressure in the call-her range, not yet seen");
  assert.equal(statusOf({ ...base, unseenUrgent: 2, babyUrgent: 1 }, now).reason, "2 urgent alerts not yet seen");
});
