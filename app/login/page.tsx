import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "@/lib/auth/actions";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
      <h1 className="text-3xl font-semibold">Welcome back</h1>
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
    </main>
  );
}
