"use client";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { FAQ, TAGLINE } from "@/lib/content";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";

export default function FaqPage() {
  useDocTitle("faq.title");
  const { t } = useLocale();
  return (
    <div className="shark-interior-page">
      <div className="grid gap-5">
      <div className="rounded-3xl border border-amber-200 bg-stone-900 p-7 text-amber-50 md:p-10 dark:border-red-900 dark:bg-black dark:text-red-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300 dark:text-red-400">{t("faq.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold">{t("faq.title")}</h1>
        <p className="mt-3 max-w-2xl font-medium text-amber-100/90 dark:text-red-300/90">
          {t("faq.sub").replace("{t}", TAGLINE)}
        </p>
        <p className="mt-1 text-sm text-amber-200/80 dark:text-red-300/70">{t("faq.count").replace("{n}", String(FAQ.length))}</p>
      </div>

      <FaqAccordion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <div className="rounded-2xl border border-amber-200 bg-white p-5 text-center dark:border-red-950 dark:bg-neutral-950">
        <p className="text-sm font-medium opacity-80">{t("faq.stuck")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("faq.contact")}</Link>
          <Link href="/about" className="rounded-full border border-amber-300 px-5 py-2 text-sm font-bold dark:border-red-900">{t("faq.about")}</Link>
        </div>
      </div>
    </div>
    </div>
  );
}

