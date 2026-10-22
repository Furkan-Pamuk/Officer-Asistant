"use client";
import Link from "next/link";
import { useRef } from "react";
import SharkMascot, { type SharkMascotHandle } from "@/components/SharkMascot";
import OrbitMenu from "@/components/OrbitMenu";
import { useLocale } from "@/lib/i18n";
import { TESTIMONIALS } from "@/lib/testimonials";

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
  const { t, locale } = useLocale();
  const mascotRef = useRef<SharkMascotHandle>(null);
  return (
    <div className="shark-home grid gap-10 pb-6 sm:gap-14 sm:pt-2">
      <section className="shark-hero shark-mascot-landing relative isolate overflow-hidden rounded-3xl border p-6 py-10 sm:p-8 sm:py-12 lg:p-10 lg:pt-14">
        <p className="shark-eyebrow relative text-xs font-semibold uppercase leading-relaxed tracking-[0.2em]">{t("home.eyebrow")}</p>
        <h1 className="relative mt-5 max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight text-balance sm:text-5xl lg:text-6xl">{t("home.title")}</h1>
        <p className="shark-hero-copy relative mt-6 max-w-xl text-base leading-relaxed sm:text-lg">{t("home.subtitle")}</p>
        <div className="relative mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/contracts" className="shark-cta shark-cta-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold">{t("home.ctaContract")}</Link>
          <Link href="/dashboard" className="shark-cta shark-cta-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold">{t("home.ctaDashboard")}</Link>
          <Link href="/pricing" className="shark-cta shark-cta-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold">{t("home.ctaPricing")}</Link>
        </div>
        <div className="shark-hero-links relative mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/about" className="py-1 underline decoration-current/30 underline-offset-4">{t("home.about")}</Link>
          <Link href="/faq" className="py-1 underline decoration-current/30 underline-offset-4">{t("home.faq")}</Link>
          <Link href="/contact" className="py-1 underline decoration-current/30 underline-offset-4">{t("home.contact")}</Link>
        </div>
          <div className="shark-section-intro relative mt-10 border-b pb-6">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{t("home.sectionTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-70 sm:text-base">{t("home.sectionSub")}</p>
          </div>
        <OrbitMenu items={MENU_CARDS}
          onHoverItem={point => mascotRef.current?.lookAt(point)}
          onSelectItem={() => mascotRef.current?.select() ?? Promise.resolve()}>
          <SharkMascot ref={mascotRef} />
        </OrbitMenu>
      </section>

      <section>
        <h2 className="text-2xl font-semibold sm:text-3xl">{t("home.tmTitle")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:gap-6">
          {TESTIMONIALS.map((tm) => (
            <figure key={tm.name} className="shark-card rounded-2xl border p-6 sm:p-7">
              <blockquote className="text-sm leading-7">“{tm.quote[locale] ?? tm.quote.en}”</blockquote>
              <figcaption className="shark-quote-credit mt-6 border-t pt-4 text-xs font-medium leading-relaxed">{tm.flag} {tm.name} — {tm.rank}, {tm.country}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
