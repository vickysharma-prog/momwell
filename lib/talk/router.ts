// What she said, sorted by plain rules before any model: thoughts of harm first, then warning signs and readings, then
// how she feels. Each of those gets an answer at once. What's left (shows, food, music through Qloo, anything else,
// and anything in Spanish) goes to the companion. Nothing here is recorded until she confirms it.
import { evaluate, type Reading } from "../safety/engine.ts";
import type { SignId } from "../safety/signs.ts";
import { signsInWords } from "../safety/words.ts";

/** Spanish if it reads as Spanish: the companion answers in the language she writes in. */
export const isSpanish = (text: string) => /[¿¡ñ]|\b(?:estoy|tengo|usted|bebé|hola|gracias|médico|ahora|qué|puedo)\b/i.test(text);

export type Feeling = "low" | "sleep" | "good" | "greet" | "thanks" | "help" | "medical";
export type Route =
  | { kind: "crisis"; signs: SignId[] }
  | { kind: "confirm"; signs: SignId[]; reading: Reading }
  | { kind: "feeling"; feeling: Feeling }
  | { kind: "qloo"; what: Want }
  | { kind: "menu" };

export type Want = "shows" | "food" | "music";

// A blood pressure only next to the words for it, so a date like 10/20 is never read as one.
const BP = /\b(?:blood pressure|bp|pressure)\b\D{0,24}?\b(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})\b/i;
const TEMP = /\b(?:temp(?:erature)?|fever)\b\D{0,16}?\b(\d{2,3}(?:\.\d)?)\s*°?\s*([fc])?\b/i;

export function readingIn(text: string): Reading {
  const bp = BP.exec(text);
  const t = TEMP.exec(text);
  const value = t ? Number(t[1]) : NaN;
  const unit = t?.[2]?.toUpperCase() === "C" || (!t?.[2] && value < 45) ? "C" : "F";
  return { ...(bp && { bp: { systolic: Number(bp[1]), diastolic: Number(bp[2]) } }), ...(t && { temp: { value, unit } }) };
}

const FEELINGS: [Feeling, RegExp][] = [
  ["medical", /\b(?:medicine|medication|pill|tylenol|ibuprofen|advil|dose|dosage|is it safe to take|can i take)\b/i],
  ["low", /\b(?:sad|down|low|lonely|alone|anxious|anxiety|worried|worry|scared|afraid|overwhelmed|crying|cry|stressed|hopeless|empty|numb)\b/i],
  ["sleep", /\b(?:can'?t sleep|cannot sleep|couldn'?t sleep|insomnia|wide awake|up all night)\b/i],
  ["help", /\b(?:need help|help me with|someone to help|ask (?:my )?(?:people|family|husband|partner))\b/i],
  ["thanks", /\b(?:thank you|thanks|thx)\b/i],
  ["good", /\b(?:i'?m (?:good|great|fine|okay|ok|well|happy)|feeling (?:good|great|fine|better|well)|doing (?:good|great|fine|well))\b/i],
  ["greet", /^\s*(?:hi|hello|hey|good (?:morning|afternoon|evening))\b/i],
];

// What she asks Qloo for: the companion's own tools, called straight away.
const WANTS: [Want, RegExp][] = [
  ["food", /\b(?:food|eat|eating|hungry|dinner|lunch|breakfast|restaurants?|takeout|craving)\b/i],
  ["music", /\b(?:music|songs?|playlist|listen|artists?)\b/i],
  ["shows", /\b(?:shows?|watch|movies?|films?|series|tv|netflix)\b/i],
];

// Rules, most serious first: thoughts of harm, warning signs and readings, something she asks Qloo for, how she feels.
// Anything else (or in Spanish) gets the menu at once, and the companion answers too when it can.
export function route(text: string): Route {
  const signs = signsInWords(text);
  if (signs.includes("harm_thoughts")) return { kind: "crisis", signs };
  const reading = readingIn(text);
  if (signs.length || evaluate({ signs: [], ...reading }).level !== "none") return { kind: "confirm", signs, reading };
  if (isSpanish(text)) return { kind: "menu" };
  for (const [what, re] of WANTS) if (re.test(text)) return { kind: "qloo", what };
  for (const [feeling, re] of FEELINGS) if (re.test(text)) return { kind: "feeling", feeling };
  return { kind: "menu" };
}
