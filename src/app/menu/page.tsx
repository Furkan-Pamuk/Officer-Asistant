"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, getActiveContractId, uid } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { MEALS, autoWeek, dayLabel, dishesForMeal, mondayOf, addWeek, CUISINES } from "@/lib/menu";
import RecipeBrowser from "@/components/RecipeBrowser";
import type { Dish, MenuMeal, MenuSnap, WeekPlan } from "@/lib/types";

export default function MenuPage() {
  const [contractId, setContractId] = useState<string | null>(null);
  const [week, setWeek] = useState("");
  const [cuisine, setCuisine] = useState("turkish");
  const plans = useLiveQuery(() => db.menuPlans.toArray(), []);
  const customDishes = useLiveQuery(() => db.dishes.toArray(), []);
  const snaps = useLiveQuery(
    () => (contractId ? db.menuSnaps.where("contractId").equals(contractId).toArray() : Promise.resolve([] as MenuSnap[])),
    [contractId]
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [kcal, setKcal] = useState("");
  const [newDish, setNewDish] = useState("");
  const [newKcal, setNewKcal] = useState("");
  const [newMeal, setNewMeal] = useState<MenuMeal>("dinner");
  const [tab, setTab] = useState<"menu" | "recipes">("menu");

  useEffect(() => { setContractId(getActiveContractId()); setWeek(mondayOf(new Date())); }, []);

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Weekly menu</h1>
        <p className="text-sm">Select a contract first — menus are kept per vessel.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  if (!week) return <p>Loading menu…</p>;

  const plan: WeekPlan | undefined = (plans ?? []).find((p) => p.id === `${contractId}__${week}`);
  const extra = customDishes ?? [];
  const slots = plan?.slots ?? {};

  async function savePlan(next: Record<string, { text: string; kcal: number }>) {
    const cid = contractId;
    if (!cid) return;
    await db.menuPlans.put({ id: `${cid}__${week}`, contractId: cid, weekStart: week, slots: next, updatedAt: new Date().toISOString() });
  }

  async function setSlot(key: string, t: string, k: number) {
    await savePlan({ ...slots, [key]: { text: t, kcal: k } });
  }

  async function autoGenerate() {
    if (plan && Object.keys(slots).length > 0 && !confirm("Overwrite this week's menu?")) return;
    await savePlan(autoWeek(extra, cuisine));
  }

  function menuText(): string {
    const lines = [`Weekly menu — week of ${week}`];
    for (let day = 0; day < 7; day++) {
      lines.push(`\n${dayLabel(week, day)}`);
      for (const m of MEALS) {
        const s = slots[`${day}-${m.id}`];
        lines.push(`  ${m.label}: ${s ? `${s.text} (~${s.kcal} kcal)` : "—"}`);
      }
    }
    return lines.join("\n");
  }

  async function share() {
    const text = menuText();
    try {
      if (navigator.share) { await navigator.share({ title: `Menu week of ${week}`, text }); return; }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert("Menu copied — paste it anywhere.");
      } catch { alert("Sharing not available here."); }
    }
  }

  async function copyWeek(fromId: string) {
    const src = (plans ?? []).find((p) => p.id === fromId);
    if (!src) return;
    if (Object.keys(slots).length > 0 && !confirm("Overwrite this week's menu with the archived one?")) return;
    await savePlan(src.slots);
  }

  async function saveSnap() {
    if (!contractId || Object.keys(slots).length === 0) { alert("Fill this week first."); return; }
    const name = prompt("Name this menu (e.g. Ramadan week, Indian crew week):");
    if (!name?.trim()) return;
    await db.menuSnaps.add({ id: uid("ms"), contractId, name: name.trim(), slots: { ...slots }, createdAt: new Date().toISOString() });
  }

  async function loadSnap(s: MenuSnap) {
    if (Object.keys(slots).length > 0 && !confirm(`Overwrite this week with "${s.name}"?`)) return;
    await savePlan({ ...s.slots });
  }

  const pastWeeks = (plans ?? []).filter((p) => p.contractId === contractId && p.weekStart !== week).sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  async function addCustomDish() {
    if (!newDish.trim()) return;
    await db.dishes.add({ id: uid("dish"), name: newDish.trim(), kcal: parseInt(newKcal) || 300, meal: newMeal, cuisine, tags: [], custom: true });
    setNewDish(""); setNewKcal("");
  }

  let weekKcal = 0;
  let weekCount = 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Weekly menu 🍽️</h1>
          <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">3 meals × 7 days. Kcal ≈ estimates. Pick from the dropdown or type your own.</p>
        </div>
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          <button onClick={() => setTab("menu")} className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === "menu" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>🗓️ Menu</button>
          <button onClick={() => setTab("recipes")} className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === "recipes" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>📖 Recipes</button>
        </div>
      </div>
      <div className={tab === "recipes" ? "grid gap-4" : "hidden"}>
        <RecipeBrowser cuisine={cuisine} />
      </div>
      <div className={tab === "menu" ? "contents" : "hidden"}>
      <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map((c) => (
              <button key={c.id} onClick={() => setCuisine(c.id)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${cuisine === c.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border bg-white dark:bg-black"}`}>{c.label}</button>
            ))}
          </div>
          <button onClick={() => setWeek(addWeek(week, -1))} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">← Prev</button>
          <span className="rounded-full bg-stone-900 px-3 py-1.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Week of {week}</span>
          <button onClick={() => setWeek(addWeek(week, 1))} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">Next →</button>
          <button onClick={autoGenerate} className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white">✨ Auto-generate</button>
          <button onClick={share} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">📤 Share</button>
          <button onClick={() => window.print()} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">🖨️ Print</button>
        </div>

      <div className="grid gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          let dayKcal = 0;
          return (
            <div key={day} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{dayLabel(week, day)}</h2>
                <span className="text-xs font-bold" id={`kcal-${day}`}>{MEALS.reduce((a, m) => a + (slots[`${day}-${m.id}`]?.kcal ?? 0), 0)} kcal</span>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                {MEALS.map((m) => {
                  const key = `${day}-${m.id}`;
                  const cur = slots[key];
                  dayKcal += cur?.kcal ?? 0;
                  const all = dishesForMeal(m.id, extra, cuisine);
                  return (
                    <div key={key} className="min-w-0 rounded-xl bg-amber-50 p-2 dark:bg-black dark:ring-1 dark:ring-red-950">
                      <div className="text-xs font-bold">{m.label} <span className="font-normal opacity-60">({m.hint})</span></div>
                      {editing === key ? (
                        <div className="mt-1 grid gap-1">
                          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Dish…" className="w-full min-w-0 rounded-lg border px-2 py-1 text-sm" />
                          <input value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal" inputMode="numeric" className="w-full min-w-0 rounded-lg border px-2 py-1 text-sm" />
                          <select value={text} onChange={(e) => { const d = all.find((x) => x.name === e.target.value); if (d) { setText(d.name); setKcal(String(d.kcal)); } }} className="w-full min-w-0 rounded-lg border px-2 py-1 text-sm">
                            <option value="">Dropdown ({all.length})…</option>
                            {all.map((d) => <option key={d.id} value={d.name}>{d.name} (~{d.kcal})</option>)}
                          </select>
                          <div className="flex gap-1">
                            <button onClick={() => { if (text.trim()) setSlot(key, text.trim(), parseInt(kcal) || 0); setEditing(null); }} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50">Save</button>
                            <button onClick={() => setEditing(null)} className="rounded-full border px-3 py-1 text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setEditing(key); setText(cur?.text ?? ""); setKcal(cur ? String(cur.kcal) : ""); }} className="mt-1 w-full rounded-lg bg-white/70 px-2 py-1.5 text-left text-sm break-words dark:bg-neutral-900">
                          {cur ? <><strong className="break-words">{cur.text}</strong> <span className="whitespace-nowrap text-xs opacity-60">~{cur.kcal} kcal</span></> : <span className="opacity-50">+ Add {m.label.toLowerCase()}</span>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">🗂️ Menu archive — reuse a past week</h2>
          <button onClick={saveSnap} className="rounded-full border px-3 py-1 text-xs font-bold">💾 Save this week</button>
        </div>
        {pastWeeks.length === 0 ? (
          <p className="mt-1 text-sm opacity-70">No saved weeks yet — fill one above and it will appear here.</p>
        ) : (
          <div className="mt-2 grid gap-1 text-sm">
            {pastWeeks.map((p) => {
              const filled = Object.values(p.slots).filter((s) => s.text).length;
              return (
                <div key={p.id} className="flex items-center gap-2 rounded-xl bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <span className="flex-1 font-bold">Week of {p.weekStart} <span className="font-normal opacity-60">({filled}/21 filled)</span></span>
                  <button onClick={() => copyWeek(p.id)} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">Copy to this week</button>
                </div>
              );
            })}
          </div>
        )}
        {(snaps ?? []).length > 0 && (
          <div className="mt-2 grid gap-1 text-sm">
            <div className="text-xs font-black uppercase tracking-widest opacity-60">Named menus</div>
            {(snaps ?? []).slice().reverse().map((s) => {
              const filled = Object.values(s.slots).filter((x) => x.text).length;
              return (
                <div key={s.id} className="flex items-center gap-2 rounded-xl bg-violet-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <span className="flex-1 font-bold">💾 {s.name} <span className="font-normal opacity-60">({filled} dishes • {s.createdAt.slice(0, 10)})</span></span>
                  <button onClick={() => loadSnap(s)} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">Load</button>
                  <button onClick={() => db.menuSnaps.delete(s.id)} className="text-xs font-bold text-red-600">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 p-4 text-sm dark:border-red-900 dark:bg-red-950/10">
        <h2 className="font-bold">Add your own dish</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <input value={newDish} onChange={(e) => setNewDish(e.target.value)} placeholder="e.g. Hünkar beğendi" className="flex-1 min-w-40 rounded-xl border px-3 py-1.5" />
          <input value={newKcal} onChange={(e) => setNewKcal(e.target.value)} placeholder="kcal ≈" inputMode="numeric" className="w-24 rounded-xl border px-3 py-1.5" />
          <select value={newMeal} onChange={(e) => setNewMeal(e.target.value as MenuMeal)} className="rounded-xl border px-3 py-1.5">
            <option value="breakfast">Kahvaltı</option><option value="lunch">Öğle</option><option value="dinner">Akşam</option>
          </select>
          <button onClick={addCustomDish} className="rounded-full bg-stone-900 px-4 py-1.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Add dish</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 text-xs">
          {extra.map((d) => (
            <span key={d.id} className="rounded-full border px-2 py-0.5">{d.name} (~{d.kcal}) <button onClick={() => db.dishes.delete(d.id)} className="font-bold text-red-600">✕</button></span>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
