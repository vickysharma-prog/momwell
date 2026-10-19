"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { PHOTOS } from "@/lib/landing/photos";

const LINKS = [
  ["How it works", "#how"],
  ["Safety", "#safety"],
  ["For families", "#families"],
  ["For clinicians", "#clinicians"],
] as const;

// A plain, confident header: the name, four links, and the two ways in.
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 border-b bg-paper/90 backdrop-blur-md transition-colors ${scrolled ? "border-line" : "border-transparent"}`}>
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-10 px-5 sm:px-8">
        <Link href="/" aria-label="Momwell home">
          <Logo size={30} />
        </Link>
        <nav aria-label="Sections" className="hidden gap-8 text-[15px] text-ink-soft lg:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="hidden px-3 text-[15px] font-medium text-ink-soft hover:text-ink sm:block">
            Sign in
          </Link>
          <Link href="/demo" className="flex h-11 items-center rounded-full bg-brand px-5 text-[15px] font-semibold text-on-brand transition active:scale-[0.98]">
            Try the demo
          </Link>
        </div>
      </div>
    </header>
  );
}

const SCENES = [
  { photo: PHOTOS.pregnant, time: "28 weeks", title: "Check-in complete", detail: "Blood pressure 118/76 · no warning signs" },
  { photo: PHOTOS.newborn, time: "Week 6 after birth", title: "Sam took tonight’s feeds", detail: "Maya’s circle, on the same page" },
] as const;

// The photograph changes from pregnancy to the months after birth, slowly, with a real moment from the app on top.
function HeroPhoto() {
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((n) => (n + 1) % SCENES.length), 6000);
    return () => clearInterval(t);
  }, [still]);
  const scene = SCENES[i];
  return (
    <div className="relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-brand-soft">
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 7, ease: "easeOut" }}>
              <Image src={scene.photo.src} alt={scene.photo.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute -bottom-6 left-6 flex max-w-[300px] items-start gap-3 rounded-2xl border border-line bg-paper-raised p-4 shadow-[0_24px_60px_-24px_rgba(31,26,46,0.45)] sm:-left-8"
        >
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">{scene.time}</span>
            <span className="font-semibold">{scene.title}</span>
            <span className="text-sm text-ink-soft">{scene.detail}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// The first screen: what Momwell is, why it matters, and the way in.
export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-10 pb-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col gap-8">
        <p className="flex flex-wrap items-center gap-3 text-sm font-medium text-ink-soft">
          <span className="font-semibold tracking-widest text-brand uppercase">Maternal care companion</span>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <span>Powered by Qloo’s taste intelligence</span>
        </p>
        <h1 className="text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.1rem]">From first heartbeat to first birthday, Momwell keeps watch.</h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
          Every day, Momwell checks the CDC’s urgent maternal warning signs with her, through pregnancy and the year after birth. It knows what she loves, so she keeps coming back. And it gathers her partner, family and care team into one circle around her.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/demo" className="flex h-14 items-center rounded-full bg-brand px-8 text-lg font-semibold text-on-brand shadow-[0_18px_40px_-18px_var(--brand)] transition active:scale-[0.98]">
            Try it as Maya
          </Link>
          <Link href="/signup" className="flex h-14 items-center rounded-full border border-line bg-paper-raised px-7 text-lg font-medium transition hover:border-brand">
            Start for free
          </Link>
        </div>
        <div className="flex flex-col gap-2 border-t border-line pt-6">
          <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Built on public guidance from</p>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] font-semibold text-ink">
            <span>CDC Hear Her</span>
            <span>ACOG</span>
            <span>NIH</span>
            <span>FDA</span>
            <span>988 Lifeline</span>
          </p>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}>
        <HeroPhoto />
      </motion.div>
    </section>
  );
}
