// A phone number as she types it ("(512) 555-0142", "+1 512 555 0142") to what a tel: link dials. Empty clears it.
export function readPhone(raw: string): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\+?[0-9 ()\-.]+$/.test(trimmed)) return { ok: false, error: "Use only numbers, spaces, dashes and a leading +." };
  const value = (trimmed.startsWith("+") ? "+" : "") + trimmed.replace(/\D/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(value)) return { ok: false, error: "That number looks too short or too long." };
  return { ok: true, value };
}
