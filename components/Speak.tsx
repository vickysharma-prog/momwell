"use client";

import { useEffect, useRef, useState } from "react";
import { LINES, type LineId } from "@/lib/voice/lines";

const KEY = "momwell-voice";
const read = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

// Says a fixed line aloud when it appears, with a button to hear it again or turn the voice off. The words are on
// screen too, so nothing depends on sound; a browser that blocks autoplay just waits for the button.
export function Speak({ line }: { line: LineId }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const enabled = read();
    setOn(enabled);
    if (enabled) audio.current?.play().catch(() => {});
  }, [line]);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      el.currentTime = 0;
      try {
        localStorage.setItem(KEY, "off");
      } catch {}
      setOn(false);
      return;
    }
    try {
      localStorage.setItem(KEY, "on");
    } catch {}
    setOn(true);
    el.play().catch(() => {});
  }

  return (
    <div className="flex items-center gap-3">
      <audio ref={audio} src={`/voice/${line}.mp3`} preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button type="button" onClick={toggle} className="btn-quiet min-h-11 gap-2 px-4 text-sm" aria-label={playing ? "Stop the voice" : "Hear this"} title={LINES[line]}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          {playing ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" className="animate-pulse" /> : on ? <path d="M15.5 8.5a5 5 0 0 1 0 7" /> : <path d="m16 9 5 6m0-6-5 6" />}
        </svg>
        {playing ? "Stop" : "Hear this"}
      </button>
    </div>
  );
}
