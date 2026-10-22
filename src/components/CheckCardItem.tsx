"use client";
import type { CheckCard } from "@/lib/types";
import { AREA_LABEL, areaOf } from "@/lib/areas";
import { useLocale } from "@/lib/i18n";

export default function CheckCardItem({
  card,
  done,
  onToggle,
}: {
  card: CheckCard;
  done: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  return (
    <article className={`rounded-2xl border-2 p-4 ${done ? "border-emerald-500 bg-emerald-50 dark:border-red-700 dark:bg-red-950/30" : "border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-stone-900 px-2 py-0.5 text-amber-50 dark:bg-red-700 dark:text-white">{card.category}</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 uppercase text-amber-900 dark:bg-red-950 dark:text-red-300">{AREA_LABEL[areaOf(card)]}</span>
          </div>
          <h3 className="mt-2 font-bold text-stone-950 dark:text-red-100">{card.title}</h3>
          <p className="mt-1 text-sm font-medium text-stone-800 dark:text-red-200/90"><strong>{t("ci.check")}</strong> {card.checkPoint}</p>
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${done ? "bg-emerald-600 text-white dark:bg-red-600 dark:text-white" : "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white"}`}
          aria-pressed={done}
        >
          {done ? t("insp.done") : t("ci.mark")}
        </button>
      </div>
      <div className="mt-3 grid gap-2 text-sm font-medium md:grid-cols-3">
        <div className="rounded-xl bg-amber-50 p-3 text-stone-800 dark:bg-black dark:text-red-200/85 dark:ring-1 dark:ring-red-950"><strong className="text-stone-950 dark:text-red-100">{t("ci.how")}</strong><br />{card.howToPrepare}</div>
        <div className="rounded-xl bg-amber-50 p-3 text-stone-800 dark:bg-black dark:text-red-200/85 dark:ring-1 dark:ring-red-950"><strong className="text-stone-950 dark:text-red-100">{t("ci.evidence")}</strong><br />{card.evidence}</div>
        <div className="rounded-xl bg-amber-50 p-3 text-stone-800 dark:bg-black dark:text-red-200/85 dark:ring-1 dark:ring-red-950"><strong className="text-stone-950 dark:text-red-100">{t("ci.ref")}</strong><br />{card.reference}</div>
      </div>
    </article>
  );
}
