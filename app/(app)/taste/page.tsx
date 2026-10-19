import { redirect } from "next/navigation";
import { AppPage } from "@/components/AppPage";
import { TastePicker } from "@/components/TastePicker";
import { requireMe } from "@/lib/people/me";
import type { Taste } from "@/lib/taste/taste";

export default async function WhatYouLove() {
  const { db, me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  const { data } = await db.from("tastes").select("city, diets, liked").eq("mother_id", me.id).maybeSingle();
  return (
    <AppPage>
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-4xl sm:text-5xl">What you love</h1>
        <p className="text-lg text-ink-soft">A few shows, films and artists, your city and how you eat. Momwell uses Qloo’s taste intelligence to make each day’s picks yours.</p>
      </header>
      <TastePicker initial={data as Taste | null} />
    </AppPage>
  );
}
