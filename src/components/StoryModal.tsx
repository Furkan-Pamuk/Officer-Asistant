"use client";
import { useMemo, useState } from "react";
import { buildStorySVG, downloadStoryPNG, routePoints, shareStoryPNG, voyageStats } from "@/lib/story";
import { PORTS } from "@/lib/ports";

export default function StoryModal({ fromCode, toCode, fromTime, toTime, onClose }: {
  fromCode: string; toCode: string; fromTime?: string; toTime?: string; onClose: () => void;
}) {
  const [msg, setMsg] = useState("");
  const svg = useMemo(() => {
    const st = voyageStats(fromCode, toCode, fromTime, toTime);
    if (!st) return "";
    return buildStorySVG(st, routePoints(fromCode, toCode));
  }, [fromCode, toCode, fromTime, toTime]);
  if (!svg) return null;
  const st = voyageStats(fromCode, toCode, fromTime, toTime)!;
  const fname = `shark-${fromCode}-${toCode}.png`;

  async function onDownload() {
    setMsg("Rendering…");
    try {
      await downloadStoryPNG(svg, fname);
      setMsg("Downloaded — post it to your story.");
    } catch {
      setMsg("Render failed in this browser.");
    }
  }

  async function onShare() {
    setMsg("Opening share…");
    const ok = await shareStoryPNG(svg, fname, `${st.fromName} → ${st.toName} with Shark`);
    setMsg(ok ? "" : "Share not available — use Download instead.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3" onClick={onClose}>
      <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 p-3">
          <strong>📸 {st.fromName} → {st.toName}</strong>
          <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm font-bold">✕</button>
        </div>
        <div className="overflow-y-auto px-3">
          <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt="Voyage story" className="w-full rounded-2xl ring-1 ring-amber-200 dark:ring-red-950" />
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <button onClick={onDownload} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">⬇️ PNG</button>
          <button onClick={onShare} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white">📤 Share</button>
          {msg && <span className="text-xs font-bold opacity-70">{msg}</span>}
        </div>
        <p className="px-3 pb-3 text-[11px] opacity-60">1080×1920 story size. Distances from the onboard route planner (indicative).</p>
      </div>
    </div>
  );
}

export function portName(code: string) {
  return PORTS.find((p) => p.code === code)?.name ?? code;
}
