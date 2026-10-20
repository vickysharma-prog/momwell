// Records the fixed voice lines (lib/voice/lines.ts) with Gemini TTS into public/voice/<id>.mp3.
// Run after changing a line: node --env-file=.env.local scripts/voice-lines.ts [id ...]
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { LINES, VOICE, type LineId } from "../lib/voice/lines.ts";

// One model, so every line sounds the same: a busy model is waited out, never swapped for another (other TTS models
// give the same voice name a different sound). TTS_MODEL overrides.
const MODELS = [process.env.TTS_MODEL ?? "gemini-3.8-flash-tts"];
const ids = (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(LINES)) as LineId[];
const path = (name: string) => new URL(`../public/voice/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

// On 429 try the next model; when every model is busy, wait the time Google asks for and go round again.
async function speak(id: LineId): Promise<{ data: string; mimeType?: string }> {
  for (let round = 0; round < 4; round++) {
    let wait = 30;
    for (const model of MODELS) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": process.env.GOOGLE_GENERATIVE_AI_API_KEY!, "content-type": "application/json" },
        body: JSON.stringify({
          // Only the words: a style instruction in the prompt ("Say this warmly…") gets read aloud by some models.
          contents: [{ parts: [{ text: LINES[id] }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
        }),
      });
      const body = await res.json();
      const audio = body.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (audio) return audio;
      if (res.status !== 429 && res.status !== 503) throw new Error(`${id} (${model}): ${JSON.stringify(body.error ?? body).slice(0, 300)}`);
      wait = Math.min(wait, Number(/retry in ([\d.]+)s/i.exec(body.error?.message ?? "")?.[1] ?? 30));
      console.log(`${id}: ${model} busy`);
    }
    console.log(`${id}: every model busy, waiting ${Math.ceil(wait)}s`);
    await new Promise((r) => setTimeout(r, (wait + 1) * 1000));
  }
  throw new Error(`${id}: still rate limited`);
}

for (const id of ids) {
  const audio = await speak(id);
  writeFileSync(path(`${id}.wav`), Buffer.from(audio.data, "base64"));
  // Some models send a WAV file, others raw 16-bit PCM ("audio/L16;codec=pcm;rate=24000").
  const rate = /rate=(\d+)/.exec(audio.mimeType ?? "")?.[1];
  const raw = /L16|pcm/i.test(audio.mimeType ?? "") ? ["-f", "s16le", "-ar", rate ?? "24000", "-ac", "1"] : [];
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...raw, "-i", path(`${id}.wav`), "-ac", "1", "-b:a", "64k", path(`${id}.mp3`)]);
  rmSync(path(`${id}.wav`));
  console.log("recorded", id);
}
