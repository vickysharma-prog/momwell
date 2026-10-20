// Momwell's voice and its small sounds share one switch, kept in the browser. Off means silent everywhere; the words
// are always on screen, so nothing depends on sound.
const KEY = "momwell-voice";
const HEARD = "momwell-heard";
const listeners = new Set<() => void>();

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  if (!on && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  listeners.forEach((l) => l());
}

/** For useSyncExternalStore: re-render when the switch changes. */
export function onSoundChange(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const heardList = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HEARD) ?? "[]");
  } catch {
    return [];
  }
};

/** Has this guide already played in this browser? */
export const heard = (id: string) => heardList().includes(id);

/** Remember that it played (only once it really did: a blocked autoplay doesn't count). */
export function markHeard(id: string) {
  try {
    if (!heard(id)) localStorage.setItem(HEARD, JSON.stringify([...heardList(), id]));
  } catch {}
}

export type Cue = "tap" | "select" | "done";
const VOLUME: Record<Cue, number> = { tap: 0.25, select: 0.3, done: 0.45 };
const cache = new Map<Cue, HTMLAudioElement>();

/** A short sound for a tap, a choice, or something done; nothing when the switch is off. */
export function cue(name: Cue) {
  if (typeof window === "undefined" || !soundOn()) return;
  let a = cache.get(name);
  if (!a) {
    a = new Audio(`/sounds/${name}.mp3`);
    cache.set(name, a);
  }
  a.volume = VOLUME[name];
  a.currentTime = 0;
  a.play().catch(() => {});
}
