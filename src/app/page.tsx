import Link from "next/link";
import { BRAND, TAGLINE, TAGLINE_LONG } from "@/lib/content";

interface MenuLink {
  href: string;
  label: string;
}

interface MenuCard {
  icon: string;
  title: string;
  description: string;
  href: string;
  links: MenuLink[];
}

const MENU_CARDS: MenuCard[] = [
  {
    icon: "🧭",
    title: "Navigation",
    description: "Routes, logs, celestial and bell book.",
    href: "/route",
    links: [
      { href: "/route", label: "Route Planner" },
      { href: "/log", label: "Deck Log" },
      { href: "/bell-book", label: "Bell Book" },
    ],
  },
  {
    icon: "🛡️",
    title: "Safety",
    description: "Inspections, checklists and library.",
    href: "/inspections",
    links: [
      { href: "/inspections", label: "Inspections" },
      { href: "/checklists", label: "Checklists" },
      { href: "/library", label: "Library" },
    ],
  },
  {
    icon: "⚓",
    title: "My Ship",
    description: "Contracts, store requests, inventory, port documents and crew accounts.",
    href: "/contracts",
    links: [
      { href: "/contracts", label: "Contracts" },
      { href: "/requests", label: "Store Requests" },
      { href: "/inventory", label: "Inventory" },
      { href: "/port-docs", label: "Port Documents" },
      { href: "/crew-accounts", label: "Crew Accounts" },
    ],
  },
  {
    icon: "🍽️",
    title: "Life",
    description: "Weekly menu with recipes, and notes.",
    href: "/menu",
    links: [
      { href: "/menu", label: "Weekly Menu" },
      { href: "/notes", label: "Notes" },
    ],
  },
  {
    icon: "🎓",
    title: "Career",
    description: "GASM + STCW question bank and CV builder.",
    href: "/exams",
    links: [
      { href: "/exams", label: "Exams" },
      { href: "/profile?tab=cv", label: "CV Builder" },
    ],
  },
  {
    icon: "📰",
    title: "News",
    description: "Maritime news and updates.",
    href: "/news",
    links: [],
  },
];

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-amber-200 bg-stone-900 p-8 text-amber-50 md:p-12 dark:border-red-900 dark:bg-black dark:text-red-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300 dark:text-red-400">{BRAND} • {TAGLINE}</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold text-white dark:text-red-100">Your whole life at sea, in one app.</h1>
        <p className="mt-3 max-w-2xl font-medium text-amber-100/90 dark:text-red-300/90">{TAGLINE_LONG}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contracts" className="rounded-full bg-amber-400 px-5 py-2.5 font-bold text-stone-950 dark:bg-red-600 dark:text-white">Select contract / new vessel</Link>
          <Link href="/dashboard" className="rounded-full border border-amber-200/50 px-5 py-2.5 font-semibold text-amber-50 dark:border-red-800 dark:text-red-200">Open dashboard</Link>
          <Link href="/pricing" className="rounded-full border border-amber-200/50 px-5 py-2.5 font-semibold text-amber-50 dark:border-red-800 dark:text-red-200">See pricing in USD</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-amber-200/90 dark:text-red-300/80">
          <Link href="/about" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">About us</Link>
          <Link href="/faq" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">FAQ</Link>
          <Link href="/contact" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">Contact</Link>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold">Everything aboard, in one place.</h2>
        <p className="mt-1 text-sm font-medium opacity-70">Jump straight into any section — your dashboard stays one tap away above.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {MENU_CARDS.map((m) => (
          <div key={m.title} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
            <Link href={m.href} className="block hover:opacity-90">
              <div className="text-xl">{m.icon}</div>
              <div className="mt-1 font-bold text-stone-950 dark:text-red-100">{m.title}</div>
              <div className="mt-1 text-sm font-medium text-stone-700 dark:text-red-300/80">{m.description}</div>
            </Link>
            {m.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-amber-100 pt-2 dark:border-red-950">
                {m.links.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold hover:bg-amber-100 dark:bg-black dark:ring-1 dark:ring-red-950">
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
