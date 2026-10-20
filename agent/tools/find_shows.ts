import { defineTool } from "eve/tools";
import { z } from "zod";
import { showPicks } from "../../lib/qloo/picks.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find gentle shows or films for her from Qloo, picked from what she loves, with grief, loss, pregnancy scares and horror left out.",
  inputSchema: z.object({ kind: z.enum(["tv_show", "movie"]).optional() }),
  label: { start: ({ kind }) => (kind === "movie" ? "Finding a gentle film" : "Finding a gentle show") },
  async execute({ kind }, ctx) {
    const me = await mother(ctx);
    return showPicks(await tasteOf(me.id), kind ?? "tv_show");
  },
});
