const part = (h: number) => (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

/** Momwell's hello for her local hour; null (the server's first render) is a plain hi. */
export const greetingFor = (name: string, hour: number | null) => `${hour === null ? "Hi" : part(hour)}, ${name}. I’m Momwell. How are you feeling today?`;
