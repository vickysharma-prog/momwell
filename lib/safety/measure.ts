// Precision and recall of a sign detector over labelled messages, per message and per sign.
import type { SignId } from "./signs.ts";
import type { Labelled } from "./words.dataset.ts";

export type Score = { messages: number; truePositives: number; falsePositives: number; falseNegatives: number; precision: number; recall: number; missedMessages: string[]; flaggedClean: string[] };

export function measure(detect: (text: string) => SignId[], data: Labelled[]): Score {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  const missedMessages: string[] = [];
  const flaggedClean: string[] = [];
  for (const { text, signs } of data) {
    const got = new Set(detect(text));
    const want = new Set(signs);
    for (const s of got) (want.has(s) ? tp++ : fp++);
    for (const s of want) if (!got.has(s)) fn++;
    if (want.size && !signs.every((s) => got.has(s))) missedMessages.push(text);
    if (!want.size && got.size) flaggedClean.push(text);
  }
  const round = (x: number) => Math.round(x * 1000) / 1000;
  return {
    messages: data.length,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    precision: round(tp + fp ? tp / (tp + fp) : 1),
    recall: round(tp + fn ? tp / (tp + fn) : 1),
    missedMessages,
    flaggedClean,
  };
}
