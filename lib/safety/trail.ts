// "How this was decided": the plain record of a check-in, from what she said to who was told, so anyone can see the
// rules decided, not a model.
import type { Level, Reason } from "./engine.ts";
import { needs911, TIER_SOURCE } from "./tier.ts";

export type CheckInSource = "tap" | "talk" | "mood";

export type TrailInput = {
  source: CheckInSource;
  subject?: "mother" | "baby";
  engineVersion: string;
  level: Level;
  reasons: Reason[];
  hadBp: boolean;
  told: string[]; // who was alerted, e.g. "Sam (partner)"
  seenBy: string | null;
};

export type Step = { title: string; detail: string; link?: { label: string; url: string } };

export function trail(t: TrailInput): Step[] {
  const steps: Step[] = [
    t.subject === "baby"
      ? { title: "About her baby", detail: "She tapped what was true from the warning signs for babies (AAP and Children’s Hospital Colorado) and added a temperature if she took one." }
      : t.source === "talk"
      ? { title: "Her words", detail: "She told Momwell in her own words. The companion only named the warning signs it heard, and may add a sign, never remove one." }
      : t.source === "mood"
        ? { title: "Her mood check", detail: "On the PHQ-9 she answered that she has had thoughts of hurting herself. Any answer but “not at all” counts as this warning sign. Her other answers stay in her mood check." }
        : { title: "Her answers", detail: "She tapped what was true from the CDC’s warning-sign list and added her readings." },
    { title: "The rules decided", detail: `Momwell’s rules engine (version ${t.engineVersion}) checked each sign and reading. No AI model made this decision.` },
  ];
  for (const r of t.reasons) steps.push({ title: r.level === "urgent" ? (t.subject === "baby" ? "Rule: call 911" : "Rule: get care now") : r.level === "call_doctor" ? "Rule: call the doctor" : r.level === "check" ? "Rule: check the reading" : "Rule: when to call", detail: r.text, link: { label: r.source.title, url: r.source.url } });
  if (!t.reasons.length) steps.push({ title: "No rule fired", detail: "Nothing she reported is on the warning-sign list." });
  if (t.hadBp) steps.push({ title: "Blood pressure limits", detail: "140/90 or higher: call her doctor (ACOG). 160/110 or higher: care now (NIH). Either number alone counts." });
  if ((t.level === "urgent" || t.level === "call_doctor") && t.subject !== "baby")
    steps.push(
      needs911(t.reasons)
        ? { title: "Which call: 911", detail: "Chest pain, trouble breathing, thoughts of hurting yourself, and blood pressure of 160/110 or higher are 911 signs. So the first button was Call 911.", link: { label: TIER_SOURCE.title, url: TIER_SOURCE.url } }
        : { title: "Which call: her doctor, now", detail: "This is a warning sign to call her doctor about right away, not a 911 sign. If she can't reach them, 911 or the emergency room.", link: { label: TIER_SOURCE.title, url: TIER_SOURCE.url } },
    );
  if (t.level === "urgent" || t.level === "call_doctor") {
    steps.push({ title: "Who was told", detail: t.told.length ? `An alert went to ${t.told.join(", ")}. Only people she shares alerts with; the detail only to those she shares ${t.subject === "baby" ? "baby updates" : "check-ins"} with.` : "No one: she hasn’t shared alerts with anyone yet." });
    steps.push({ title: "Seen", detail: t.seenBy ? `${t.seenBy} marked it seen.` : "Not seen by her care team yet." });
  }
  return steps;
}
