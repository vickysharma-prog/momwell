import { defineTool } from "eve/tools";
import { z } from "zod";
import { safeWatch } from "../../lib/qloo/safewatch.ts";
import { idsOf } from "../../lib/taste/taste.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find gentle shows or films for her from Qloo, picked from what she loves, with grief, loss, pregnancy scares and horror left out.",
  inputSchema: z.object({ kind: z.enum(["tv_show", "movie"]).optional() }),
  label: { start: ({ kind }) => (kind === "movie" ? "Finding a gentle film" : "Finding a gentle show") },
  async execute({ kind }, ctx) {
    const me = await mother(ctx);
    const taste = await tasteOf(me.id);
    const watched = idsOf(taste, ["tv_show", "movie"]);
    const ids = watched.length ? watched : idsOf(taste);
    if (!ids.length) return { picks: [], next: "Ask what shows or films she loves, then use remember_love." };
    const picks = await safeWatch(ids, kind ?? "tv_show", 6);
    return { from: "Qloo", picks: picks.map((p) => ({ name: p.name, image: p.properties?.image?.url ?? null })) };
  },
});
