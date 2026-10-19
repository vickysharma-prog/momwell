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

// A story in three photographs, each with the moment from the app beside it: alone and worried at night, calm with
// her people around her, and still watched over after the birth.
const SCENES = [
  { photo: PHOTOS.worried, time: "2:15 am · 33 weeks", title: "“My head won’t stop pounding. Is this normal?”", detail: "She tells Momwell. The CDC’s rules check it with her, right away." },
  { photo: PHOTOS.nursery, time: "The next morning", title: "Her OB-GYN saw it. Her partner is home.", detail: "One clear step, and the people she chose were told." },
  { photo: PHOTOS.bedside, time: "6 weeks after birth", title: "Still watched over", detail: "Warning signs after birth are checked for the whole first year." },
] as const;

// The photograph is part of the page: it runs to the right edge and melts into the page on the left.
function HeroPhoto() {
  const still = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((n) => (n + 1) % SCENES.length), 6500);
    return () => clearInterval(t);
  }, [still]);
  const scene = SCENES[i];
  return (
    <div className="absolute inset-y-0 right-0 hidden w-[56%] lg:block" aria-hidden="false">
      <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_28%)]">
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }}>
            <motion.div className="absolute inset-0" initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: "easeOut" }}>
              <Image src={scene.photo.src} alt={scene.photo.alt} fill priority sizes="56vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, delay: 0.4 }} className="absolute right-10 bottom-12 left-[22%] text-white">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-85">{scene.time}</p>
          <p className="mt-2 font-display text-3xl leading-tight">{scene.title}</p>
          <p className="mt-2 max-w-md text-[17px] opacity-90">{scene.detail}</p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute right-10 bottom-5 left-[22%] flex gap-2" aria-hidden="true">
        {SCENES.map((_, n) => (
          <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${n === i ? "bg-white" : "bg-white/35"}`} />
        ))}
      </div>
    </div>
  );
}

// The first screen: what Momwell is, why it matters, and the way in.
export function Hero() {
  return (
    <section className="relative overflow-hidden lg:min-h-[calc(100dvh-4.5rem)]">
      <HeroPhoto />
      <div className="relative mx-auto flex max-w-7xl px-5 pt-12 pb-20 sm:px-8 lg:min-h-[calc(100dvh-4.5rem)] lg:items-center lg:py-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="flex max-w-[560px] flex-col gap-8">
          <p className="flex flex-wrap items-center gap-3 text-sm font-medium text-ink-soft">
            <span className="font-semibold tracking-widest text-brand uppercase">Maternal care companion</span>
            <span className="h-4 w-px bg-line" aria-hidden="true" />
            <span>Powered by Qloo’s taste intelligence</span>
          </p>
          <h1 className="text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[4rem]">From first heartbeat to first birthday, Momwell keeps watch.</h1>
          <p className="text-lg leading-relaxed text-ink-soft sm:text-xl">
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
      </div>
      <div className="relative aspect-[4/3] lg:hidden">
        <Image src={PHOTOS.worried.src} alt={PHOTOS.worried.alt} fill sizes="100vw" className="object-cover" />
      </div>
    </section>
  );
}
