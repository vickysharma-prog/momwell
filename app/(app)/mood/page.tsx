import { redirect } from "next/navigation";
import { AppPage } from "@/components/AppPage";
import { MoodForm } from "@/components/mood/MoodForm";
import { requireMe } from "@/lib/people/me";
import { SOURCES } from "@/lib/safety/sources";

// The mood check, every two weeks: how she has been feeling, in the questions doctors use.
export default async function Mood() {
  const { me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  return (
    <AppPage className="max-w-3xl">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl sm:text-5xl">How have you been feeling?</h1>
        <p className="text-lg text-ink-soft">
          Depression and anxiety in pregnancy and the year after are common, and they can be treated. These are the questions doctors use to notice them. Two
          minutes.
        </p>
      </header>
      <MoodForm />
      <p className="text-sm text-ink-soft">
        <a className="underline underline-offset-4" href={SOURCES.phq.url} target="_blank" rel="noreferrer">
          PHQ-2 and PHQ-9
        </a>
        , as recommended in{" "}
        <a className="underline underline-offset-4" href={SOURCES.acogPerinatalMentalHealth.url} target="_blank" rel="noreferrer">
          ACOG’s guideline on perinatal mental health
        </a>
        . Only you, and people you share mood screening with, see your answers.
      </p>
    </AppPage>
  );
}
