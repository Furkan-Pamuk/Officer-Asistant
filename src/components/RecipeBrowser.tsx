"use client";
import { useState } from "react";
import { DISHES } from "@/lib/menu";
import { RECIPES } from "@/lib/recipes";
import { useLocale } from "@/lib/i18n";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";

export default function RecipeBrowser({ cuisine }: { cuisine: string }) {
  const { t } = useLocale();
  const o = useContentOverlay();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = DISHES.filter(
    (d) => (d.cuisine || "turkish") === cuisine && d.name.toLowerCase().includes(q.trim().toLowerCase())
  );
  return (
    <div className="grid gap-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("recipe.search")} className="rounded-xl border px-3 py-2 text-sm" />
      {list.map((d) => {
        const raw = RECIPES[d.id];
        if (!raw) return null;
        const r = withOv(raw, cov(o, "recipes", d.id));
        const isOpen = openId === d.id;
        return (
          <div key={d.id} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:break-inside-avoid">
            <button onClick={() => setOpenId(isOpen ? null : d.id)} className="flex w-full items-center gap-2 text-left">
              <span className="flex-1 font-bold">{d.name} <span className="text-xs font-medium opacity-60">~{d.kcal} kcal • serves {r.serves}</span></span>
              <span className="font-black">{isOpen ? "▴" : "▾"}</span>
            </button>
            {isOpen && (
              <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-amber-50/60 p-3 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <div className="text-xs font-black uppercase tracking-widest opacity-60">{t("recipe.ing").replace("{x}", String(r.serves))}</div>
                  <ul className="mt-1 list-disc pl-5">{r.ingredients.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
                <div className="rounded-xl bg-amber-50/60 p-3 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <div className="text-xs font-black uppercase tracking-widest opacity-60">{t("recipe.method")}</div>
                  <ol className="mt-1 list-decimal pl-5">{r.steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {list.length === 0 && <p className="text-sm opacity-70">{t("recipe.noMatch")}</p>}
    </div>
  );
}
