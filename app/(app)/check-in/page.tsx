import { AppPage } from "@/components/AppPage";
import { redirect } from "next/navigation";
import { CheckInForm } from "@/components/CheckInForm";
import { saveDates } from "@/lib/checkin/actions";
import { requireMe } from "@/lib/people/me";
import { signsFor } from "@/lib/safety/signs";
import { stageFrom, weeksPregnant } from "@/lib/safety/stage";

export default async function CheckIn() {
  const { db, me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  const { data: dates } = await db.from("mothers").select("due_date, birth_date").eq("id", me.id).maybeSingle();
  const today = new Date();
  const stage = stageFrom(dates ?? {}, today);

  return (
    <AppPage>
      <header>
        <h1 className="text-4xl sm:text-5xl">Today’s check-in</h1>
        <p className="muted mt-1 text-lg">
          {stage.kind === "pregnant" && dates?.due_date
            ? `${weeksPregnant(dates.due_date, today)} weeks pregnant`
            : stage.kind === "after_birth"
              ? `${stage.days} days since your baby was born`
              : "Thirty seconds. Tap what's true."}
        </p>
      </header>

      {stage.kind === "unknown" && (
        <form action={saveDates} className="card grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <p className="text-lg font-medium md:col-span-3">So we show the right signs</p>
          <label className="flex flex-col gap-1">
            <span className="muted">Your due date</span>
            <input type="date" name="due_date" className="field" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="muted">Or, if your baby is here, the birth date</span>
            <input type="date" name="birth_date" className="field" />
          </label>
          <button className="btn-quiet">Save</button>
        </form>
      )}

      <CheckInForm signs={signsFor(stage).map(({ id, label, detail }) => ({ id, label, detail }))} />
    </AppPage>
  );
}
