// Records the fixed voice lines (lib/voice/lines.ts) with Gemini TTS into public/voice/<id>.mp3.
// Run after changing a line: node --env-file=.env.local scripts/voice-lines.ts [id ...]
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { LINES, STYLE, VOICE, type LineId } from "../lib/voice/lines.ts";

const MODEL = "gemini-3.8-flash-tts";
const ids = (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(LINES)) as LineId[];
const path = (name: string) => new URL(`../public/voice/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

// The free tier allows a few TTS calls a minute: on 429, wait the time Google asks for and try again.
async function speak(id: LineId): Promise<{ data: string }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY!, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${STYLE} ${LINES[id]}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
    }),
  });
    const body = await res.json();
    const audio = body.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (audio) return audio;
    if (res.status !== 429) throw new Error(`${id}: ${JSON.stringify(body.error ?? body).slice(0, 300)}`);
    const wait = Number(/retry in ([\d.]+)s/i.exec(body.error?.message ?? "")?.[1] ?? 30);
    console.log(`${id}: rate limited, waiting ${Math.ceil(wait)}s`);
    await new Promise((r) => setTimeout(r, (wait + 1) * 1000));
  }
  throw new Error(`${id}: still rate limited`);
}

for (const id of ids) {
  const audio = await speak(id);
  writeFileSync(path(`${id}.wav`), Buffer.from(audio.data, "base64"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path(`${id}.wav`), "-ac", "1", "-b:a", "64k", path(`${id}.mp3`)]);
  rmSync(path(`${id}.wav`));
  console.log("recorded", id);
}
