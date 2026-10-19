import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { babyLineFor, LINES, lineFor } from "./lines.ts";

test("each result speaks the line that matches its screen", () => {
  assert.equal(lineFor({ level: "urgent", crisis: false, noteUnread: false }), "urgent");
  assert.equal(lineFor({ level: "call_doctor", crisis: false, noteUnread: false }), "call_doctor");
  assert.equal(lineFor({ level: "check", crisis: false, noteUnread: false }), "check");
  assert.equal(lineFor({ level: "none", crisis: false, noteUnread: false }), "clear");
  assert.equal(lineFor({ level: "none", crisis: false, noteUnread: true }), "note");
});

test("thoughts of harm always speak the crisis line", () => {
  assert.equal(lineFor({ level: "urgent", crisis: true, noteUnread: true }), "crisis");
});

test("no spoken line names a condition", () => {
  for (const text of Object.values(LINES)) assert.doesNotMatch(text, /preeclampsia|eclampsia|sepsis|hemorrhage|depression|stroke|diagnos/i);
});

test("every line has its recording in the app", () => {
  for (const id of Object.keys(LINES)) assert.ok(existsSync(new URL(`../../public/voice/${id}.mp3`, import.meta.url)), id);
});

test("a baby result speaks the baby's line", () => {
  assert.equal(babyLineFor("urgent"), "baby_urgent");
  assert.equal(babyLineFor("call_doctor"), "baby_call");
  assert.equal(babyLineFor("none"), "baby_clear");
  assert.equal(babyLineFor("check"), "check");
});
