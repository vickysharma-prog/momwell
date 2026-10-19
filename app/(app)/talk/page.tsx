import { redirect } from "next/navigation";
import { AppPage } from "@/components/AppPage";
import { Companion } from "@/components/Companion";
import { requireMe } from "@/lib/people/me";

export default async function Talk() {
  const { me } = await requireMe();
  if (me.role !== "mother") redirect("/home");
  return (
    <AppPage className="max-w-3xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl">Talk to Momwell</h1>
        <p className="text-ink-soft">Warning signs are checked by the CDC’s rules, never guessed. In an emergency, call 911.</p>
      </header>
      <Companion name={me.name} />
    </AppPage>
  );
}
