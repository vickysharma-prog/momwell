import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { requireMe } from "@/lib/people/me";
import type { Reason } from "@/lib/safety/engine";

export default async function CheckInResult({ params }: PageProps<"/check-in/[id]">) {
  const { id } = await params;
  const { db } = await requireMe();
  const { data } = await db.from("checkins").select("level, reasons").eq("id", id).maybeSingle();
  if (!data) notFound();
  const reasons = data.reasons as Reason[];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-8">
      <ResultView result={{ level: data.level, reasons, crisis: reasons.some((r) => r.id === "harm_thoughts") }} />
      <Link href="/home" className="btn-quiet">
        Back home
      </Link>
    </main>
  );
}
