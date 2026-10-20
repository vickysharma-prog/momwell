import assert from "node:assert/strict";
import { test } from "node:test";
import { pickFrom, RULES_NOTE_HER, safeNote } from "./make.ts";

const offered = [{ name: "Sweet Magnolias", image: null }, { name: "Bunheads", image: null }];

test("the planner's choice counts only if Qloo offered it; otherwise Qloo's first pick", () => {
  assert.equal(pickFrom(offered, "bunheads")?.name, "Bunheads");
  assert.equal(pickFrom(offered, "Some Show Qloo Never Named")?.name, "Sweet Magnolias");
  assert.equal(pickFrom(undefined, "Bunheads"), null);
  assert.equal(pickFrom([], "Bunheads"), null);
});

test("a note that talks about her health is replaced by the plain one", () => {
  assert.equal(safeNote("Curl up with Bunheads tonight, and let dinner come to you.", RULES_NOTE_HER), "Curl up with Bunheads tonight, and let dinner come to you.");
  for (const bad of ["Take some Tylenol for that headache", "Call your doctor if the pain gets worse", "Rest, your blood pressure matters", "", "x".repeat(300)])
    assert.equal(safeNote(bad, RULES_NOTE_HER), RULES_NOTE_HER, bad.slice(0, 30));
  assert.equal(safeNote(undefined, RULES_NOTE_HER), RULES_NOTE_HER);
});
