"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { departmentForRank } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import FieldError from "@/components/FieldError";
import { NATIONALITIES } from "@/lib/nationalities";

const RANKS = ["Master", "Chief Officer", "2nd Officer", "3rd Officer", "Deck Cadet", "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "ETO", "Fitter", "Oiler", "Bosun", "AB", "Cook", "Engine Cadet", "Other"];

function downscalePhoto(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ProfileEditor() {
  const { t } = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [nationality, setNationality] = useState("");
  const [customRank, setCustomRank] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    db.profile.get("me").then((p) => {
      if (p) { setProfile(p); setName(p.displayName); setRank(p.rank); setNationality(p.nationality ?? ""); }
    });
  }, []);

  async function save() {
    if (!name.trim()) { setErr(true); return; }
    setErr(false);
    const now = new Date().toISOString();
    const p: Profile = { id: "me", displayName: name.trim(), rank, nationality, department: departmentForRank(rank), photoDataUrl: profile?.photoDataUrl ?? "", updatedAt: now };
    await db.profile.put(p);
    setProfile(p);
    try {
      const activeId = localStorage.getItem("oa-active-contract");
      if (activeId) await db.contracts.update(activeId, { rank, updatedAt: now });
    } catch { /* ignore */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    const dataUrl = await downscalePhoto(file);
    const now = new Date().toISOString();
    const p: Profile = { id: "me", displayName: name, rank, nationality, department: departmentForRank(rank), photoDataUrl: dataUrl, updatedAt: now };
    await db.profile.put(p);
    setProfile(p);
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <div className="flex flex-wrap items-center gap-4">
        {profile?.photoDataUrl
          ? <img src={profile.photoDataUrl} alt={t("pe.alt")} className="h-20 w-20 rounded-full object-cover ring-2 ring-amber-300 dark:ring-red-800" />
          : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold dark:bg-red-950">🧑‍✈️</div>}
        <label className="cursor-pointer rounded-full border px-4 py-2 text-sm font-bold">
          {t("pe.upload")}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </label>
      </div>
      <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("pe.display")} aria-invalid={err} className="rounded-xl border px-3 py-2" />
        <FieldError msg={err ? t("form.required") : null} />
        <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="rounded-xl border px-3 py-2" aria-label={t("pe.nationality")}>
          <option value="">{t("pe.nationality")}</option>
          {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="grid gap-2">
          <select
            value={rank !== "" && !RANKS.includes(rank) ? "__custom" : rank}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom") setCustomRank(true);
              else { setCustomRank(false); setRank(v); }
            }}
            className="rounded-xl border px-3 py-2"
          >
            <option value="">{t("ctr.rankPh")}</option>
            {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="__custom">{t("ctr.otherRank")}</option>
          </select>
          {(customRank || (rank !== "" && !RANKS.includes(rank))) && (
            <input value={rank} onChange={(e) => setRank(e.target.value)} placeholder={t("ctr.typeRankPh")} autoComplete="off" className="rounded-xl border px-3 py-2" />
          )}
        </div>
      </div>
      <p className="mt-1 text-xs font-bold opacity-70">{t("pe.dept").replace("{x}", departmentForRank(rank) || "—")}</p>
      <button onClick={save} className="mt-3 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">
        {saved ? t("pe.saved") : t("pe.saveProfile")}
      </button>
    </div>
  );
}
