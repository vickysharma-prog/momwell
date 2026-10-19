import { defineTool } from "eve/tools";
import { z } from "zod";
import { FDA_SOURCE } from "../../lib/food/fda.ts";
import { nearbyFood } from "../../lib/qloo/food.ts";
import { idsOf } from "../../lib/taste/taste.ts";
import { tasteOf } from "../lib/taste.ts";
import { mother } from "../lib/who.ts";

export default defineTool({
  description: "Find places to eat near her from Qloo, by her taste and diet, each with what to ask for while pregnant (FDA advice, as plain rules).",
  inputSchema: z.object({}),
  label: { start: () => "Finding food near you" },
  async execute(_, ctx) {
    const me = await mother(ctx);
    const taste = await tasteOf(me.id);
    if (!taste?.city) return { picks: [], next: "Ask which city she lives in; she can add it on the What you love page." };
    const meals = await nearbyFood(idsOf(taste), taste.city, taste.diets, 6);
    return {
      from: "Qloo",
      source: FDA_SOURCE.url,
      picks: meals.map((m) => ({ name: m.entity.name, address: m.entity.properties?.address ?? null, image: m.entity.properties?.image?.url ?? null, askFor: m.notes.map((n) => n.text) })),
    };
  },
});
