import { supabaseAdmin } from "@/lib/supabase/admin";

// Called when the demo page opens: wakes the server and its database connection, so the click that follows is quick.
export async function GET() {
  await supabaseAdmin().from("demo_families").select("id", { head: true, count: "exact" }).is("claimed_at", null);
  return new Response(null, { status: 204 });
}
