// The router over the labelled messages: what judges' typing actually hits.
import assert from "node:assert/strict";
import { test } from "node:test";
import { NEGATIVES, POSITIVES } from "../safety/words.dataset.ts";
import { readingIn, route } from "./router.ts";

test("every labelled warning sign gets asked about at once (or the crisis help), with its signs", () => {
  for (const row of POSITIVES) {
    const r = route(row.text);
    assert.ok(r.kind === "confirm" || r.kind === "crisis", row.text);
    if (r.kind === "confirm" || r.kind === "crisis") for (const s of row.signs) assert.ok(r.signs.includes(s as never), `${row.text} → ${s}`);
  }
});

test("no everyday message is treated as a warning sign", () => {
  for (const row of NEGATIVES) {
    const r = route(row.text);
    assert.ok(r.kind !== "confirm" && r.kind !== "crisis", row.text);
  }
});

test("thoughts of harm go straight to crisis help", () => {
  assert.equal(route("sometimes I think about hurting myself").kind, "crisis");
});

test("a sign comes before anything else she asks for", () => {
  assert.equal(route("I'm so exhausted, find me a show").kind, "confirm");
});

test("readings: blood pressure only beside its words; a temperature in F or C", () => {
  assert.deepEqual(readingIn("my blood pressure was 150/96 this morning"), { bp: { systolic: 150, diastolic: 96 } });
  assert.deepEqual(readingIn("BP 142 over 91"), { bp: { systolic: 142, diastolic: 91 } });
  assert.deepEqual(readingIn("my appointment is 10/20 at 3"), {});
  assert.deepEqual(readingIn("I have a temperature of 101.2"), { temp: { value: 101.2, unit: "F" } });
  assert.deepEqual(readingIn("fever 38.4 C"), { temp: { value: 38.4, unit: "C" } });
  assert.equal(route("my blood pressure is 150/96").kind, "confirm");
  assert.equal(route("my blood pressure is 118/76 today").kind, "agent");
});

test("feelings get an answer at once; Qloo requests and Spanish go to the companion", () => {
  assert.deepEqual(route("I feel so anxious and alone today"), { kind: "feeling", feeling: "low" });
  assert.deepEqual(route("I can't sleep"), { kind: "feeling", feeling: "sleep" });
  assert.deepEqual(route("can I take ibuprofen?"), { kind: "feeling", feeling: "medical" });
  assert.deepEqual(route("hi Momwell"), { kind: "feeling", feeling: "greet" });
  assert.deepEqual(route("thank you"), { kind: "feeling", feeling: "thanks" });
  assert.deepEqual(route("I'm good today"), { kind: "feeling", feeling: "good" });
  assert.equal(route("I can't sleep, find me something calm to watch").kind, "agent");
  assert.equal(route("where can I get dinner near me?").kind, "agent");
  assert.equal(route("Hola, ¿qué puedo ver esta noche?").kind, "agent");
});
