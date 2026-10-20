// Momwell saying something that can't be recorded ahead: her name in a greeting, the companion's replies. The
// browser's own voice, under the same switch as everything else.
import { soundOn } from "./sound.ts";

type VoiceLike = { name: string; lang: string; localService?: boolean };

// A warm, natural voice in her language when the browser has one; online "Natural" voices sound best.
const PREFERRED = /natural|aria|jenny|samantha|zira|google us english|google uk english female|female|paulina|monica|sabina/i;

export function pickVoice<V extends VoiceLike>(voices: V[], lang: string): V | undefined {
  const base = lang.toLowerCase().split("-")[0];
  const same = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  return same.find((v) => /natural|neural/i.test(v.name)) ?? same.find((v) => PREFERRED.test(v.name)) ?? same.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ?? same[0];
}

/** Spanish if it reads as Spanish, else English: the companion answers in the language she writes in. */
export const langOf = (text: string) => (/[¿¡ñ]|\b(?:estoy|tengo|usted|bebé|hola|gracias|médico|ahora)\b/i.test(text) ? "es-US" : "en-US");

export function say(text: string, lang = langOf(text)) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !soundOn()) return;
  const synth = window.speechSynthesis;
  const speak = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.96;
    const v = pickVoice(synth.getVoices(), lang);
    if (v) u.voice = v;
    synth.speak(u);
  };
  // Voices load late in some browsers: wait for them once.
  if (synth.getVoices().length) speak();
  else synth.addEventListener("voiceschanged", speak, { once: true });
}

export function hush() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
