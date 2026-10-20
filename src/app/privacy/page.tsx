import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Shark",
  description: "How Shark handles your data: on your device by default.",
};

const SECTIONS: { h: string; p: string }[] = [
  { h: "Local-first", p: "Shark stores your contracts, checklists, notes, requests, menus and settings on your own device (IndexedDB). Nothing is uploaded anywhere unless you deliberately connect Supabase cloud sync." },
  { h: "No ads, no trackers", p: "There are no advertising SDKs, no analytics beacons and no sale of personal data. The app works fully offline." },
  { h: "Accounts & payments", p: "If you subscribe, payment is processed by Stripe in USD. We never see or store your card number — Stripe handles it under its own privacy policy." },
  { h: "Location & microphone", p: "Position is used only to show weather and your vessel map pin, and voice notes need the microphone. Both stay on your device; permission can be revoked any time in the browser." },
  { h: "Your rights", p: "Export everything from Settings → Data, or wipe it by clearing the site's browser storage. Questions: support@officerassistant.app." },
];

export default function PrivacyPage() {
  return (
    <div className="grid max-w-2xl gap-4">
      <div>
        <h1 className="text-3xl font-black">Privacy Policy</h1>
        <p className="text-sm opacity-60">Last updated October 2026</p>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.h} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{s.h}</h2>
          <p className="mt-1 text-sm opacity-80">{s.p}</p>
        </section>
      ))}
      <Link href="/terms" className="text-sm font-bold underline">Read the Terms of Use →</Link>
    </div>
  );
}

