import type { Role } from "@/lib/people/signup";

export type Icon = "today" | "checkin" | "foryou" | "people" | "patients" | "invite";
export type NavItem = { href: string; label: string; icon: Icon };

// What each role sees in the sidebar (desktop) and the tab bar (phone).
export function navFor(role: Role): NavItem[] {
  if (role === "mother")
    return [
      { href: "/home", label: "Today", icon: "today" },
      { href: "/check-in", label: "Check in", icon: "checkin" },
      { href: "/for-you", label: "For you", icon: "foryou" },
      { href: "/people", label: "People", icon: "people" },
    ];
  if (role === "care_team")
    return [
      { href: "/home", label: "Patients", icon: "patients" },
      { href: "/people", label: "Invite", icon: "invite" },
    ];
  return [
    { href: "/home", label: "Today", icon: "today" },
    { href: "/people", label: "Moms", icon: "people" },
  ];
}

// The nav item a path belongs to: the longest href that starts it.
export function activeHref(items: NavItem[], path: string) {
  return items.filter((i) => path === i.href || path.startsWith(i.href + "/")).sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}
