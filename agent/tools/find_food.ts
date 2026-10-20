import { defineTool } from "eve/tools";
import { z } from "zod";
import { foodPicks } from "../../lib/qloo/picks.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find places to eat near her from Qloo, by her taste and diet, each with what to ask for while pregnant (FDA advice, as plain rules).",
  inputSchema: z.object({}),
  label: { start: () => "Finding food near you" },
  async execute(_, ctx) {
    const me = await mother(ctx);
    return foodPicks(await tasteOf(me.id));
  },
});
