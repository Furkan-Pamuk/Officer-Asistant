"use client";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

// Bodies stay inline (data-driven); only h2 titles go through i18n.
const SECTIONS: { key: string; p: string }[] = [
  { key: "privacy.hLocal", p: "Shark stores your contracts, checklists, notes, requests, menus and settings on your own device (IndexedDB). Nothing is uploaded anywhere unless you deliberately connect Supabase cloud sync." },
  { key: "privacy.hAds", p: "There are no advertising SDKs and no sale of personal data. The site counts anonymous, cookieless page views (Vercel Web Analytics) to see which pages help crews most — no cross-site tracking, no ad profiles. The app itself works fully offline." },
  { key: "privacy.hAccounts", p: "If you subscribe, payment is processed by Stripe in USD. We never see or store your card number — Stripe handles it under its own privacy policy." },
  { key: "privacy.hLocation", p: "Position is used only to show weather and your vessel map pin, and voice notes need the microphone. Both stay on your device; permission can be revoked any time in the browser." },
  { key: "privacy.hRights", p: "Export everything from Settings → Data, or wipe it by clearing the site's browser storage. Questions: support@officerassistant.app." },
];

export default function PrivacyPage() {
  const { t } = useLocale();
  return (
    <div className="shark-interior-page">
      <div className="grid max-w-2xl gap-4">
      <div>
        <h1 className="text-3xl font-black">{t("privacy.title")}</h1>
        <p className="text-sm opacity-60">{t("privacy.updated")}</p>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t(s.key)}</h2>
          <p className="mt-1 text-sm opacity-80">{s.p}</p>
        </section>
      ))}
      <Link href="/terms" className="text-sm font-bold underline">{t("privacy.toTerms")}</Link>
    </div>
    </div>
  );
}

