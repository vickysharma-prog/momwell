import Link from "next/link";
import { Guide } from "@/components/Guide";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/AppPage";
import { CheckInForm } from "@/components/CheckInForm";
import { requireMe } from "@/lib/people/me";
import { babySignsFor } from "@/lib/safety/baby";
import { SOURCES } from "@/lib/safety/sources";
import { stageFrom } from "@/lib/safety/stage";

const age = (days: number) => (days < 14 ? `${days} days old` : days < 90 ? `${Math.floor(days / 7)} weeks old` : `${Math.floor(days / 30.4)} months old`);

// Her baby's check-in through the first year: the warning signs for the baby's age, decided by the baby rules.
export default async function Baby() {
  const { db, me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  const { data: dates } = await db.from("mothers").select("due_date, birth_date").eq("id", me.id).maybeSingle();
  const stage = stageFrom(dates ?? {}, new Date());
  if (stage.kind !== "after_birth")
    return (
      <AppPage className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">Your baby</h1>
        <p className="text-lg text-ink-soft">Once your baby is here, add the birth date in today’s check-in and you can check on your baby here too.</p>
        <Link href="/check-in" className="btn w-fit px-8">
          Today’s check-in
        </Link>
      </AppPage>
    );
  return (
    <AppPage>
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl sm:text-5xl">Your baby</h1>
        <p className="text-lg text-ink-soft">{age(stage.days)}. Tap anything that’s true right now.</p>
      </header>
      <Guide line="guide_baby" />
      <CheckInForm baby signs={babySignsFor(stage.days).map(({ id, label }) => ({ id, label }))} />
      <p className="text-sm text-ink-soft">
        From{" "}
        <a className="underline underline-offset-4" href={SOURCES.aapFever.url} target="_blank" rel="noreferrer">
          the AAP
        </a>{" "}
        and{" "}
        <a className="underline underline-offset-4" href={SOURCES.childrensEmergency.url} target="_blank" rel="noreferrer">
          Children’s Hospital Colorado
        </a>
        . Not every worry is on a list: if something feels wrong, call your baby’s doctor.
      </p>
    </AppPage>
  );
}
