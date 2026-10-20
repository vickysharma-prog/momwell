import { defineTool } from "eve/tools";
import { z } from "zod";
import { musicPicks } from "../../lib/qloo/picks.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find calm artists for her birth playlist from Qloo, from the music she already loves.",
  inputSchema: z.object({}),
  label: { start: () => "Building your birth playlist" },
  async execute(_, ctx) {
    const me = await mother(ctx);
    return musicPicks(await tasteOf(me.id));
  },
});
