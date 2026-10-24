"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SharkMark from "@/components/SharkMark";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleSelect from "@/components/LocaleSelect";
import NotificationCenter from "@/components/NotificationCenter";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export interface NavSubItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavCategory {
  key: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  subs?: NavSubItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "🧭" },
  {
    key: "navigation",
    label: "Navigation",
    icon: "📍",
    subs: [
      { href: "/route", label: "Route Planner", icon: "📍" },
      { href: "/log", label: "Deck Logbook", icon: "📓" },
      { href: "/bell-book", label: "Bell Book", icon: "🔔" },
      { href: "/celestial", label: "Celestial Almanac", icon: "☀️" },
    ],
  },
  {
    key: "safety",
    label: "Safety",
    icon: "🛡️",
    badge: 2,
    subs: [
      { href: "/inspections", label: "Inspections", icon: "🧭" },
      { href: "/checklists", label: "Job Checklists", icon: "✅" },
      { href: "/library", label: "Safety Library", icon: "📚" },
    ],
  },
  {
    key: "myship",
    label: "My Ship",
    icon: "⚓",
    subs: [
      { href: "/contracts", label: "Contracts", icon: "📄" },
      { href: "/requests", label: "Requests & Stores", icon: "📦" },
      { href: "/inventory", label: "Inventory", icon: "📦" },
      { href: "/port-docs", label: "Port Clearance", icon: "🛃" },
      { href: "/crew-accounts", label: "Crew Accounts", icon: "💰" },
    ],
  },
  {
    key: "cargo",
    label: "Cargo",
    icon: "🚢",
    subs: [
      { href: "/cargo", label: "Chemical Tanker", icon: "🧪" },
      { href: "/bulks", label: "Bulk Carrier", icon: "🌾" },
      { href: "/gas", label: "Gas Carrier", icon: "💨" },
    ],
  },
  {
    key: "life",
    label: "Life & Health",
    icon: "🍽️",
    subs: [
      { href: "/menu", label: "Galley Menu", icon: "🍽️" },
      { href: "/notes", label: "Whiteboard & Notes", icon: "📝" },
    ],
  },
  {
    key: "career",
    label: "Career",
    icon: "🎓",
    subs: [
      { href: "/exams", label: "STCW Exam Prep", icon: "🎓" },
      { href: "/profile?tab=cv", label: "Maritime CV Builder", icon: "📄" },
    ],
  },
  { key: "news", label: "News", href: "/news", icon: "📰" },
];

export default function ResponsiveNavigation() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useAuth();
  const profile = useProfile();

  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [utcTime, setUtcTime] = useState("");
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Live UTC Clock for watchkeeping officers
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close drawer and flyout on route navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileDrawerOpen(false);
    setActiveFlyout(null);
  }, [pathname]);

  // Click outside flyout handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileDrawerOpen]);

  const isCurrentActive = (href?: string, subs?: NavSubItem[]) => {
    if (!mounted || !pathname) return false;
    if (href) {
      const base = href.split("?")[0];
      return pathname === base || pathname.startsWith(base + "/");
    }
    if (subs) {
      return subs.some((s) => {
        const base = s.href.split("?")[0];
        return pathname === base || pathname.startsWith(base + "/");
      });
    }
    return false;
  };

  return (
    <>
      {/* 1. TOP HEADER (Visible on All Screen Sizes, adapts contents) */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 backdrop-blur-md dark:border-red-950/80 dark:bg-black/95 sm:px-5">
        {/* Left: Brand + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-label="Open Navigation Drawer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-base md:hidden hover:bg-slate-100 dark:border-red-950 dark:hover:bg-red-950/50"
          >
            {mobileDrawerOpen ? "✕" : "☰"}
          </button>

          {/* Logo Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-red-300 sm:text-lg"
          >
            <SharkMark size={24} />
            <span>Shark</span>
            <span className="hidden rounded-sm bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-red-950 dark:text-red-400 sm:inline">
              OFFLINE PWA
            </span>
          </Link>
        </div>

        {/* Center: Desktop Inline Navigation Pills (Hidden on Mobile/Tablet) */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_CATEGORIES.map((cat) => {
            const active = isCurrentActive(cat.href, cat.subs);
            if (cat.subs) {
              const isOpen = activeFlyout === cat.key;
              return (
                <div key={cat.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveFlyout(isOpen ? null : cat.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-slate-900 text-white dark:bg-red-800 dark:text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-red-300/80 dark:hover:bg-red-950/50"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className="text-[10px]">{isOpen ? "▴" : "▾"}</span>
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-red-950 dark:bg-[#0c0c0e]">
                      <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-red-400/60">
                        {cat.label}
                      </div>
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-red-300 dark:hover:bg-red-950/50"
                        >
                          <span>{sub.icon}</span>
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={cat.key}
                href={cat.href!}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-slate-900 text-white dark:bg-red-800 dark:text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-red-300/80 dark:hover:bg-red-950/50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Running UTC Clock */}
          {utcTime && (
            <div className="hidden font-mono text-xs font-bold tabular-nums text-slate-600 dark:text-red-300/90 md:block">
              {utcTime}
            </div>
          )}

          <LocaleSelect />
          <ThemeToggle />
          <NotificationCenter />

          {/* User Profile Avatar / Sign-in */}
          {user ? (
            <Link
              href="/profile"
              title="Profile"
              className="flex shrink-0 items-center gap-2 rounded-full p-0.5 ring-2 ring-slate-200 dark:ring-red-900"
            >
              {profile?.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoDataUrl}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm dark:bg-red-950">
                  🧑‍✈️
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600"
            >
              {t("auth.login")}
            </Link>
          )}
        </div>
      </header>

      {/* 2. TABLET NAVIGATION RAIL (md:flex xl:hidden, 68px width) */}
      <aside
        ref={flyoutRef}
        aria-label="Navigation Rail"
        className="fixed left-0 top-14 bottom-0 z-30 hidden w-[68px] flex-col items-center justify-between border-r border-slate-200/90 bg-white py-3 dark:border-red-950/80 dark:bg-[#070709] md:flex xl:hidden"
      >
        <div className="flex w-full flex-col items-center gap-2">
          {NAV_CATEGORIES.map((cat) => {
            const active = isCurrentActive(cat.href, cat.subs);
            const isFlyoutOpen = activeFlyout === cat.key;

            return (
              <div key={cat.key} className="relative flex w-full justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (cat.subs) {
                      setActiveFlyout(isFlyoutOpen ? null : cat.key);
                    }
                  }}
                  className={`group relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl transition-all ${
                    active
                      ? "bg-slate-900 text-white dark:bg-red-800 dark:text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 dark:text-red-300/80 dark:hover:bg-red-950/50"
                  }`}
                  aria-label={cat.label}
                  title={cat.label}
                >
                  {cat.href ? (
                    <Link href={cat.href} className="flex h-full w-full items-center justify-center">
                      <span className="text-xl">{cat.icon}</span>
                    </Link>
                  ) : (
                    <span className="text-xl">{cat.icon}</span>
                  )}

                  {cat.badge && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {cat.badge}
                    </span>
                  )}
                </button>

                {/* Anchored Popover Flyout for Tablet Rail */}
                {isFlyoutOpen && cat.subs && (
                  <div className="absolute left-[72px] top-0 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-red-950 dark:bg-[#0b0b0e]">
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-red-950">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-red-200">
                        {cat.label}
                      </span>
                    </div>
                    <div className="grid gap-1">
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-red-300 dark:hover:bg-red-950/60"
                        >
                          <span className="text-base">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[10px] font-mono text-slate-400 dark:text-red-400/50">SHARK</div>
      </aside>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (< 768px, Thumb Accessible) */}
      <nav
        aria-label="Bottom Quick Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-md dark:border-red-950/80 dark:bg-black/95 md:hidden pwa-safe-bottom"
      >
        {NAV_CATEGORIES.slice(0, 4).map((cat) => {
          const active = isCurrentActive(cat.href, cat.subs);
          const targetHref = cat.href || (cat.subs ? cat.subs[0].href : "/");

          return (
            <Link
              key={cat.key}
              href={targetHref}
              className={`flex flex-1 flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
                active
                  ? "text-slate-900 font-bold dark:text-red-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-red-300/60 dark:hover:text-red-200"
              }`}
            >
              <span className="text-xl leading-none">{cat.icon}</span>
              <span className="text-[10px] tracking-tight mt-1">{cat.label}</span>
            </Link>
          );
        })}

        {/* More Button to Open Full Mobile Drawer Sheet */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-1 flex-col items-center justify-center h-full min-h-[48px] py-1 text-slate-500 hover:text-slate-800 dark:text-red-300/60 dark:hover:text-red-200"
          aria-label="More Navigation Options"
        >
          <span className="text-xl leading-none">⋯</span>
          <span className="text-[10px] tracking-tight mt-1">More</span>
        </button>
      </nav>

      {/* 4. MOBILE SLIDE-IN OFF-CANVAS DRAWER SHEET (< 768px) */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative flex w-[84vw] max-w-sm flex-col bg-white p-4 shadow-2xl overflow-y-auto dark:bg-[#0c0c0e] dark:border-r dark:border-red-950">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-red-950">
              <div className="flex items-center gap-2">
                <SharkMark size={28} />
                <span className="font-extrabold text-lg text-slate-900 dark:text-red-200">Shark</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-red-950 dark:text-red-200"
              >
                ✕
              </button>
            </div>

            {/* Categorized Menu Tree */}
            <div className="flex-1 py-4 space-y-4">
              {NAV_CATEGORIES.map((cat) => (
                <div key={cat.key} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-red-400/60">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>

                  {cat.href ? (
                    <Link
                      href={cat.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                        isCurrentActive(cat.href)
                          ? "bg-slate-900 text-white dark:bg-red-800 dark:text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-red-200 dark:hover:bg-red-950/50"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </Link>
                  ) : (
                    <div className="grid gap-1 pl-2">
                      {cat.subs?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={`flex h-10 items-center gap-2.5 rounded-xl px-3 text-xs font-medium transition-colors ${
                            isCurrentActive(sub.href)
                              ? "bg-slate-100 font-bold text-slate-900 dark:bg-red-950 dark:text-red-200"
                              : "text-slate-600 hover:bg-slate-50 dark:text-red-300/80 dark:hover:bg-red-950/40"
                          }`}
                        >
                          <span className="text-sm">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer with telemetry & credentials */}
            <div className="pt-4 border-t border-slate-100 dark:border-red-950 text-xs text-slate-500 dark:text-red-400/60 font-mono">
              {utcTime || "UTC CLOCK"} • SHARK MARITIME PWA
            </div>
          </div>
        </div>
      )}
    </>
  );
}
