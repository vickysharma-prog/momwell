import assert from "node:assert/strict";
import { test } from "node:test";
import { greetingFor } from "./greeting.ts";

test("Momwell greets her by name for the time of day, and asks how she is", () => {
  assert.equal(greetingFor("Maya", 8), "Good morning, Maya. I’m Momwell. How are you feeling today?");
  assert.equal(greetingFor("Maya", 13), "Good afternoon, Maya. I’m Momwell. How are you feeling today?");
  assert.equal(greetingFor("Maya", 21), "Good evening, Maya. I’m Momwell. How are you feeling today?");
  assert.match(greetingFor("Maya", null), /^Hi, Maya\./);
});
