import { defineTool } from "eve/tools";
import { z } from "zod";
import { recordCheckIn } from "../../lib/checkin/record.ts";
import { ACTION } from "../../lib/safety/engine.ts";
import { SIGN_IDS, type SignId } from "../../lib/safety/signs.ts";
import { CRISIS_LINES } from "../../lib/safety/sources.ts";
import { mother } from "../lib/who.ts";

// The model only names what she said; the rules engine decides what it means, exactly as for the tap check-in.
export default defineTool({
  description:
    "Record what she says is happening to her now as a check-in. Call this at once whenever anything she says could be a warning sign, with every sign that might match (include when unsure), plus any blood pressure or temperature she gives. The rules decide the level; tell her what the `say` field says.",
  inputSchema: z.object({
    signs: z.array(z.enum(SIGN_IDS as [SignId, ...SignId[]])).describe("warning signs she describes, by id"),
    systolic: z.number().int().optional().describe("top blood pressure number, if she gave one"),
    diastolic: z.number().int().optional().describe("bottom blood pressure number, if she gave one"),
    temperature: z.number().optional(),
    temperatureUnit: z.enum(["F", "C"]).optional(),
    words: z.string().max(500).describe("her own words, briefly, as she said them"),
  }),
  label: { start: () => "Checking that with the warning-sign rules" },
  async execute(input, ctx) {
    const me = await mother(ctx);
    const bp = input.systolic !== undefined && input.diastolic !== undefined ? { systolic: input.systolic, diastolic: input.diastolic } : undefined;
    const temp = input.temperature !== undefined ? { value: input.temperature, unit: input.temperatureUnit ?? ("F" as const) } : undefined;
    const saved = await recordCheckIn(me.id, { signs: input.signs, bp, temp, note: input.words });
    const { level, reasons, crisis } = saved.result;
    return {
      level,
      say: ACTION[level],
      // The whole reasons, with their sources: the app shows the same warning screen as the tap check-in.
      reasons,
      // The model read her words, so they are not an unread note here.
      noteUnread: false,
      crisis,
      crisisLines: crisis ? CRISIS_LINES.map((c) => `${c.name}: call or text ${c.call}`) : [],
      checkinId: saved.id,
      saved: saved.problem !== "not_saved",
      peopleAlerted: (level === "urgent" || level === "call_doctor") && !saved.problem,
    };
  },
});
