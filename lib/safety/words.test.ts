import assert from "node:assert/strict";
import { test } from "node:test";
import { signsInWords } from "./words.ts";

test("everyday words for warning signs are noticed", () => {
  const cases: [string, string][] = [
    ["my head is pounding and it won't stop, worst headache ever", "headache"],
    ["my head has been pounding since this morning", "headache"],
    ["my head keeps throbbing", "headache"],
    ["I almost fainted in the shower", "dizziness"],
    ["I keep seeing spots and my vision is blurry", "vision"],
    ["I have a fever of 101", "fever"],
    ["my face is swollen and puffy", "swelling"],
    ["sometimes I think about hurting myself", "harm_thoughts"],
    ["I can't breathe when I lie down", "breathing"],
    ["my chest hurts and my heart is racing", "chest_heart"],
    ["I've been throwing up all day", "vomiting"],
    ["really bad stomach pain since lunch", "belly_pain"],
    ["the baby hasn't been moving much today", "baby_movement"],
    ["there's some bleeding", "bleeding_pregnant"],
    ["my left calf is swollen and red", "leg_arm"],
    ["I'm so tired I can't get up", "tiredness"],
  ];
  for (const [text, id] of cases) assert.ok(signsInWords(text).includes(id as never), `${id}: ${text}`);
});

test("Spanish is noticed too", () => {
  assert.ok(signsInWords("tengo un dolor de cabeza muy fuerte").includes("headache"));
  assert.ok(signsInWords("no puedo respirar bien").includes("breathing"));
  assert.ok(signsInWords("hay sangrado").includes("bleeding_pregnant"));
});

test("a plain no is not a report", () => {
  assert.deepEqual(signsInWords("no bleeding today, just tired legs"), []);
  assert.deepEqual(signsInWords("I don't have a headache anymore"), []);
});

test("blood pressure, blood sugar or a blood test is not bleeding", () => {
  assert.ok(!signsInWords("my blood pressure is 148 over 94").includes("bleeding_pregnant"));
  assert.ok(!signsInWords("my blood sugar was fine and the blood test came back").includes("bleeding_pregnant"));
  assert.ok(signsInWords("there was blood on my pad").includes("bleeding_pregnant"));
});

test("an ordinary message has nothing to flag", () => {
  assert.deepEqual(signsInWords("can you find me a nice show for tonight?"), []);
  assert.deepEqual(signsInWords("what should I eat for dinner"), []);
});
