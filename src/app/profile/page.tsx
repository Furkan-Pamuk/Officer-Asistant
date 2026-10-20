"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfileEditor from "@/components/ProfileEditor";
import CvBuilder from "@/components/CvBuilder";
import SettingsPanels from "@/components/SettingsPanels";

type Tab = "profile" | "cv" | "settings";

function ProfileTabs() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("tab");
  const tab: Tab = raw === "cv" || raw === "settings" ? raw : "profile";

  function setTab(t: Tab) {
    router.replace(t === "profile" ? "/profile" : `/profile?tab=${t}`);
  }

  const btn = (t: Tab, label: string) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`rounded-full px-4 py-1.5 text-sm font-bold ${tab === t ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">👤 Profile</h1>
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          {btn("profile", "👤 Profile")}
          {btn("cv", "📄 CV Builder")}
          {btn("settings", "⚙️ Settings")}
        </div>
      </div>
      {tab === "profile" ? <ProfileEditor /> : tab === "cv" ? <CvBuilder /> : <SettingsPanels />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <ProfileTabs />
    </Suspense>
  );
}
