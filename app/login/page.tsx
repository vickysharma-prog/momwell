import { Screen } from "@/components/Screen";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "@/lib/auth/actions";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <Screen className="justify-center settle">
      <Logo size={36} />
      <h1 className="text-3xl">Welcome back</h1>
      <AuthForm action={signIn} submit="Sign in">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <input className="field" name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input className="field" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      </AuthForm>
      <p className="muted text-center">
        New here?{" "}
        <Link className="underline" href="/signup">
          Create an account
        </Link>
      </p>
    </Screen>
  );
}
