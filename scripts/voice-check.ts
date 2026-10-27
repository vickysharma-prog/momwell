// Listens to each recorded line (public/voice/<id>.mp3) and checks it says its words and nothing else: Gemini
// transcribes it, and the words must match the line in lib/voice/lines.ts. Prints any that don't.
// node --env-file=.env.local scripts/voice-check.ts [id ...]
import { readFileSync } from "node:fs";
import { LINES, type LineId } from "../lib/voice/lines.ts";

const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"];
const ids = (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(LINES)) as LineId[];
// Words only, numbers as she'd hear them: "911" and "nine one one" are the same line.
const words = (t: string) =>
  t.toLowerCase().replace(/mom-well/g, "momwell").replace(/\bclue\b/g, "qloo").replace(/thirty-second/g, "thirty second").replace(/30/g, "thirty")
    .replace(/911/g, "nine one one").replace(/988/g, "nine eight eight").replace(/[^a-z]+/g, ""); // "any time" and "anytime" are the same words aloud

async function transcribe(id: LineId) {
  const data = readFileSync(new URL(`../public/voice/${id}.mp3`, import.meta.url)).toString("base64");
  for (const model of MODELS) {
    // A model that hangs hands over to the next, like a busy one.
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      headers: { "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY!, "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data } }, { text: "Transcribe this audio exactly, word for word. Reply with the words only. It is an app's voice; names you may hear are Momwell (the app), Maya, Sam, Dr Lee and Qloo. Write what is actually said, even if it isn't one of these." }] }],
      }),
    }).catch(() => null);
    if (!res) continue;
    const body = await res.json();
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text.trim() as string;
    if (res.status !== 429 && res.status !== 503) throw new Error(`${id} (${model}): ${JSON.stringify(body.error ?? body).slice(0, 300)}`);
  }
  return null;
}

let bad = 0;
for (const id of ids) {
  const heard = await transcribe(id);
  if (heard === null) {
    bad++;
    console.log("BUSY", id, "(every model busy; run again later)");
    continue;
  }
  const ok = words(heard) === words(LINES[id]);
  if (!ok) bad++;
  console.log(ok ? "ok  " : "DIFF", id, ok ? "" : `\n     line:  ${LINES[id]}\n     heard: ${heard}`);
}
console.log(`${ids.length - bad}/${ids.length} say exactly their line`);
process.exitCode = bad ? 1 : 0;
