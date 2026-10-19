"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { MomScene } from "./MomScene";

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

// The first screen: what Momwell is in one line, the two ways in, and the journey it covers, alive.
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-brand-soft opacity-70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[360px] left-[-12%] h-[420px] w-[420px] rounded-full bg-honey opacity-15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-8 pb-20 sm:px-8 md:pt-14 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col gap-7">
          <p className="w-fit rounded-full border border-line bg-paper-raised px-4 py-1.5 text-sm font-medium text-ink-soft">The care companion for pregnancy and the year after</p>
          <h1 className="text-5xl leading-[1.04] sm:text-6xl lg:text-[3.6rem]">
            From first heartbeat to first birthday, <span className="text-brand italic">Momwell keeps watch.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            One companion for everything she needs. It checks the CDC’s urgent warning signs with her every day, gathers her partner, family and care team around her, and makes each day feel like hers.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/demo" className="flex h-14 items-center rounded-full bg-brand px-8 text-lg font-semibold text-on-brand shadow-[0_18px_40px_-18px_var(--brand)] transition active:scale-[0.98]">
              Try it as Maya
            </Link>
            <Link href="/signup" className="flex h-14 items-center rounded-full border border-line bg-paper-raised px-7 text-lg font-medium transition hover:border-brand">
              Start for free
            </Link>
          </div>
          <p className="text-sm text-ink-soft">One click opens a demo family: Maya at 27 weeks, her partner Sam and her OB-GYN. No sign-up.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }} className="relative">
          <MomScene />
        </motion.div>
      </div>
    </section>
  );
}
