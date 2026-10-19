import { cleanOldFamilies } from "@/lib/demo/create";

// Vercel Cron, once a day: demo families older than two days are removed with their accounts and data.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) return new Response("Unauthorized", { status: 401 });
  return Response.json({ removed: await cleanOldFamilies() });
}
