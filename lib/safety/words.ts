// A plain word scan on what she types or says to the companion, run in the browser before the model answers. It
// never decides anything: a hit only puts the warning-sign list in front of her. So the model is never the only way
// a sign is noticed. English and Spanish.
import type { SignId } from "./signs.ts";

// Every pattern is wrapped in \b(?:…) so no alternative matches inside another word ("tired legs" is not "red leg").
const w = (body: string) => new RegExp(`\\b(?:${body})`, "i");

const WORDS: [SignId, RegExp][] = [
  ["headache", w("headache|migraine|head (?:has been |is |keeps |won'?t stop )?(?:hurting|hurts|pounding|throbbing|killing me)|dolor de cabeza|me duele la cabeza")],
  ["dizziness", w("dizzy|dizziness|faint(?:ed|ing)?|passed out|blacked out|mareada|desmay")],
  ["vision", w("blurr(?:y|ed) vision|vision is blurry|blind spots?|seeing spots|flashes of light|double vision|can'?t see|visi[oó]n borrosa")],
  ["fever", w("fever|temperature of|chills|fiebre")],
  ["swelling", w("(?:swollen|swelling|puffy) (?:face|hands?|fingers|eyes|lips)|(?:face|hands?|fingers) (?:are |is )?(?:swollen|puffy)|hinchaz[oó]n")],
  ["harm_thoughts", w("hurt(?:ing)? (?:myself|my baby|the baby)|kill(?:ing)? myself|end (?:it|my life)|suicid|don'?t want to (?:be here|live)|harm (?:myself|my baby)|hacerme daño|quitarme la vida")],
  ["breathing", w("can'?t breathe|short(?:ness)? of breath|trouble breathing|hard to breathe|no puedo respirar")],
  ["chest_heart", w("chest (?:pain|hurts|tight)|heart (?:is )?(?:racing|pounding)|palpitations|dolor (?:en el|de) pecho")],
  ["vomiting", w("throwing up|vomit(?:ing)?|can'?t keep (?:anything|water|fluids|food) down|v[oó]mito")],
  ["belly_pain", w("(?:belly|stomach|abdominal|tummy) (?:pain|hurts|cramps?)|severe cramp|dolor (?:de|en el) (?:est[oó]mago|vientre|abdomen)")],
  ["baby_movement", w("(?:baby|bebé|bebe)(?:'?s)? (?:isn'?t|is not|hasn'?t been|stopped|not) mov|(?:not|less) (?:feeling|felt) (?:the )?(?:baby|kicks)|no (?:siento|se mueve)")],
  ["bleeding_pregnant", w("bleeding|blood|spotting|leaking fluid|water broke|sangrado|sangre")],
  ["leg_arm", w("(?:leg|calf|arm) (?:is )?(?:swollen|red|hot|hurts|pain)|(?:swollen|painful|red) (?:leg|calf|arm)")],
  ["tiredness", w("exhausted|so tired|can'?t get up|too tired to (?:care|look after)")],
];

const NEGATED = /\b(no|not|never|without|don'?t have|haven'?t had|sin)\b[^.!?]{0,20}$/i;

/** Signs her words might point to. Generous on purpose; a phrase right after "no" or "not" is skipped. */
export function signsInWords(text: string): SignId[] {
  const hits = new Set<SignId>();
  for (const [id, re] of WORDS) {
    const m = re.exec(text);
    if (m && !NEGATED.test(text.slice(0, m.index))) hits.add(id);
  }
  return [...hits];
}
