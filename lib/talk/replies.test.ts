import assert from "node:assert/strict";
import { test } from "node:test";
import { LINES } from "../voice/lines.ts";
import { askAbout, MENU, NOT_NOW, PICKS_SAY, REPLIES } from "./replies.ts";

test("every reply is plain and safe: no condition, no medicine advice, and a next step unless it's a thank-you", () => {
  for (const [feeling, r] of Object.entries(REPLIES)) {
    assert.doesNotMatch(r.text, /depression|preeclampsia|diagnos|take \d|mg\b/i, feeling);
    if (feeling !== "thanks") assert.ok(r.chips.length > 0, feeling);
  }
});

test("asking about what she said lists every sign", () => {
  assert.equal(askAbout(["a headache"]), "It sounds like a headache. Is this happening now?");
  assert.equal(askAbout(["a headache", "dizziness", "changes in your vision"]), "It sounds like a headache, dizziness and changes in your vision. Is this happening now?");
});

test("every fixed answer in Talk has its recording, and the voice says exactly the words on screen", () => {
  for (const r of [...Object.values(REPLIES), NOT_NOW, MENU, ...Object.values(PICKS_SAY)]) {
    assert.ok(r.line, r.text);
    assert.equal(LINES[r.line].replace(/'/g, "’"), r.text, r.line);
  }
});
