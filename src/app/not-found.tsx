"use client";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="mx-auto grid max-w-lg gap-4 py-16 text-center">
      <div className="text-6xl">🦈</div>
      <h1 className="text-3xl font-black">404</h1>
      <p className="font-medium opacity-70">{t("nf.text")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-stone-900 px-5 py-2.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">
          {t("nf.home")}
        </Link>
        <Link href="/dashboard" className="rounded-full border px-5 py-2.5 font-bold">
          {t("home.ctaDashboard")}
        </Link>
      </div>
    </div>
  );
}
