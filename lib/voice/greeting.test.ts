import assert from "node:assert/strict";
import { test } from "node:test";
import { greetingFor, greetingLine } from "./greeting.ts";
import { LINES } from "./lines.ts";

test("Momwell greets her by name for the time of day, and asks how she is", () => {
  assert.equal(greetingFor("Maya", 8), "Good morning, Maya. I’m Momwell. How are you feeling today?");
  assert.equal(greetingFor("Maya", 13), "Good afternoon, Maya. I’m Momwell. How are you feeling today?");
  assert.equal(greetingFor("Maya", 21), "Good evening, Maya. I’m Momwell. How are you feeling today?");
  assert.match(greetingFor("Maya", null), /^Hi, Maya\./);
});

test("the recorded hello matches the hour, and says Maya only for Maya", () => {
  assert.equal(greetingLine("Maya", 9), "greet_morning_maya");
  assert.equal(greetingLine("Maya", 15), "greet_afternoon_maya");
  assert.equal(greetingLine("Ana", 20), "greet_evening");
  for (const [name, h] of [["Maya", 9], ["Maya", 15], ["Maya", 20], ["Ana", 9], ["Ana", 15], ["Ana", 20]] as const) assert.ok(greetingLine(name, h) in LINES);
  assert.equal(LINES[greetingLine("Maya", 15)].replace("'", "’"), greetingFor("Maya", 15));
});
