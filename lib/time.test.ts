import assert from "node:assert/strict";
import { test } from "node:test";
import { dateIn, formatIn, validTz } from "./time.ts";

test("a late evening in Austin is still that day there, though it is tomorrow in UTC", () => {
  const at = "2026-10-21T03:30:00Z"; // 10:30 pm on 20 Oct in Austin
  assert.equal(dateIn("America/Chicago", at), "2026-10-20");
  assert.equal(dateIn("UTC", at), "2026-10-21");
  assert.equal(formatIn("America/Chicago", at, { hour: "numeric", minute: "2-digit" }), "10:30 PM");
});

test("only real zones are trusted", () => {
  assert.equal(validTz("America/New_York"), true);
  assert.equal(validTz("Asia/Kolkata"), true);
  assert.equal(validTz("Not/AZone"), false);
  assert.equal(validTz(undefined), false);
});
