// Today's plan: Momwell's planner (a model with the companion's Qloo tools) chooses a show, a place to eat and an
// artist for her evening from what Qloo finds for her taste, and writes two short notes, one to her and one to her
// family. It sees only her taste and what she asked her people for, never her symptoms or mood. Rules check what it
// chose; if the model can't run, the rules put the plan together from Qloo's first picks and say so.
import { generateText, hasToolCall, stepCountIs, tool, type LanguageModel } from "ai";
import { z } from "zod";
import { foodPicks, musicPicks, showPicks, type Pick } from "../qloo/picks.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ASK_KINDS, type AskKind } from "../help/asks.ts";
import { chatModel } from "../models.ts";
import type { Taste } from "../taste/taste.ts";

export type PlanPicks = { show: Pick | null; place: Pick | null; artist: Pick | null };
export type TraceStep = { who: "Momwell" | "Qloo" | "Rules"; did: string };
export type Plan = { picks: PlanPicks; noteHer: string; noteCircle: string; madeBy: "agent" | "rules"; trace: TraceStep[] };

export const RULES_NOTE_HER = "A gentle evening, picked through Qloo from what you love.";
export const RULES_NOTE_CIRCLE = "A night in she’d love, picked through Qloo from her taste.";

// A note never talks about her health: that is the rules' job, on top of the plan.
const UNSAFE = /medic|dose|\bmg\b|pill|diagnos|preeclampsia|depress|anxi|symptom|pain|bleed|fever|headache|blood pressure|doctor|hospital|warning/i;
export const safeNote = (note: string | undefined, fallback: string) => (note && note.trim().length > 0 && note.length <= 240 && !UNSAFE.test(note) ? note.trim() : fallback);

/** The model's choice, only if Qloo actually offered it; otherwise Qloo's first pick. */
export const pickFrom = (offered: Pick[] | undefined, chosen: string | undefined) => offered?.find((p) => p.name.toLowerCase() === chosen?.trim().toLowerCase()) ?? offered?.[0] ?? null;

/** The plan from rules alone: Qloo's first pick of each, and plain notes. */
export async function rulesPlan(taste: Taste | null, why: string): Promise<Plan> {
  const [shows, food, music] = await Promise.all([showPicks(taste), foodPicks(taste), musicPicks(taste)]);
  return {
    picks: { show: shows.picks[0] ?? null, place: food.picks[0] ?? null, artist: music.picks[0] ?? null },
    noteHer: RULES_NOTE_HER,
    noteCircle: RULES_NOTE_CIRCLE,
    madeBy: "rules",
    trace: [
      { who: "Qloo", did: `Found ${shows.picks.length} gentle shows, ${food.picks.length} places to eat and ${music.picks.length} calm artists from her taste.` },
      { who: "Rules", did: `Took Qloo’s first pick of each (${why}).` },
    ],
  };
}

const SYSTEM = `You plan one gentle evening for a mother in pregnancy or the year after birth, and for the family who helps her.
Use the tools: find_shows, find_food and find_music return what Qloo picked from her taste. Call the ones you need, then
call set_plan once with one show, one place and one artist, each copied exactly from the tool results, plus two short,
warm notes (one or two sentences each) that name what you chose: note_her speaks to her; note_circle tells her family
one thing to do tonight (for example, bring dinner from the place you chose), and should fit what she asked them for. Never mention health,
symptoms, medicines, doctors or feelings she has not shared. Plain, kind words.`;

/** The planner: a model that chooses which Qloo tools to call and what to pick. Null if it couldn't finish. */
export async function agentPlan(taste: Taste | null, asks: string[], model: LanguageModel, timeoutMs = 45_000): Promise<Plan | null> {
  const trace: TraceStep[] = [];
  const offered: { shows?: Pick[]; food?: Pick[]; music?: Pick[] } = {};
  let chosen: { show?: string; place?: string; artist?: string; note_her?: string; note_circle?: string } | null = null;
  const qloo = (name: string, what: string, get: () => Promise<{ picks: Pick[] }>, key: keyof typeof offered) =>
    tool({
      description: `What Qloo picked for her: ${what}.`,
      inputSchema: z.object({}),
      execute: async () => {
        trace.push({ who: "Momwell", did: `Asked for ${what} (${name}).` });
        const r = await get();
        offered[key] = r.picks;
        trace.push({ who: "Qloo", did: `Answered with ${r.picks.length}: ${r.picks.slice(0, 3).map((p) => p.name).join(", ")}${r.picks.length > 3 ? "…" : ""}.` });
        return r.picks.map((p) => ({ name: p.name, ...(p.askFor?.length && { askFor: p.askFor }) }));
      },
    });
  try {
    await generateText({
      model,
      system: SYSTEM,
      prompt: `Her city: ${taste?.city ?? "unknown"}. Her diet: ${taste?.diets?.join(", ") || "none given"}. What she asked her family for today: ${asks.join("; ") || "nothing yet"}.`,
      tools: {
        find_shows: qloo("find_shows", "gentle shows like the ones she loves", () => showPicks(taste), "shows"),
        find_food: qloo("find_food", "places to eat near her that fit her diet", () => foodPicks(taste), "food"),
        find_music: qloo("find_music", "calm artists for her evening", () => musicPicks(taste), "music"),
        set_plan: tool({
          description: "Save tonight's plan.",
          inputSchema: z.object({ show: z.string(), place: z.string(), artist: z.string(), note_her: z.string(), note_circle: z.string() }),
          execute: async (a) => {
            chosen = a;
            return "saved";
          },
        }),
      },
      stopWhen: [hasToolCall("set_plan"), stepCountIs(6)],
      timeout: timeoutMs,
    });
  } catch {
    return null;
  }
  const c = chosen as { show?: string; place?: string; artist?: string; note_her?: string; note_circle?: string } | null;
  if (!c) return null;
  const picks = { show: pickFrom(offered.shows, c.show), place: pickFrom(offered.food, c.place), artist: pickFrom(offered.music, c.artist) };
  trace.push({ who: "Momwell", did: `Chose ${[picks.show?.name, picks.place?.name, picks.artist?.name].filter(Boolean).join(", ")} and wrote the notes.` });
  trace.push({ who: "Rules", did: "Checked each choice came from Qloo’s answers and that the notes say nothing about her health." });
  return { picks, noteHer: safeNote(c.note_her, RULES_NOTE_HER), noteCircle: safeNote(c.note_circle, RULES_NOTE_CIRCLE), madeBy: "agent", trace };
}

/** Today's plan for her: the planner's if it finishes, the rules' otherwise, saved for her and her family to read. */
export async function makePlan(admin: SupabaseClient, motherId: string, forDate: string): Promise<Plan> {
  const [{ data: t }, { data: a }] = await Promise.all([
    admin.from("tastes").select("city, diets, liked").eq("mother_id", motherId).maybeSingle(),
    admin.from("asks").select("kind, note").eq("mother_id", motherId).eq("needed_on", forDate),
  ]);
  const taste = (t as Taste | null) ?? null;
  const asks = ((a ?? []) as { kind: AskKind; note: string }[]).map((x) => [ASK_KINDS[x.kind]?.label, x.note].filter(Boolean).join(": "));
  let plan: Plan | null = null;
  try {
    plan = await agentPlan(taste, asks, chatModel(process.env, { tools: true }));
  } catch {}
  plan ??= await rulesPlan(taste, "the planner couldn't answer in time");
  const { error } = await admin.from("plans").upsert(
    { mother_id: motherId, for_date: forDate, picks: plan.picks, note_her: plan.noteHer, note_circle: plan.noteCircle, made_by: plan.madeBy, trace: plan.trace },
    { onConflict: "mother_id,for_date" },
  );
  if (error) throw error;
  return plan;
}
