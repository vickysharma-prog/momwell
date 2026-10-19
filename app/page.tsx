import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-5xl font-semibold">Momwell</h1>
      <p className="muted text-xl">Care for pregnancy and the year after birth, made around you, with your people beside you.</p>
      <div className="flex flex-col gap-3">
        <Link className="btn" href="/signup">
          Get started
        </Link>
        <Link className="btn-quiet" href="/login">
          Sign in
        </Link>
      </div>
    </main>
  );
}
