import { cleanOldFamilies, fillPool } from "@/lib/demo/create";

// Vercel Cron, once a day: demo families opened over two days ago are removed with their accounts and data, and the
// pool of ready families is topped up.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) return new Response("Unauthorized", { status: 401 });
  const removed = await cleanOldFamilies();
  await fillPool();
  return Response.json({ removed });
}
