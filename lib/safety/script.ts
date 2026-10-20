// What to say when she calls: AWHONN's line, "I gave birth on (date) and I am having (warning signs)", with her
// stage and what she reported filled in, so she doesn't have to find the words while she's frightened.
import type { Reason } from "./engine.ts";
import { SIGNS } from "./signs.ts";
import type { Stage } from "./signs.ts";

const when = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

// Her own numbers first: a fever from her reading and the fever sign share an id.
function item(r: Reason) {
  const bp = /(\d{2,3}\/\d{2,3})/.exec(r.text);
  if (r.id.startsWith("bp_") && bp) return `a blood pressure of ${bp[1]}`;
  const t = /(\d+(?:\.\d+)?°[FC])/.exec(r.text);
  if (r.id === "fever" && t) return `a temperature of ${t[1]}`;
  const sign = SIGNS.find((s) => s.id === r.id);
  return sign ? sign.label.charAt(0).toLowerCase() + sign.label.slice(1) : null;
}

export function tellThem(stage: Stage, dates: { birth_date?: string | null }, weeks: number | null, reasons: Reason[]) {
  const items = reasons.filter((r) => r.level === "urgent" || r.level === "call_doctor").map(item).filter((x): x is string => Boolean(x));
  if (!items.length) return undefined;
  const who =
    stage.kind === "after_birth" && dates.birth_date ? `I gave birth on ${when(dates.birth_date)}` : stage.kind === "pregnant" && weeks ? `I am ${weeks} weeks pregnant` : "I am pregnant or gave birth in the last year";
  const list = items.length === 1 ? items[0] : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
  return `${who}, and I am having ${list}.`;
}
