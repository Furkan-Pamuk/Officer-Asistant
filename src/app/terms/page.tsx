"use client";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

// Bodies stay inline (data-driven); only h2 titles go through i18n.
const SECTIONS: { key: string; p: string }[] = [
  { key: "terms.hWhat", p: "An offline-first preparation workspace for seafarers: check cards, checklists, notes, stores and planning tools. It does not replace official publications, company SMS procedures or the master's authority." },
  { key: "terms.hSolas", p: "SOLAS Chapter V Non-Carriage Notice: Shark is strictly an operational preparation, informational, and training tool. It is NOT an Electronic Chart Display and Information System (ECDIS), does not satisfy carriage requirements under SOLAS Chapter V Regulation 19 or 27, and must NEVER be used as the primary means of navigation. Official paper charts, type-approved ECDIS, and flag-approved nautical publications remain legally mandatory." },
  { key: "terms.hLicensed", p: "SIRE 2.0 and CDI question banks are licensed publications. Shark ships original summaries only — always consult the official library or manual for exact wording before an inspection." },
  { key: "terms.hContent", p: "Notes, photos, voice recordings and uploads remain yours. Keep your own backups via Settings → Data export." },
  { key: "terms.hSubs", p: "Pro plans bill in USD through Stripe, renew per the chosen period, and can be cancelled any time with access until period end. Free plan stays free." },
  { key: "terms.hFair", p: "One account per person. Do not resell access, scrape the service, or upload unlawful content. Accounts breaching this may be suspended." },
  { key: "terms.hLiab", p: "Provided as-is for preparation purposes. We are not liable for inspection outcomes, operational decisions or data loss — export backups regularly." },
];

export default function TermsPage() {
  const { t } = useLocale();
  return (
    <div className="shark-interior-page">
      <div className="grid max-w-2xl gap-4">
      <div>
        <h1 className="text-3xl font-black">{t("terms.title")}</h1>
        <p className="text-sm opacity-60">{t("terms.updated")}</p>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t(s.key)}</h2>
          <p className="mt-1 text-sm opacity-80">{s.p}</p>
        </section>
      ))}
      <Link href="/privacy" className="text-sm font-bold underline">{t("terms.toPrivacy")}</Link>
    </div>
    </div>
  );
}

