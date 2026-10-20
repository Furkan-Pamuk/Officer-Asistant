"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import SharkMark from "./SharkMark";
import { useProfile } from "@/hooks/useProfile";

type SubEntry = { href: string; label: string; external?: boolean } | { header: string };
interface Item {
  label: string;
  href?: string;
  subs?: SubEntry[];
}

function isLink(s: SubEntry): s is { href: string; label: string; external?: boolean } {
  return "href" in s;
}

// Book links mirror LIBRARY_BOOKS official sources (kept local so the
// navbar never pulls the whole check-card dataset into its bundle).
const BOOK_LINKS: { href: string; label: string }[] = [
  { href: "https://www.imo.org/en/OurWork/Safety/Pages/SOLAS.aspx", label: "📕 SOLAS" },
  { href: "https://www.imo.org/en/OurWork/Environment/Pages/-info.aspx", label: "📕 MARPOL" },
  { href: "https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Convention.aspx", label: "📕 STCW" },
  { href: "https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm", label: "📕 MLC" },
  { href: "https://www.ocimf.org/programmes/sire-2-0", label: "📕 SIRE 2.0" },
  { href: "https://www.who.int/publications/i/item/9789241549657", label: "📕 WHO Ship Sanitation" },
  { href: "https://www.imo.org/en/OurWork/HumanElement/Pages/ISMCode.aspx", label: "📕 ISM Code" },
  { href: "https://www.isgott.org/", label: "📕 ISGOTT" },
  { href: "https://www.sigtto.org/", label: "📕 SIGTTO" },
  { href: "https://www.imo.org/en/OurWork/Safety/Pages/SMCP.aspx", label: "📕 SMCP" },
  { href: "https://www.itfglobal.org/en", label: "📕 ITF HRA" },
];

const DOC_TABS: { href: string; label: string }[] = [
  { href: "/documents", label: "📜 Orders" },
  { href: "/documents?tab=cards", label: "🆘 Cards" },
  { href: "/documents?tab=lights", label: "💡 Buoys" },
  { href: "/documents?tab=symbols", label: "🧭 Symbols" },
  { href: "/documents?tab=weather", label: "⛅ Weather" },
  { href: "/documents?tab=signals", label: "🚩 Signals" },
  { href: "/documents?tab=morse", label: "📻 Morse" },
  { href: "/documents?tab=colreg", label: "⚖️ COLREG" },
];

const ITEMS: Item[] = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Navigation",
    subs: [
      { href: "/route", label: "📍 Route Planner" },
      { href: "/log", label: "📓 Deck Log" },
      { href: "/bell-book", label: "🔔 Bell Book" },
      { href: "/celestial", label: "☀️ Celestial" },
    ],
  },
  {
    label: "Safety",
    subs: [
      { href: "/inspections", label: "🧭 Inspections" },
      { href: "/checklists", label: "✅ Checklists" },
      { href: "/library", label: "📚 Library" },
    ],
  },
  {
    label: "Library",
    subs: [
      { href: "/library", label: "📚 Publications" },
      { href: "/library?tab=links", label: "🔗 Useful links" },
      { header: "📑 Documents" },
      ...DOC_TABS,
      { header: "📕 Books & official sources" },
      ...BOOK_LINKS.map((b) => ({ ...b, external: true })),
    ],
  },
  {
    label: "My Ship",
    subs: [
      { href: "/contracts", label: "📄 Contracts" },
      { href: "/requests", label: "📦 Store Requests" },
      { href: "/inventory", label: "📦 Inventory Lists" },
      { href: "/port-docs", label: "🛃 Port Documents" },
      { href: "/crew-accounts", label: "💰 Crew Accounts" },
    ],
  },
  {
    label: "Life",
    subs: [
      { href: "/menu", label: "🍽️ Weekly Menu" },
      { href: "/notes", label: "📝 Notes" },
    ],
  },
  {
    label: "Career",
    subs: [
      { href: "/exams", label: "🎓 Exams" },
      { href: "/profile?tab=cv", label: "📄 CV Builder" },
    ],
  },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const path = usePathname();
  const profile = useProfile();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [path]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Active-route styling only after mount: the server prerender doesn't know
  // the pathname, so computing it during the first render causes hydration mismatch.
  const isActive = (href: string) => {
    if (!mounted) return false;
    const base = href.split("?")[0];
    return path === base || path?.startsWith(base + "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200 bg-white/95 backdrop-blur print:hidden dark:border-red-950 dark:bg-black/95">
      <div ref={barRef} className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 font-black tracking-wide text-stone-900 dark:text-red-400" aria-label="Shark home">
          <SharkMark />
          Shark
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
          className="ml-auto rounded-full border border-amber-200 px-3 py-1.5 text-lg font-black md:hidden dark:border-red-900"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <nav className="hidden flex-1 flex-wrap items-center gap-1 text-sm md:flex">
          {ITEMS.map((item) =>
            item.subs ? (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setOpen(open === item.label ? null : item.label)}
                  className={`rounded-full px-3 py-1.5 font-bold ${item.subs.some((s) => isLink(s) && isActive(s.href)) ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "text-stone-700 hover:bg-amber-100 dark:text-red-300/80 dark:hover:bg-red-950"}`}
                >
                  {item.label} {open === item.label ? "▴" : "▾"}
                </button>
                {open === item.label && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-amber-200 bg-white p-1.5 shadow-xl dark:border-red-900 dark:bg-neutral-950">
                    {item.subs.map((s, i) =>
                      !isLink(s) ? (
                        <p key={`h-${i}`} className="px-3 pb-0.5 pt-2 text-[11px] font-black tracking-widest opacity-50">{s.header.toUpperCase()}</p>
                      ) : s.external ? (
                        <a
                          key={s.href}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-xl px-3 py-2 font-medium hover:bg-amber-50 dark:hover:bg-red-950/50"
                        >
                          {s.label} ↗
                        </a>
                      ) : (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`block rounded-xl px-3 py-2 font-medium ${isActive(s.href) ? "bg-amber-100 dark:bg-red-950" : "hover:bg-amber-50 dark:hover:bg-red-950/50"}`}
                        >
                          {s.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className={`rounded-full px-3 py-1.5 font-bold ${isActive(item.href!) ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "text-stone-700 hover:bg-amber-100 dark:text-red-300/80 dark:hover:bg-red-950"}`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <ThemeToggle />
        <NotificationCenter />
        <Link href="/profile" title="Profile" className="flex items-center gap-2">
          {profile?.photoDataUrl
            ? <img src={profile.photoDataUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-300 dark:ring-red-800" />
            : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold dark:bg-red-950">🧑‍✈️</span>}
          {profile?.rank && <span className="hidden text-xs font-bold xl:block">{profile.rank}</span>}
        </Link>
      </div>
      {mobileOpen && (
        <div className="grid gap-1 border-t border-amber-200 px-4 py-3 md:hidden dark:border-red-950">
          {ITEMS.map((item) =>
            item.subs ? (
              <div key={item.label}>
                <p className="px-3 pb-0.5 pt-1 text-[11px] font-black tracking-widest opacity-50">{item.label.toUpperCase()}</p>
                <div className="grid gap-0.5">
                  {item.subs.map((s, i) =>
                    !isLink(s) ? (
                      <p key={`h-${i}`} className="px-5 pb-0.5 pt-2 text-[11px] font-black tracking-widest opacity-50">{s.header.toUpperCase()}</p>
                    ) : s.external ? (
                      <a
                        key={s.href}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl px-5 py-2 text-sm font-medium opacity-80"
                      >
                        {s.label} ↗
                      </a>
                    ) : (
                      <Link
                        key={s.href}
                        href={s.href}
                        className={`block rounded-xl px-5 py-2 text-sm font-medium ${isActive(s.href) ? "bg-amber-100 dark:bg-red-950" : "opacity-80"}`}
                      >
                        {s.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href!} className="block rounded-xl px-3 py-2 text-sm font-black">
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
