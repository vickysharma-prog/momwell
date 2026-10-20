import assert from "node:assert/strict";
import { test } from "node:test";
import { langOf, pickVoice } from "./say.ts";

const voices = [
  { name: "Microsoft David - English (United States)", lang: "en-US" },
  { name: "Google US English", lang: "en-US" },
  { name: "Microsoft Aria Online (Natural) - English (United States)", lang: "en-US" },
  { name: "Google español de Estados Unidos", lang: "es-US" },
  { name: "Microsoft Sabina - Spanish (Mexico)", lang: "es-MX" },
];

test("a warm natural voice in her language", () => {
  assert.equal(pickVoice(voices, "en-US")?.name, "Microsoft Aria Online (Natural) - English (United States)");
  assert.equal(pickVoice(voices.filter((v) => !/Aria/.test(v.name)), "en-US")?.name, "Google US English");
  assert.equal(pickVoice(voices, "es-US")?.name, "Microsoft Sabina - Spanish (Mexico)");
});

test("any voice in her language before none; none when there is none", () => {
  assert.equal(pickVoice([{ name: "Microsoft David", lang: "en-US" }], "en-US")?.name, "Microsoft David");
  assert.equal(pickVoice([{ name: "Microsoft David", lang: "en-US" }], "hi-IN"), undefined);
});

test("Spanish replies are read in Spanish", () => {
  assert.equal(langOf("Hola María, ¿cómo estás hoy?"), "es-US");
  assert.equal(langOf("Hi Maya, how are you feeling today?"), "en-US");
});
