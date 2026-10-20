"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Logo } from "@/components/Logo";
import { signOut } from "@/lib/auth/actions";
import type { Role } from "@/lib/people/signup";
import { activeHref, navFor, type Icon } from "./nav";
import { SoundToggle, UiSounds } from "./UiSounds";

const ROLE_LABEL: Record<Role, string> = { mother: "Mom", circle: "Her circle", care_team: "Care team" };

const PATHS: Record<Icon, React.ReactNode> = {
  today: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  checkin: (
    <>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </>
  ),
  talk: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  help: <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />,
  foryou: <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4zM19 15l.8 2 2 .8-2 .8L19 20.6l-.8-2-2-.8 2-.8z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6" />
    </>
  ),
  patients: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 3v2h6V3M8 11h8M8 15h5" />
    </>
  ),
  signs: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  invite: (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
    </>
  ),
};

function Glyph({ icon }: { icon: Icon }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[icon]}
    </svg>
  );
}

// The signed-in app: a sidebar on a desktop, a top bar and a tab bar on a phone, the page in between.
export function AppShell({ role, name, banner, children }: { role: Role; name: string; banner?: React.ReactNode; children: React.ReactNode }) {
  const items = navFor(role);
  const active = activeHref(items, usePathname());

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[260px_minmax(0,1fr)] print:block">
      <aside className="sticky top-0 hidden h-dvh flex-col print:!hidden gap-8 border-r border-line bg-paper-raised px-5 py-7 md:flex">
        <Link href="/home" aria-label="Momwell, today">
          <Logo size={30} />
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {items.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active === i.href ? "page" : undefined} className={`relative flex h-12 items-center gap-3 rounded-2xl px-4 font-medium transition-colors ${active === i.href ? "text-brand" : "text-ink-soft hover:bg-paper hover:text-ink"}`}>
              {active === i.href && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-2xl bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative flex items-center gap-3">
                <Glyph icon={i.icon} />
                {i.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto -mb-5">
          <SoundToggle labelled />
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-line p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-honey font-semibold text-[#1f1a2e]">{name.slice(0, 1).toUpperCase()}</span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{name}</span>
            <span className="whitespace-nowrap text-sm text-ink-soft">{ROLE_LABEL[role]}</span>
          </span>
          <form action={signOut} className="ml-auto">
            <button className="whitespace-nowrap rounded-full px-1 py-1 text-sm text-ink-soft underline-offset-4 hover:underline">Sign out</button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between print:hidden border-b border-line bg-paper/85 px-5 py-3 backdrop-blur-md md:hidden">
        <Link href="/home" aria-label="Momwell, today">
          <Logo size={26} />
        </Link>
        <div className="flex items-center gap-1">
          <SoundToggle />
          <form action={signOut}>
            <button className="text-sm text-ink-soft underline-offset-4 hover:underline">Sign out</button>
          </form>
        </div>
      </header>

      <div className="min-w-0 pb-28 md:pb-0">
        <UiSounds />
        {banner}
        {children}
      </div>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex print:hidden border-t border-line bg-paper-raised/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active === i.href ? "page" : undefined} className={`relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs font-medium transition-colors ${active === i.href ? "text-brand" : "text-ink-soft"}`}>
            {active === i.href && <motion.span layoutId="tab-active" className="absolute inset-x-3 inset-y-0 rounded-2xl bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative flex flex-col items-center gap-1">
              <Glyph icon={i.icon} />
              {i.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
