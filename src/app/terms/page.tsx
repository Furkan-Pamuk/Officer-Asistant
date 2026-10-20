import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Shark",
  description: "The rules for using Shark.",
};

const SECTIONS: { h: string; p: string }[] = [
  { h: "What Shark is", p: "An offline-first preparation workspace for seafarers: check cards, checklists, notes, stores and planning tools. It does not replace official publications, company SMS procedures or the master's authority." },
  { h: "Licensed material", p: "SIRE 2.0 and CDI question banks are licensed publications. Shark ships original summaries only — always consult the official library or manual for exact wording before an inspection." },
  { h: "Your content", p: "Notes, photos, voice recordings and uploads remain yours. Keep your own backups via Settings → Data export." },
  { h: "Subscriptions", p: "Pro plans bill in USD through Stripe, renew per the chosen period, and can be cancelled any time with access until period end. Free plan stays free." },
  { h: "Fair use", p: "One account per person. Do not resell access, scrape the service, or upload unlawful content. Accounts breaching this may be suspended." },
  { h: "Liability", p: "Provided as-is for preparation purposes. We are not liable for inspection outcomes, operational decisions or data loss — export backups regularly." },
];

export default function TermsPage() {
  return (
    <div className="grid max-w-2xl gap-4">
      <div>
        <h1 className="text-3xl font-black">Terms of Use</h1>
        <p className="text-sm opacity-60">Last updated October 2026</p>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.h} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{s.h}</h2>
          <p className="mt-1 text-sm opacity-80">{s.p}</p>
        </section>
      ))}
      <Link href="/privacy" className="text-sm font-bold underline">Read the Privacy Policy →</Link>
    </div>
  );
}

