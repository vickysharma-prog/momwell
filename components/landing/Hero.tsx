"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { PhoneMock } from "./PhoneMock";

const LINKS = [
  ["How it works", "#how"],
  ["Made for her", "#for-her"],
  ["Her people", "#people"],
  ["Care teams", "#care-teams"],
  ["Safety", "#safety"],
] as const;

// The landing page header: logo, the sections in a soft pill that a highlight follows, and the way in.
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${scrolled ? "border-b border-line/70 bg-paper/85 backdrop-blur-md" : "border-b border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="justify-self-start" aria-label="Momwell home">
          <Logo size={30} />
        </Link>
        <nav onMouseLeave={() => setHover(null)} aria-label="Sections" className="hidden items-center gap-1 rounded-full border border-line bg-paper-raised/70 p-1 text-sm backdrop-blur-md md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onMouseEnter={() => setHover(href)} className="relative rounded-full px-4 py-1.5 text-ink-soft transition-colors hover:text-ink">
              {hover === href && <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{label}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link href="/login" className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:flex">
            Sign in
          </Link>
          <Link href="/signup" className="flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition active:scale-[0.97]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

const PEOPLE = ["partner", "mom", "best friend", "doula", "OB-GYN", "sister"];

// The first screen: what Momwell is in one line, the way in, and the app itself.
export function Hero() {
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((n) => (n + 1) % PEOPLE.length), 2400);
    return () => clearInterval(t);
  }, [still]);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-brand-soft opacity-70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[360px] left-[-12%] h-[420px] w-[420px] rounded-full bg-honey opacity-15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-10 pb-20 sm:px-8 md:pt-16 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col gap-7">
          <p className="w-fit rounded-full border border-line bg-paper-raised px-4 py-1.5 text-sm font-medium text-ink-soft">For pregnancy and the year after birth</p>
          <h1 className="text-5xl leading-[1.04] sm:text-6xl lg:text-[3.6rem]">
            Care that knows her,
            <br />
            with her{" "}
            <span className="relative inline-block min-w-[4ch] text-brand">
              <AnimatePresence mode="wait">
                <motion.span key={PEOPLE[i]} initial={{ opacity: 0, y: 14, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14, filter: "blur(4px)" }} transition={{ duration: 0.35 }} className="inline-block italic">
                  {PEOPLE[i]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            beside her.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            A 30-second check-in made for her every day. Warning signs caught in time by rules from the CDC, never a guess. And her partner, family and care team working as one team, seeing only what she chooses.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className="flex h-14 items-center rounded-full bg-brand px-8 text-lg font-semibold text-on-brand shadow-[0_18px_40px_-18px_var(--brand)] transition active:scale-[0.98]">
              Start for free
            </Link>
            <a href="#how" className="flex h-14 items-center rounded-full border border-line bg-paper-raised px-7 text-lg font-medium transition hover:border-brand">
              See how it works
            </a>
          </div>
          <p className="text-sm text-ink-soft">Free for every mom and her people.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }} className="relative mx-auto">
          <PhoneMock />
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute top-[46%] -right-10 hidden w-60 rounded-2xl border border-line bg-paper-raised p-4 shadow-[0_24px_50px_-24px_rgba(19,32,31,0.35)] sm:block lg:-right-28"
          >
            <p className="text-sm font-semibold">Dr Lee saw your check-in</p>
            <p className="mt-1 text-sm text-ink-soft">Your care team is in the loop.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -bottom-8 -left-12 hidden w-56 rounded-2xl border border-line bg-paper-raised p-4 shadow-[0_24px_50px_-24px_rgba(19,32,31,0.35)] sm:block lg:-left-44"
          >
            <p className="text-sm font-semibold">Sam took the night shift</p>
            <p className="mt-1 text-sm text-ink-soft">Rest. He’ll wake you if the baby needs you.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
