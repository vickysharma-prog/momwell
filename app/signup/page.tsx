import { Screen } from "@/components/Screen";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";
import { signUp } from "@/lib/auth/actions";
import { previewInvite } from "@/lib/people/invite";
import { ROLES, roleForInvite, type Role } from "@/lib/people/signup";

const ROLE_TEXT: Record<Role, { title: string; body: string }> = {
  mother: { title: "I'm pregnant or a new mom", body: "Daily check-ins, warning signs, and care made around you." },
  circle: { title: "I'm supporting a mom", body: "Partner, family or friend. See how to help today." },
  care_team: { title: "I'm on a care team", body: "OB-GYN, midwife, doula, lactation consultant or pediatrician." },
};

export default async function SignUp({ searchParams }: PageProps<"/signup">) {
  const { invite, role: asked } = await searchParams;
  const preview = typeof invite === "string" ? await previewInvite(invite) : null;
  const fixed = preview ? roleForInvite(preview.from_role, preview.kind) : null;
  const picked = fixed ?? (ROLES.includes(asked as Role) ? (asked as Role) : "mother");

  return (
    <Screen className="settle">
      <header className="flex flex-col gap-6">
        <Logo size={36} />
        <h1 className="text-3xl">Join Momwell</h1>
        {preview && <p className="muted mt-2 text-lg">{preview.from_name} invited you.</p>}
      </header>
      <AuthForm action={signUp} submit="Create my account">
        {preview && <input type="hidden" name="invite" value={invite} />}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-lg font-medium">Who are you?</legend>
          {(fixed ? [fixed] : ROLES).map((r) => (
            <label key={r} className="card flex cursor-pointer gap-4 has-[:checked]:border-[var(--accent)]">
              <input type="radio" name="role" value={r} defaultChecked={r === picked} className="mt-1.5 size-5 accent-[var(--accent)]" />
              <span>
                <span className="block text-lg font-medium">{ROLE_TEXT[r].title}</span>
                <span className="muted">{ROLE_TEXT[r].body}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <input className="field" name="name" placeholder="Your first name" autoComplete="given-name" required />
        <input className="field" name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input className="field" name="password" type="password" placeholder="Password (8 or more characters)" autoComplete="new-password" minLength={8} required />
      </AuthForm>
      <p className="muted text-center">
        Have an account?{" "}
        <Link className="underline" href={preview ? `/login?next=/join/${invite}` : "/login"}>
          Sign in
        </Link>
      </p>
    </Screen>
  );
}
