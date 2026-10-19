import { defineTool } from "eve/tools";
import { z } from "zod";
import { birthPlaylist } from "../../lib/qloo/music.ts";
import { idsOf } from "../../lib/taste/taste.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find calm artists for her birth playlist from Qloo, from the music she already loves.",
  inputSchema: z.object({}),
  label: { start: () => "Building your birth playlist" },
  async execute(_, ctx) {
    const me = await mother(ctx);
    const taste = await tasteOf(me.id);
    const artists = idsOf(taste, ["artist"]);
    const ids = artists.length ? artists : idsOf(taste);
    if (!ids.length) return { picks: [], next: "Ask which artists she loves, then use remember_love." };
    const picks = await birthPlaylist(ids, 8);
    return { from: "Qloo", picks: picks.map((p) => ({ name: p.name, image: p.properties?.image?.url ?? null })) };
  },
});
