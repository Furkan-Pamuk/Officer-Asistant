"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LocaleSelect from "./LocaleSelect";
import NotificationCenter from "./NotificationCenter";
import SharkMark from "./SharkMark";
import { useProfile } from "@/hooks/useProfile";
import { useLocale } from "@/lib/i18n";

type SubEntry = { href: string; key: string; icon: string; external?: boolean } | { header: string };
interface Item {
  key: string;
  href?: string;
  subs?: SubEntry[];
}

function isLink(s: SubEntry): s is { href: string; key: string; icon: string; external?: boolean } {
  return "href" in s;
}

const ITEMS: Item[] = [
  { key: "nav.dashboard", href: "/dashboard" },
  {
    key: "nav.navigation",
    subs: [
      { href: "/route", key: "nav.route", icon: "📍" },
      { href: "/log", key: "nav.decklog", icon: "📓" },
      { href: "/bell-book", key: "nav.bellbook", icon: "🔔" },
      { href: "/celestial", key: "nav.celestial", icon: "☀️" },
    ],
  },
  {
    key: "nav.safety",
    subs: [
      { href: "/inspections", key: "nav.inspections", icon: "🧭" },
      { href: "/checklists", key: "nav.checklists", icon: "✅" },
      { href: "/library", key: "nav.library", icon: "📚" },
    ],
  },
  {
    key: "nav.myship",
    subs: [
      { href: "/contracts", key: "nav.contracts", icon: "📄" },
      { href: "/requests", key: "nav.requests", icon: "📦" },
      { href: "/inventory", key: "nav.inventory", icon: "📦" },
      { href: "/port-docs", key: "nav.portdocs", icon: "🛃" },
      { href: "/crew-accounts", key: "nav.crewaccounts", icon: "💰" },
    ],
  },
  {
    key: "nav.cargo",
    subs: [
      { href: "/cargo", key: "nav.chemical", icon: "🧪" },
      { href: "/bulks", key: "nav.bulk", icon: "🧱" },
      { href: "/gas", key: "nav.gas", icon: "🧊" },
    ],
  },
  {
    key: "nav.life",
    subs: [
      { href: "/menu", key: "nav.menu", icon: "🍽️" },
      { href: "/notes", key: "nav.notes", icon: "📝" },
    ],
  },
  {
    key: "nav.career",
    subs: [
      { href: "/exams", key: "nav.exams", icon: "🎓" },
      { href: "/profile?tab=cv", key: "nav.cv", icon: "📄" },
    ],
  },
  { key: "nav.news", href: "/news" },
];

export default function Navbar() {
  const path = usePathname();
  const { t } = useLocale();
  const profile = useProfile();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while the mobile menu is open so the menu —
  // not the page behind it — scrolls.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
    <header className="shark-navbar sticky top-0 z-40 border-b backdrop-blur-xl print:hidden">
      <div ref={barRef} className="shark-navbar-inner mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-4">
        <Link href="/" className="shark-brand mr-auto flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-wide text-stone-900 dark:text-red-400" aria-label="Shark home">
          <SharkMark />
          Shark
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t("nav.menuBtn")}
          className="shark-menu-toggle flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-200 text-lg xl:hidden dark:border-red-900"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
        <nav className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-0.5 text-xs xl:flex">
          {ITEMS.map((item) =>
            item.subs ? (
              <div key={item.key} className="relative">
                <button
                  onClick={() => setOpen(open === item.key ? null : item.key)}
                  className={`shark-nav-item rounded-full px-2.5 py-2.5 font-semibold ${item.subs.some((s) => isLink(s) && isActive(s.href)) ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "text-stone-700 hover:bg-amber-100 dark:text-red-300/80 dark:hover:bg-red-950"}`}
                >
                  {t(item.key)} {open === item.key ? "▴" : "▾"}
                </button>
                {open === item.key && (
                  <div className="shark-nav-dropdown absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-amber-200 bg-white p-2 shadow-xl dark:border-red-900 dark:bg-neutral-950">
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
                          {s.icon} {t(s.key)} ↗
                        </a>
                      ) : (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`block rounded-xl px-3 py-2 font-medium ${isActive(s.href) ? "bg-amber-100 dark:bg-red-950" : "hover:bg-amber-50 dark:hover:bg-red-950/50"}`}
                        >
                          {s.icon} {t(s.key)}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.key}
                href={item.href!}
                className={`shark-nav-item rounded-full px-2.5 py-2.5 font-semibold ${isActive(item.href!) ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "text-stone-700 hover:bg-amber-100 dark:text-red-300/80 dark:hover:bg-red-950"}`}
              >
                {t(item.key)}
              </Link>
            )
          )}
        </nav>
        <LocaleSelect />
        <ThemeToggle />
        <NotificationCenter />
        <Link href="/profile" title="Profile" className="shark-profile flex shrink-0 items-center gap-2 rounded-full p-1">
          {profile?.photoDataUrl
            ? <img src={profile.photoDataUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-300 dark:ring-red-800" />
            : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold dark:bg-red-950">🧑‍✈️</span>}
          {profile?.rank && <span className="hidden text-xs font-medium 2xl:block">{profile.rank}</span>}
        </Link>
      </div>
      {mobileOpen && (
        <div className="shark-mobile-menu grid max-h-[70vh] gap-3 overflow-y-auto overscroll-contain border-t border-amber-200 px-4 py-5 xl:hidden dark:border-red-950">
          {ITEMS.map((item) =>
            item.subs ? (
              <div key={item.key}>
                <p className="px-3 pb-0.5 pt-1 text-[11px] font-black tracking-widest opacity-50">{t(item.key).toUpperCase()}</p>
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
                        className="block rounded-xl px-5 py-3 text-sm font-medium opacity-80"
                      >
                        {s.icon} {t(s.key)} ↗
                      </a>
                    ) : (
                      <Link
                        key={s.href}
                        href={s.href}
                        className={`block rounded-xl px-5 py-3 text-sm font-medium ${isActive(s.href) ? "bg-amber-100 dark:bg-red-950" : "opacity-80"}`}
                      >
                        {s.icon} {t(s.key)}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ) : (
              <Link key={item.key} href={item.href!} className="block rounded-xl px-3 py-3 text-sm font-semibold">
                {t(item.key)}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
