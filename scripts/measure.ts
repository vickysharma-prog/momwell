// Prints the measured numbers for the safety layers that need no model: the browser word scan over the labelled
// messages, and the rules engine over every sign and threshold. Run: node scripts/measure.ts
import { evaluate } from "../lib/safety/engine.ts";
import { measure } from "../lib/safety/measure.ts";
import { SIGN_IDS } from "../lib/safety/signs.ts";
import { signsInWords } from "../lib/safety/words.ts";
import { KNOWN_OVERREACH, NEGATIVES, POSITIVES } from "../lib/safety/words.dataset.ts";

const pos = measure(signsInWords, POSITIVES);
const neg = measure(signsInWords, NEGATIVES);
const over = measure(signsInWords, KNOWN_OVERREACH);
const engine = SIGN_IDS.filter((id) => evaluate({ signs: [id] }).level === "urgent").length;

console.log(`Word scan, ${pos.messages} messages with warning signs: recall ${pos.recall}, ${pos.missedMessages.length} missed`);
console.log(`Word scan, ${neg.messages} everyday messages: ${neg.flaggedClean.length} flagged`);
console.log(`Word scan overall precision ${measure(signsInWords, [...POSITIVES, ...NEGATIVES]).precision}`);
console.log(`Known overreach (someone else's symptom, a question): ${over.flaggedClean.length} of ${over.messages} show the list, by design`);
console.log(`Rules engine: ${engine} of ${SIGN_IDS.length} CDC signs give "get care now" on their own`);
