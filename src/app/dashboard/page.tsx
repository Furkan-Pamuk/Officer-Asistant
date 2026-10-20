"use client";
import { useEffect, useState } from "react";
import { getActiveContractId, seedChecklistsForContract, seedTodosForContract } from "@/lib/db";
import ActiveContractBoard from "@/components/ActiveContractBoard";
import GibsCountdown from "@/components/GibsCountdown";
import SignOffReminder from "@/components/SignOffReminder";
import HealthSection from "@/components/HealthSection";
import NotesPanel from "@/components/NotesPanel";
import MarketBoard from "@/components/MarketBoard";
import WeatherCard from "@/components/WeatherCard";
import VesselTracker from "@/components/VesselTracker";
import FrequentMenus from "@/components/FrequentMenus";
import FirstAid from "@/components/FirstAid";
import Whiteboard from "@/components/Whiteboard";
import SunMoonCard from "@/components/SunMoonCard";
import QiblaCard from "@/components/QiblaCard";
import { loadWidgetPrefs } from "@/lib/widgets";
import { useActiveContract } from "@/hooks/useActiveContract";

export default function Dashboard() {
  const { contract } = useActiveContract();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPrefs(loadWidgetPrefs());
    const active = getActiveContractId();
    if (!active) return;
    seedChecklistsForContract(active);
    seedTodosForContract(active);
  }, []);

  const on = (id: string) => prefs[id] !== false;

  return (
    <div className="grid gap-4">
      {on("counter") && <ActiveContractBoard />}
      {on("firstaid") && <FirstAid />}
      {on("gibs") && (
        <>
          {contract && <GibsCountdown contract={contract} />}
          <SignOffReminder />
        </>
      )}
      {(on("markets") || on("weather")) && (
        <div className="grid gap-3 md:grid-cols-2">
          {on("markets") && <MarketBoard />}
          {on("weather") && <WeatherCard />}
        </div>
      )}
      {on("tracker") && <VesselTracker />}
      {on("whiteboard") && <Whiteboard />}
      <div className="grid items-stretch gap-3 lg:grid-cols-5">
        {on("health") && <div className="lg:col-span-2"><HealthSection /></div>}
        {on("notes") && (
          <div className={on("health") ? "flex flex-col lg:col-span-3" : "lg:col-span-5"}>
            <h2 className="mb-2 text-lg font-black">📝 Notes</h2>
            <div className="min-h-0 flex-1">{contract ? <NotesPanel /> : <p className="text-sm">Select a contract for the notes board.</p>}</div>
          </div>
        )}
      </div>
      {(on("sunmoon") || on("qibla")) && (
        <div className="grid max-w-2xl grid-cols-2 gap-3">
          {on("sunmoon") && <SunMoonCard />}
          {on("qibla") && <QiblaCard />}
        </div>
      )}
      {on("frequent") && <FrequentMenus />}
    </div>
  );
}
