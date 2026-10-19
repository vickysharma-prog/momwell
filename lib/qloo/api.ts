import { qloo, type Params } from "./client.ts";

export type QlooTag = { tag_id?: string; id?: string; name?: string };
export type Entity = {
  entity_id: string;
  name: string;
  types?: string[];
  subtype?: string;
  tags?: QlooTag[];
  popularity?: number;
  properties?: { image?: { url?: string }; geocode?: { city?: string }; address?: string; website?: string; description?: string; release_year?: number };
  query?: { affinity?: number };
};

export const tagId = (t: QlooTag) => t.tag_id ?? t.id ?? "";

/** `types`: only these entity types, comma separated (for example "urn:entity:tv_show"). */
export async function search(query: string, take = 5, types?: string): Promise<Entity[]> {
  const d = await qloo<{ results?: Entity[] }>("/search", { query, take, types });
  return d.results ?? [];
}

export async function insights(params: Params): Promise<Entity[]> {
  const d = await qloo<{ results?: { entities?: Entity[] } }>("/v2/insights", params);
  return d.results?.entities ?? [];
}

/**
 * Wider and wider ways to say a place: "Park Slope, Brooklyn, NY", then "Brooklyn, NY". Qloo finds nothing for many
 * neighbourhood names, so a search steps out to the city, never to a country alone.
 */
export function placesToTry(location: string): string[] {
  const parts = location.split(",").map((x) => x.trim()).filter(Boolean);
  const last = parts.length > 2 ? parts.length - 2 : parts.length - 1;
  return Array.from({ length: Math.max(1, last + 1) }, (_, i) => parts.slice(i).join(", ")).filter(Boolean);
}
