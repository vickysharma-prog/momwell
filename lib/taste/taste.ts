import { z } from "zod";
import { DIETS, type Diet } from "../food/fda.ts";

export const KINDS = ["tv_show", "movie", "artist"] as const;
export type Kind = (typeof KINDS)[number];
export type Liked = { id: string; name: string; kind: Kind };
export type Taste = { city: string; diets: Diet[]; liked: Liked[] };

const liked = z.object({ id: z.string().regex(/^[A-Za-z0-9-]{8,64}$/), name: z.string().min(1).max(120), kind: z.enum(KINDS) });
const taste = z.object({
  city: z.string().trim().max(80),
  diets: z.array(z.enum(Object.keys(DIETS) as [Diet, ...Diet[]])),
  liked: z.array(liked).max(30),
});

// The "What you love" form: city, diet boxes, and the picks as one JSON field. Duplicates dropped, order kept.
export function readTaste(form: FormData): { ok: true; value: Taste } | { ok: false; error: string } {
  let picks: unknown;
  try {
    picks = JSON.parse(String(form.get("liked") ?? "[]"));
  } catch {
    return { ok: false, error: "Something went wrong with your picks. Please try again." };
  }
  const parsed = taste.safeParse({ city: form.get("city") ?? "", diets: form.getAll("diets"), liked: picks });
  if (!parsed.success) return { ok: false, error: "Something in the form didn’t come through. Please try again." };
  const seen = new Set<string>();
  return { ok: true, value: { ...parsed.data, liked: parsed.data.liked.filter((l) => !seen.has(l.id) && seen.add(l.id)) } };
}

export const idsOf = (t: Taste | null, kinds: readonly Kind[] = KINDS) => (t?.liked ?? []).filter((l) => kinds.includes(l.kind)).map((l) => l.id);
