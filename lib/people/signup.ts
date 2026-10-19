import { z } from "zod";

export const ROLES = ["mother", "circle", "care_team"] as const;
export type Role = (typeof ROLES)[number];

export const signUpInput = z.object({
  role: z.enum(ROLES, { error: "Choose who you are" }),
  name: z.string().trim().min(1, "Tell us your name").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("That email doesn't look right")),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  invite: z.uuid().optional().or(z.literal("").transform(() => undefined)),
});
export type SignUpInput = z.infer<typeof signUpInput>;

// The role an invite asks for: a mother's invite names circle or care team; a clinician's invite is for a mother.
export function roleForInvite(fromRole: Role, kind: "circle" | "care_team"): Role {
  return fromRole === "mother" ? kind : "mother";
}
