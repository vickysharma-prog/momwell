import { supabaseAdmin } from "../../lib/supabase/admin.ts";
import type { Taste } from "../../lib/taste/taste.ts";

export async function tasteOf(motherId: string): Promise<Taste | null> {
  const { data } = await supabaseAdmin().from("tastes").select("city, diets, liked").eq("mother_id", motherId).maybeSingle();
  return data as Taste | null;
}
