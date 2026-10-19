// Her birth playlist: artists like the ones she plays, minus the loud and harsh genres. Calm is the point.
import { insights, tagId, type Entity } from "./api.ts";

const HARSH = /:(.*metal.*|.*core|punk|grindcore|noise|industrial|drill|horrorcore|thrash|screamo|dubstep|hardstyle|gabber)$/;

export const isCalm = (e: Entity) => !(e.tags ?? []).some((t) => tagId(t).startsWith("urn:tag:genre:music:") && HARSH.test(tagId(t)));

export async function birthPlaylist(likedIds: string[], take = 8): Promise<Entity[]> {
  if (!likedIds.length) return [];
  const found = await insights({ "filter.type": "urn:entity:artist", "signal.interests.entities": likedIds.join(","), take: take * 3 });
  return found.filter((e) => isCalm(e) && !likedIds.includes(e.entity_id)).slice(0, take);
}
