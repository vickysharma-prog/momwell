import { Logo } from "@/components/Logo";

// A picture of Momwell's Today screen for the landing page, drawn in markup so it stays sharp and on brand.
export function PhoneMock() {
  return (
    <div className="w-[300px] rounded-[44px] border border-line bg-ink p-2.5 shadow-[0_40px_80px_-30px_rgba(14,74,71,0.45)] sm:w-[330px]" role="img" aria-label="The Momwell app: a morning check-in, a show picked for her, and her partner bringing dinner">
      <div className="flex flex-col gap-4 overflow-hidden rounded-[36px] bg-paper px-5 pt-6 pb-7" aria-hidden="true">
        <div className="flex items-center justify-between">
          <Logo size={24} />
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">M</span>
        </div>
        <div>
          <p className="font-display text-2xl leading-tight">Good morning, Maya</p>
          <p className="mt-1 text-sm text-ink-soft">27 weeks · 13 to go</p>
        </div>
        <div className="rounded-3xl bg-brand p-4 text-on-brand">
          <p className="text-sm opacity-80">Today’s check-in</p>
          <p className="mt-1 text-lg font-semibold">How are you feeling?</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm">Tap</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm">Speak</span>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-paper-raised p-4">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Made for you today</p>
          <p className="mt-1.5 font-medium">A calm show for tonight</p>
          <p className="text-sm text-ink-soft">Picked from what you love, nothing upsetting</p>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-brand-soft p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-honey text-sm font-semibold text-ink">S</span>
          <div>
            <p className="text-sm font-medium">Sam is bringing dinner</p>
            <p className="text-xs text-ink-soft">6pm · Thai, no raw fish</p>
          </div>
        </div>
      </div>
    </div>
  );
}
