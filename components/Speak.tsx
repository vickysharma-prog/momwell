"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LINES, type LineId } from "@/lib/voice/lines";
import { heard, markHeard, onSoundChange, setSound, soundOn } from "@/lib/voice/sound";

// Says a fixed line aloud when it appears, with a button to hear it again. The words are on screen too, so nothing
// depends on sound; a browser that blocks autoplay just waits for the button. With `once`, it plays by itself only the
// first time this browser sees that line (the screen guides), so it never nags.
export function Speak({ line, once = false }: { line: LineId; once?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const on = useSyncExternalStore(onSoundChange, soundOn, () => true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!soundOn() || (once && heard(line))) return;
    // A moment after the screen settles, so the voice doesn't talk over the page arriving.
    const t = setTimeout(() => audio.current?.play().then(() => once && markHeard(line), () => {}), once ? 500 : 150);
    return () => clearTimeout(t);
  }, [line, once]);

  // Turning the switch off stops whatever is playing.
  useEffect(() => {
    if (!on) audio.current?.pause();
  }, [on]);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      el.currentTime = 0;
      return;
    }
    if (!on) setSound(true);
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <audio ref={audio} src={`/voice/${line}.mp3`} preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button type="button" onClick={toggle} data-sound="select" className="btn-quiet min-h-11 gap-2 bg-paper-raised px-4 text-sm" aria-label={playing ? "Stop the voice" : "Hear this"} title={LINES[line]}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          {playing ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" className="animate-pulse" /> : on ? <path d="M15.5 8.5a5 5 0 0 1 0 7" /> : <path d="m16 9 5 6m0-6-5 6" />}
        </svg>
        {playing ? "Stop" : "Hear this"}
      </button>
    </div>
  );
}
