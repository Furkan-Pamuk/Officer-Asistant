"use client";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

interface MenuLink {
  href: string;
  key: string;
}

interface MenuCard {
  icon: string;
  titleKey: string;
  descKey: string;
  href: string;
  links: MenuLink[];
}

const MENU_CARDS: MenuCard[] = [
  {
    icon: "🧭",
    titleKey: "home.cardNav",
    descKey: "home.cardNavDesc",
    href: "/route",
    links: [
      { href: "/route", key: "nav.route" },
      { href: "/log", key: "nav.decklog" },
      { href: "/bell-book", key: "nav.bellbook" },
    ],
  },
  {
    icon: "🛡️",
    titleKey: "home.cardSafety",
    descKey: "home.cardSafetyDesc",
    href: "/inspections",
    links: [
      { href: "/inspections", key: "nav.inspections" },
      { href: "/checklists", key: "nav.checklists" },
      { href: "/library", key: "nav.library" },
    ],
  },
  {
    icon: "⚓",
    titleKey: "home.cardShip",
    descKey: "home.cardShipDesc",
    href: "/contracts",
    links: [
      { href: "/contracts", key: "nav.contracts" },
      { href: "/requests", key: "nav.requests" },
      { href: "/inventory", key: "home.linkInventory" },
      { href: "/port-docs", key: "nav.portdocs" },
      { href: "/crew-accounts", key: "nav.crewaccounts" },
    ],
  },
  {
    icon: "🍽️",
    titleKey: "home.cardLife",
    descKey: "home.cardLifeDesc",
    href: "/menu",
    links: [
      { href: "/menu", key: "nav.menu" },
      { href: "/notes", key: "nav.notes" },
    ],
  },
  {
    icon: "🎓",
    titleKey: "home.cardCareer",
    descKey: "home.cardCareerDesc",
    href: "/exams",
    links: [
      { href: "/exams", key: "nav.exams" },
      { href: "/profile?tab=cv", key: "nav.cv" },
    ],
  },
  {
    icon: "📰",
    titleKey: "home.cardNews",
    descKey: "home.cardNewsDesc",
    href: "/news",
    links: [],
  },
];

export default function Home() {
  const { t } = useLocale();
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-amber-200 bg-stone-900 p-8 text-amber-50 md:p-12 dark:border-red-900 dark:bg-black dark:text-red-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300 dark:text-red-400">{t("home.eyebrow")}</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold text-white dark:text-red-100">{t("home.title")}</h1>
        <p className="mt-3 max-w-2xl font-medium text-amber-100/90 dark:text-red-300/90">{t("home.subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contracts" className="rounded-full bg-amber-400 px-5 py-2.5 font-bold text-stone-950 dark:bg-red-600 dark:text-white">{t("home.ctaContract")}</Link>
          <Link href="/dashboard" className="rounded-full border border-amber-200/50 px-5 py-2.5 font-semibold text-amber-50 dark:border-red-800 dark:text-red-200">{t("home.ctaDashboard")}</Link>
          <Link href="/pricing" className="rounded-full border border-amber-200/50 px-5 py-2.5 font-semibold text-amber-50 dark:border-red-800 dark:text-red-200">{t("home.ctaPricing")}</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-amber-200/90 dark:text-red-300/80">
          <Link href="/about" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">{t("home.about")}</Link>
          <Link href="/faq" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">{t("home.faq")}</Link>
          <Link href="/contact" className="underline underline-offset-4 hover:text-amber-50 dark:hover:text-red-100">{t("home.contact")}</Link>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold">{t("home.sectionTitle")}</h2>
        <p className="mt-1 text-sm font-medium opacity-70">{t("home.sectionSub")}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {MENU_CARDS.map((m) => (
          <div key={m.titleKey} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
            <Link href={m.href} className="block hover:opacity-90">
              <div className="text-xl">{m.icon}</div>
              <div className="mt-1 font-bold text-stone-950 dark:text-red-100">{t(m.titleKey)}</div>
              <div className="mt-1 text-sm font-medium text-stone-700 dark:text-red-300/80">{t(m.descKey)}</div>
            </Link>
            {m.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-amber-100 pt-2 dark:border-red-950">
                {m.links.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold hover:bg-amber-100 dark:bg-black dark:ring-1 dark:ring-red-950">
                    {t(l.key)}
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
