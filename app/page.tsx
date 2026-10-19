import { Screen } from "@/components/Screen";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Landing() {
  return (
    <Screen className="justify-center gap-8 settle">
      <Logo size={56} />
      <h1 className="text-4xl leading-tight">Care that knows you, with your people around you.</h1>
      <p className="muted text-lg">A daily check-in made for you through pregnancy and the year after birth. Warning signs caught in time, and your partner, family and care team on the same page.</p>
      <div className="flex flex-col gap-3">
        <Link className="btn" href="/signup">
          Get started
        </Link>
        <Link className="btn-quiet" href="/login">
          Sign in
        </Link>
      </div>
    </Screen>
  );
}
