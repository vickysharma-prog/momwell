import type { LineId } from "./lines.ts";

const part = (h: number) => (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

/** Momwell's hello for her local hour; null (the server's first render) is a plain hi. */
export const greetingFor = (name: string, hour: number | null) => `${hour === null ? "Hi" : part(hour)}, ${name}. I’m Momwell. How are you feeling today?`;

/** The recorded hello for her hour: by name for the demo family's Maya, without one for everyone else. */
export function greetingLine(name: string, hour: number): LineId {
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `greet_${part}${name === "Maya" ? "_maya" : ""}` as LineId;
}
