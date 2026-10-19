"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cue, onSoundChange, setSound, soundOn, type Cue } from "@/lib/voice/sound";

// One listener for the whole app: a soft tap for buttons, a lighter one for choosing a box, and a chime for anything
// marked data-sound="done" (taking an ask, sending one). Nothing is wired per button.
export function UiSounds() {
  useEffect(() => {
    const press = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-sound], button, a.btn, a.btn-quiet");
      if (!el || el.matches(":disabled")) return;
      cue((el.dataset.sound as Cue | undefined) ?? "tap");
    };
    const change = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (el.type === "checkbox" || el.type === "radio") cue("select");
    };
    document.addEventListener("pointerdown", press);
    document.addEventListener("change", change);
    return () => {
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("change", change);
    };
  }, []);
  return null;
}

/** The one switch for Momwell's voice and sounds. */
export function SoundToggle({ labelled = false }: { labelled?: boolean }) {
  const on = useSyncExternalStore(onSoundChange, soundOn, () => true);
  return (
    <button type="button" onClick={() => setSound(!on)} aria-pressed={on} className={`flex items-center gap-3 rounded-2xl text-ink-soft transition hover:bg-paper hover:text-ink ${labelled ? "h-11 w-full px-4 text-sm font-medium" : "size-10 justify-center rounded-full"}`} aria-label={on ? "Turn voice and sounds off" : "Turn voice and sounds on"} title={on ? "Voice and sounds on" : "Voice and sounds off"}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m16 9 5 6m0-6-5 6" />}
      </svg>
      {labelled && (on ? "Voice and sounds on" : "Voice and sounds off")}
    </button>
  );
}
