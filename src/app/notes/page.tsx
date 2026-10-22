"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { getActiveContractId } from "@/lib/db";
import NotesPanel from "@/components/NotesPanel";

export default function NotesPage() {
  useDocTitle("notes.title");
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [has, setHas] = useState(false);

  useEffect(() => {
    setHas(Boolean(getActiveContractId()));
    setReady(true);
  }, []);

  if (!ready) return <p>{t("common.loading")}</p>;
  if (!has) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("notes.title")}</h1>
        <p className="text-sm">{t("notes.needVessel")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div><h1 className="text-2xl font-bold">{t("notes.titleVessel")}</h1><p className="text-sm font-medium opacity-70">{t("notes.sub")}</p></div>
      <NotesPanel />
    </div>
  );
}
