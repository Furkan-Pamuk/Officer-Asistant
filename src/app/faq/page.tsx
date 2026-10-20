import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { FAQ, TAGLINE } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ — Shark",
  description: "Answers about offline use, contracts, backups, subscriptions, IMPA import and privacy.",
};

export default function FaqPage() {
  return (
    <div className="grid gap-5">
      <div className="rounded-3xl border border-amber-200 bg-stone-900 p-7 text-amber-50 md:p-10 dark:border-red-900 dark:bg-black dark:text-red-200">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-300 dark:text-red-400">Help centre</p>
        <h1 className="mt-2 text-3xl font-bold">Frequently asked questions</h1>
        <p className="mt-3 max-w-2xl font-medium text-amber-100/90 dark:text-red-300/90">
          {TAGLINE} — here is everything crews ask before signing up.
        </p>
        <p className="mt-1 text-sm text-amber-200/80 dark:text-red-300/70">{FAQ.length} answers, updated as the app grows.</p>
      </div>

      <FaqAccordion />

      <div className="rounded-2xl border border-amber-200 bg-white p-5 text-center dark:border-red-950 dark:bg-neutral-950">
        <p className="text-sm font-medium opacity-80">Still stuck? We read every message.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Contact us</Link>
          <Link href="/about" className="rounded-full border border-amber-300 px-5 py-2 text-sm font-bold dark:border-red-900">About Shark</Link>
        </div>
      </div>
    </div>
  );
}

