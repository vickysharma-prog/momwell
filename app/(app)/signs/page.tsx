import { AppPage } from "@/components/AppPage";
import { aboutHer } from "@/lib/care/voice";
import { requireMe } from "@/lib/people/me";
import { BABY_SIGNS } from "@/lib/safety/baby";
import { NEXT_STEPS_SOURCE } from "@/lib/safety/next-steps";
import { SIGNS, SIGNS_SOURCE } from "@/lib/safety/signs";
import { SOURCES } from "@/lib/safety/sources";
import { CALL_911, TIER_SOURCE } from "@/lib/safety/tier";

const WHEN: Record<string, string> = { pregnancy: "in pregnancy", after_birth: "after the birth", pregnancy_and_6_weeks: "in pregnancy and the six weeks after" };

// The warning signs for the people around her: which mean 911 and which mean her doctor now, and how to help her get
// care. The same official lists the app's rules use.
export default async function Signs() {
  const { me } = await requireMe();
  const her = me.role === "mother" ? (t: string) => t : aboutHer;
  const call911 = SIGNS.filter((s) => (CALL_911 as readonly string[]).includes(s.id));
  const doctor = SIGNS.filter((s) => !(CALL_911 as readonly string[]).includes(s.id));
  const Item = ({ s }: { s: (typeof SIGNS)[number] }) => (
    <li className="flex flex-col gap-0.5 py-3">
      <span className="font-medium">{her(s.label)}</span>
      <span className="text-sm text-ink-soft">
        {her(s.detail)}
        {WHEN[s.window] ? ` Watch for this ${WHEN[s.window]}.` : ""}
      </span>
    </li>
  );
  return (
    <AppPage>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl sm:text-5xl">{me.role === "mother" ? "Your warning signs" : "Her warning signs"}</h1>
        <p className="text-lg text-ink-soft">From the CDC, for pregnancy and the year after birth. Any one of these needs care right away.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2 rounded-3xl bg-alarm-soft p-6">
          <h2 className="text-2xl">Call 911</h2>
          <ul className="flex flex-col divide-y divide-[var(--alarm)]/15">
            {call911.map((s) => (
              <Item key={s.id} s={s} />
            ))}
            <li className="py-3 font-medium">Blood pressure of 160/110 or higher</li>
          </ul>
        </section>
        <section className="card flex flex-col gap-2 p-6">
          <h2 className="text-2xl">{me.role === "mother" ? "Call your doctor now" : "Call her doctor now"}</h2>
          <p className="text-sm text-ink-soft">If you can’t reach them, call 911 or go to the nearest emergency room.</p>
          <ul className="flex flex-col divide-y divide-line">
            {doctor.map((s) => (
              <Item key={s.id} s={s} />
            ))}
            <li className="py-3 font-medium">Blood pressure of 140/90 or higher</li>
          </ul>
        </section>
      </div>

      <section className="card flex flex-col gap-3 p-6">
        <h2 className="text-2xl">{me.role === "mother" ? "When you get care" : "How you can help"}</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-lg">
          <li>Say she is pregnant, or was pregnant in the past year. It changes what they look for.</li>
          <li>Go with her, or find someone who can. Help her remember and ask her questions.</li>
          <li>Bring a list of every medicine she takes, and any high blood pressure, diabetes or problems in this pregnancy or birth.</li>
          <li>Write down what they say, and ask again about anything that isn’t clear.</li>
          <li>Believe her. She knows her body best. If something still feels wrong, keep asking.</li>
        </ol>
      </section>

      <section className="card flex flex-col gap-2 p-6">
        <h2 className="text-2xl">The baby, in the first year</h2>
        <ul className="grid gap-x-8 sm:grid-cols-2">
          {BABY_SIGNS.map((s) => (
            <li key={s.id} className="flex items-start gap-3 border-b border-line py-3">
              <span className={`mt-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.level === "urgent" ? "bg-alarm-soft text-[var(--alarm)]" : "bg-honey/25"}`}>{s.level === "urgent" ? "911" : "Doctor now"}</span>
              <span>{s.label}{"newbornOnly" in s ? " (first month)" : ""}</span>
            </li>
          ))}
          <li className="flex items-start gap-3 border-b border-line py-3">
            <span className="mt-1 shrink-0 rounded-full bg-honey/25 px-2 py-0.5 text-xs font-semibold">Doctor now</span>
            <span>Under 3 months, a temperature of 100.4°F or higher</span>
          </li>
        </ul>
      </section>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        {[SIGNS_SOURCE, TIER_SOURCE, NEXT_STEPS_SOURCE, SOURCES.aapFever, SOURCES.childrensEmergency].map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {s.title}
          </a>
        ))}
      </p>
    </AppPage>
  );
}
