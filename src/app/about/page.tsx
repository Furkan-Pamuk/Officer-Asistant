"use client";
import Link from "next/link";
import { BRAND, FEATURES, MISSION, TAGLINE, TAGLINE_LONG, VALUES, VISION } from "@/lib/content";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";

export default function AboutPage() {
  useDocTitle("about.eyebrow");
  const { t } = useLocale();
  const o = useContentOverlay();
  const mission = (cov(o, "site", "mission").v as string | undefined) ?? MISSION;
  const vision = (cov(o, "site", "vision").v as string | undefined) ?? VISION;
  const valuesOv = VALUES.map((v) => withOv(v, cov(o, "site", `value:${v.title}`)));
  const featuresOv = FEATURES.map((f) => withOv(f, cov(o, "site", `feature:${f.title}`)));
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-amber-200 bg-stone-900 p-7 text-amber-50 md:p-10 dark:border-red-900 dark:bg-black dark:text-red-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300 dark:text-red-400">{t("about.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold">{TAGLINE}</h1>
        <p className="mt-3 max-w-2xl font-medium text-amber-100/90 dark:text-red-300/90">{TAGLINE_LONG}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/faq" className="rounded-full bg-amber-400 px-5 py-2.5 font-bold text-stone-950 dark:bg-red-600 dark:text-white">{t("about.ctaFaq")}</Link>
          <Link href="/contact" className="rounded-full border border-amber-200/50 px-5 py-2.5 font-semibold text-amber-50 dark:border-red-800 dark:text-red-200">{t("about.ctaContact")}</Link>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-white p-6 md:p-8 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="text-xl font-bold">{t("about.story")}</h2>
        <div className="mt-3 grid gap-3 text-sm font-medium leading-relaxed opacity-85 md:grid-cols-2">
          <p>
            At sea you are either the prey or the hunter. An inspector boards and the whole ship holds its breath.
            Paper check cards go missing, last voyage&apos;s notes stay on an old phone, certificates expire quietly,
            and the same preparation is repeated for every inspection. {BRAND} exists so you meet that moment as the
            hunter — sharp, prepared, calm.
          </p>
          <p>
            But inspections are only one part of life aboard. So {BRAND} grew into one offline-first companion for
            everything else too: daily work by rank, navigation tools that work with no signal, store orders, crew
            accounts and menus, career documents, notes and reminders. One workspace per contract, for officers,
            cadets and ratings alike — switch vessels and your archive switches with you.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 dark:border-red-950 dark:bg-neutral-950">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-red-400">{t("about.mission")}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed opacity-85">{mission}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 dark:border-red-950 dark:bg-neutral-950">
          <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-red-400">{t("about.vision")}</p>
          <p className="mt-2 text-sm font-medium leading-relaxed opacity-85">{vision}</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t("about.features")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuresOv.map((f) => (
            <div key={f.title} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-1 font-bold">{f.title}</div>
              <div className="mt-1 text-sm font-medium text-stone-700 dark:text-red-300/80">{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t("about.values")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {valuesOv.map((v) => (
            <div key={v.title} className="rounded-2xl border border-amber-200 bg-white p-5 dark:border-red-950 dark:bg-neutral-950">
              <div className="font-bold">{v.title}</div>
              <div className="mt-1 text-sm font-medium text-stone-700 dark:text-red-300/80">{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center md:p-8 dark:border-red-950 dark:bg-black">
        <p className="text-2xl font-black">🦈 {TAGLINE}</p>
        <p className="mt-1 text-sm font-medium opacity-75">{t("about.signoff")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/pricing" className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("about.pricing")}</Link>
          <Link href="/faq" className="rounded-full border border-amber-300 px-5 py-2.5 text-sm font-bold dark:border-red-900">{t("about.faq")}</Link>
        </div>
      </section>
    </div>
  );
}
