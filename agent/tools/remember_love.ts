import { defineTool } from "eve/tools";
import { z } from "zod";
import { search } from "../../lib/qloo/api.ts";
import { supabaseAdmin } from "../../lib/supabase/admin.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Look up a show, film or artist she says she loves in Qloo and remember it, so her picks fit her better.",
  inputSchema: z.object({ name: z.string().min(1).max(80), kind: z.enum(["tv_show", "movie", "artist"]) }),
  label: { start: ({ name }) => `Remembering ${name}` },
  async execute({ name, kind }, ctx) {
    const me = await mother(ctx);
    const [found] = await search(name, 1, `urn:entity:${kind}`);
    if (!found) return { saved: false, note: `Qloo has no match for ${name}.` };
    const taste = (await tasteOf(me.id)) ?? { city: "", diets: [], liked: [] };
    if (taste.liked.some((l) => l.id === found.entity_id)) return { saved: true, name: found.name };
    const liked = [...taste.liked, { id: found.entity_id, name: found.name, kind }].slice(-30);
    const { error } = await supabaseAdmin().from("tastes").upsert({ mother_id: me.id, city: taste.city, diets: taste.diets, liked, updated_at: new Date().toISOString() });
    return error ? { saved: false, note: "Couldn't save that right now." } : { saved: true, name: found.name };
  },
});
