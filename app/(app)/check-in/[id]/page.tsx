import { AppPage } from "@/components/AppPage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HowDecided } from "@/components/HowDecided";
import { ResultView } from "@/components/ResultView";
import { requireMe } from "@/lib/people/me";
import type { Level, Reason } from "@/lib/safety/engine";

export default async function CheckInResult({ params }: PageProps<"/check-in/[id]">) {
  const { id } = await params;
  const { db, me } = await requireMe();
  const { data } = await db.from("checkins").select("id, mother_id, level, reasons, note, source, engine_version, systolic").eq("id", id).maybeSingle();
  if (!data) notFound();
  const reasons = data.reasons as Reason[];

  return (
    <AppPage className="max-w-2xl">
      <ResultView result={{ level: data.level, reasons, crisis: reasons.some((r) => r.id === "harm_thoughts"), noteUnread: Boolean(data.note) }} voice={data.mother_id === me.id} />
      {data.note && (
        <section className="card">
          <p className="muted mb-1 text-sm">{data.mother_id === me.id ? "You wrote" : "She wrote"}</p>
          <p className="whitespace-pre-wrap text-lg">{data.note}</p>
        </section>
      )}
      <HowDecided db={db} checkin={{ ...data, level: data.level as Level, reasons }} />
      <Link href="/home" className="btn-quiet">
        Back home
      </Link>
    </AppPage>
  );
}
