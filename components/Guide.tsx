import { LINES, type LineId } from "@/lib/voice/lines";
import { Speak } from "./Speak";

// Momwell's short spoken guide at the top of a screen: the words, and the voice the first time it opens.
export function Guide({ line }: { line: LineId }) {
  return (
    <aside className="guide flex items-center gap-4 rounded-3xl bg-brand-soft/70 px-5 py-4 print:hidden" aria-label="From Momwell">
      <span className="guide-dot relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand font-signature text-xl text-on-brand" aria-hidden="true">
        m
      </span>
      <p className="flex-1 text-ink">{LINES[line]}</p>
      <Speak line={line} once />
    </aside>
  );
}
