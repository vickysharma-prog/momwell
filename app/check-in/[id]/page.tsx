import { Screen } from "@/components/Screen";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { requireMe } from "@/lib/people/me";
import type { Reason } from "@/lib/safety/engine";

export default async function CheckInResult({ params }: PageProps<"/check-in/[id]">) {
  const { id } = await params;
  const { db, me } = await requireMe();
  const { data } = await db.from("checkins").select("mother_id, level, reasons, note").eq("id", id).maybeSingle();
  if (!data) notFound();
  const reasons = data.reasons as Reason[];

  return (
    <Screen className="settle">
      <ResultView result={{ level: data.level, reasons, crisis: reasons.some((r) => r.id === "harm_thoughts"), noteUnread: Boolean(data.note) }} />
      {data.note && (
        <section className="card">
          <p className="muted mb-1 text-sm">{data.mother_id === me.id ? "You wrote" : "She wrote"}</p>
          <p className="whitespace-pre-wrap text-lg">{data.note}</p>
        </section>
      )}
      <Link href="/home" className="btn-quiet">
        Back home
      </Link>
    </Screen>
  );
}
