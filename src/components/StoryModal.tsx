"use client";
import { useMemo, useState } from "react";
import { buildStorySVG, downloadStoryPNG, routePoints, shareStoryPNG, voyageStats } from "@/lib/story";
import type { RoutePlan } from "@/lib/route";
import { PORTS } from "@/lib/ports";
import { useLocale } from "@/lib/i18n";

export default function StoryModal({ fromCode, toCode, fromTime, toTime, onClose, routePlan }: {
  fromCode: string; toCode: string; fromTime?: string; toTime?: string; onClose: () => void; routePlan?: RoutePlan;
}) {
  const [msg, setMsg] = useState("");
  const { t } = useLocale();
  const st = useMemo(() => {
    const stats = voyageStats(fromCode, toCode, fromTime, toTime);
    return stats && routePlan ? { ...stats, distanceNm: routePlan.totalNm, avgKn: stats.hours ? routePlan.totalNm / stats.hours : null } : stats;
  }, [fromCode, toCode, fromTime, toTime, routePlan]);
  const svg = useMemo(() => st ? buildStorySVG(st, routePlan?.points ?? routePoints(fromCode, toCode)) : "", [st, routePlan, fromCode, toCode]);
  if (!svg || !st) return null;
  const fname = `shark-${fromCode}-${toCode}.png`;

  async function onDownload() {
    setMsg(t("story.rendering"));
    try {
      await downloadStoryPNG(svg, fname);
      setMsg(t("story.downloaded"));
    } catch {
      setMsg(t("story.renderFail"));
    }
  }

  async function onShare() {
    if (!st) return;
    setMsg(t("story.opening"));
    const ok = await shareStoryPNG(svg, fname, `${st.fromName} → ${st.toName} with Shark`);
    setMsg(ok ? "" : t("story.noShare"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3" onClick={onClose}>
      <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 p-3">
          <strong>📸 {st.fromName} → {st.toName}</strong>
          <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm font-bold">✕</button>
        </div>
        <div className="overflow-y-auto px-3">
          <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt={t("story.voyAlt")} className="w-full rounded-2xl ring-1 ring-amber-200 dark:ring-red-950" />
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <button onClick={onDownload} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">⬇️ PNG</button>
          <button onClick={onShare} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white">📤 {t("common.share")}</button>
          {msg && <span className="text-xs font-bold opacity-70">{msg}</span>}
        </div>
        <p className="px-3 pb-3 text-[11px] opacity-60">{t("story.sizeHint")}</p>
      </div>
    </div>
  );
}

export function portName(code: string) {
  return PORTS.find((p) => p.code === code)?.name ?? code;
}
