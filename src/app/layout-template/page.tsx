"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import ResponsiveGrid, { GridMasterPane, GridDetailPane } from "@/components/layout/ResponsiveGrid";
import ResponsiveCard from "@/components/layout/ResponsiveCard";
import { useDocTitle } from "@/lib/doctitle";

type ViewportMode = "fluid" | "mobile" | "tablet" | "desktop";

export default function LayoutTemplatePage() {
  useDocTitle("Layout Template Showcase");

  const [viewportMode, setViewportMode] = useState<ViewportMode>("fluid");
  const [activeTab, setActiveTab] = useState<"dashboard" | "split" | "typography">("dashboard");
  const [selectedVessel, setSelectedVessel] = useState("IMO 9876543");

  // Simulated live fluctuating telemetry for heading & SOG
  const [heading, setHeading] = useState(274.2);
  const [speed, setSpeed] = useState(14.8);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeading((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setSpeed((prev) => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const VIEWPORT_WIDTH_MAP: Record<ViewportMode, string> = {
    fluid: "w-full",
    mobile: "max-w-[390px] mx-auto border-x-4 border-slate-300 dark:border-red-900 shadow-2xl rounded-3xl overflow-hidden",
    tablet: "max-w-[768px] mx-auto border-x-4 border-slate-300 dark:border-red-900 shadow-2xl rounded-3xl overflow-hidden",
    desktop: "max-w-[1280px] mx-auto border-x-4 border-slate-300 dark:border-red-900 shadow-2xl rounded-3xl overflow-hidden",
  };

  return (
    <AppShell containerSize="standard">
      {/* Page Header & Viewport Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-red-950 dark:text-red-300">
                LAYOUT TEMPLATE
              </span>
              <span className="text-xs text-slate-500 dark:text-red-400/70 font-mono">
                IEC 62288 • UTOPIA CLAMP • CONTAINER QUERIES
              </span>
            </div>
            <h1 className="mt-1 text-fluid-2xl font-extrabold tracking-tight text-slate-900 dark:text-red-100">
              Responsive Maritime UI Layout System
            </h1>
            <p className="text-fluid-sm text-slate-600 dark:text-red-300/80">
              Mobile-first fluid grid, 3-tier adaptive navigation, and scalable fluid typography.
            </p>
          </div>

          {/* Viewport Simulator Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs dark:border-red-950 dark:bg-[#0c0c0e]">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-red-400/60">
              Frame:
            </span>
            {(["fluid", "mobile", "tablet", "desktop"] as ViewportMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewportMode(mode)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                  viewportMode === mode
                    ? "bg-slate-900 text-white dark:bg-red-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-red-300/70 dark:hover:bg-red-950/40"
                }`}
              >
                {mode === "fluid" ? "100% Fluid" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-red-950/80">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "dashboard"
                ? "border-slate-900 text-slate-900 dark:border-red-500 dark:text-red-200"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-red-400/60 dark:hover:text-red-200"
            }`}
          >
            🧭 Fluid Dashboard Grid
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "split"
                ? "border-slate-900 text-slate-900 dark:border-red-500 dark:text-red-200"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-red-400/60 dark:hover:text-red-200"
            }`}
          >
            📋 Master-Detail Split Pane
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("typography")}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "typography"
                ? "border-slate-900 text-slate-900 dark:border-red-500 dark:text-red-200"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-red-400/60 dark:hover:text-red-200"
            }`}
          >
            🔤 Fluid Scalable Typography
          </button>
        </div>
      </div>

      {/* Viewport Frame Container */}
      <div className={`transition-all duration-300 ${VIEWPORT_WIDTH_MAP[viewportMode]}`}>
        {/* TAB 1: FLUID DASHBOARD GRID */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* Primary Telemetry Cards */}
            <ResponsiveGrid preset="dashboard" gap="md">
              <ResponsiveCard
                title="Heading (HDG)"
                subtitle="Gyrocompass 1"
                icon="🧭"
                telemetryValue={heading}
                telemetryUnit="DEG"
                trend="steady"
                status="normal"
                statusLabel="ONLINE"
                expandableModal
              >
                <div className="space-y-2 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Magnetic Compass:</span>
                    <span className="font-mono font-bold font-tabular">273.8°</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Rate of Turn (ROT):</span>
                    <span className="font-mono font-bold font-tabular">0.2°/min Port</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Selected Source:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">Master Gyro</span>
                  </div>
                </div>
              </ResponsiveCard>

              <ResponsiveCard
                title="Speed Over Ground"
                subtitle="Dual DGPS Array"
                icon="⚡"
                telemetryValue={speed}
                telemetryUnit="KN"
                trend="up"
                status="normal"
                statusLabel="OPTIMAL"
                expandableModal
              >
                <div className="space-y-2 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Speed Thru Water:</span>
                    <span className="font-mono font-bold font-tabular">15.1 kn</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Course Over Ground:</span>
                    <span className="font-mono font-bold font-tabular">272.9°</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Current Drift:</span>
                    <span className="font-mono font-bold font-tabular">0.4 kn @ 110°</span>
                  </div>
                </div>
              </ResponsiveCard>

              <ResponsiveCard
                title="Under-Keel Clearance"
                subtitle="Echo Sounder Transducer"
                icon="🌊"
                telemetryValue="28.4"
                telemetryUnit="M"
                status="info"
                statusLabel="SAFE DEPTH"
                expandableModal
              >
                <div className="space-y-2 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Forward Draft:</span>
                    <span className="font-mono font-bold font-tabular">10.20 m</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1 dark:border-red-950/40">
                    <span>Aft Draft:</span>
                    <span className="font-mono font-bold font-tabular">10.65 m</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Trim:</span>
                    <span className="font-bold text-slate-700 dark:text-red-300">0.45 m by stern</span>
                  </div>
                </div>
              </ResponsiveCard>

              <ResponsiveCard
                title="Bridge Alerts (BAM)"
                subtitle="Active Alarms & Warnings"
                icon="⚠️"
                telemetryValue="2"
                telemetryUnit="ACTIVE"
                status="warning"
                statusLabel="CAUTION"
                expandableModal
              >
                <div className="space-y-2 text-fluid-xs">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    <p className="font-bold">BNWAS 3-min Alert Trigger</p>
                    <p className="text-[11px] opacity-80">Reset acknowledgment requested on bridge wing.</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-700 dark:bg-red-950/30 dark:text-red-300 border border-slate-200 dark:border-red-950">
                    <p className="font-bold">ECDIS Safety Contour Cross</p>
                    <p className="text-[11px] opacity-80">Waypoint 14 approach in 28 nm.</p>
                  </div>
                </div>
              </ResponsiveCard>
            </ResponsiveGrid>

            {/* Auto-fit Secondary Cards */}
            <h3 className="text-fluid-lg font-bold text-slate-800 dark:text-red-200">
              Operations & Watch Tasks
            </h3>
            <ResponsiveGrid preset="auto-fit" minItemWidth="280px" gap="sm">
              <ResponsiveCard title="Deck Watch Checklist" icon="✅" collapsible>
                <ul className="space-y-1.5 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" />
                    <span>Navigation lights checked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-teal-600" />
                    <span>VHF Ch. 16 dual-watch active</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded accent-teal-600" />
                    <span>Hourly position plotted on paper/ECDIS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded accent-teal-600" />
                    <span>Lookout relief handover</span>
                  </li>
                </ul>
              </ResponsiveCard>

              <ResponsiveCard title="Weather & Barometer" icon="🌤️" collapsible>
                <div className="space-y-1 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <p><span className="font-semibold">Wind:</span> NW 18-22 kn (Beaufort 5)</p>
                  <p><span className="font-semibold">Sea State:</span> Rough, swell 2.2 m</p>
                  <p><span className="font-semibold">Pressure:</span> 1014.5 hPa (steady)</p>
                  <p><span className="font-semibold">Visibility:</span> &gt; 10 NM</p>
                </div>
              </ResponsiveCard>

              <ResponsiveCard title="Vessel Stores Status" icon="📦" collapsible>
                <div className="space-y-1 text-fluid-xs text-slate-600 dark:text-red-300/80">
                  <p><span className="font-semibold">Fresh Water:</span> 182 MT (78%)</p>
                  <p><span className="font-semibold">VLSFO Bunkers:</span> 420 MT</p>
                  <p><span className="font-semibold">Lube Oil:</span> 14,200 L</p>
                  <p><span className="font-semibold">Provisions:</span> 24 days remaining</p>
                </div>
              </ResponsiveCard>
            </ResponsiveGrid>
          </div>
        )}

        {/* TAB 2: MASTER-DETAIL SPLIT PANE */}
        {activeTab === "split" && (
          <ResponsiveGrid preset="split" gap="md">
            {/* Master List Pane (Left, 4 cols on desktop) */}
            <GridMasterPane span={4}>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-red-950 dark:bg-[#0c0c0e]">
                <h3 className="mb-2 px-2 text-fluid-xs font-bold uppercase tracking-wider text-slate-400 dark:text-red-400/70">
                  Fleet Vessels & Contracts
                </h3>
                <div className="space-y-1">
                  {[
                    { id: "IMO 9876543", name: "M/V Atlantic Shark", type: "Container 14,000 TEU", flag: "Panama 🇵🇦", active: true },
                    { id: "IMO 9765432", name: "M/T Pacific Wave", type: "Chemical Tanker 50k", flag: "Marshall Is 🇲🇭", active: false },
                    { id: "IMO 9654321", name: "M/V Baltic Pioneer", type: "Bulk Carrier Capesize", flag: "Liberia 🇱🇷", active: false },
                    { id: "IMO 9543210", name: "M/T Polar Gas", type: "LNG Carrier 174k", flag: "Singapore 🇸🇬", active: false },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVessel(v.id)}
                      className={`w-full text-left rounded-xl p-3 transition-colors ${
                        selectedVessel === v.id
                          ? "bg-slate-900 text-white dark:bg-red-900 dark:text-white"
                          : "hover:bg-slate-100 text-slate-800 dark:text-red-200 dark:hover:bg-red-950/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-fluid-sm">{v.name}</span>
                        <span className="text-xs">{v.flag}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-fluid-xs opacity-70">
                        <span>{v.type}</span>
                        <span className="font-mono">{v.id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </GridMasterPane>

            {/* Detail Pane (Right, 8 cols on desktop) */}
            <GridDetailPane span={8}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-red-950 dark:bg-[#0c0c0e] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 dark:border-red-950">
                  <div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                      ACTIVE VESSEL DETAIL
                    </span>
                    <h2 className="text-fluid-xl font-extrabold text-slate-900 dark:text-red-100">
                      M/V Atlantic Shark ({selectedVessel})
                    </h2>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-900 dark:bg-red-950 dark:text-red-300 self-start sm:self-auto mt-2 sm:mt-0">
                    ON WATCH
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-red-950">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-red-400/60 uppercase">Rank</p>
                    <p className="text-fluid-base font-bold text-slate-900 dark:text-red-200">Chief Officer</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-red-950">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-red-400/60 uppercase">Contract End</p>
                    <p className="text-fluid-base font-bold font-mono text-slate-900 dark:text-red-200">2026-12-15</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-red-950">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-red-400/60 uppercase">Next Port</p>
                    <p className="text-fluid-base font-bold text-slate-900 dark:text-red-200">Rotterdam (NL)</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-fluid-sm font-bold text-slate-900 dark:text-red-200 mb-2">
                    Pre-Arrival Checklist Status
                  </h4>
                  <div className="space-y-2">
                    {[
                      { item: "Pilot card prepared with current drafts and maneuvering data", done: true },
                      { item: "Main propulsion ahead/astern air test verified", done: true },
                      { item: "Steering gear hydraulic pumps 1 & 2 dual-run test completed", done: true },
                      { item: "Anchors cleared for letting go and windlass operational", done: false },
                      { item: "VHF contact established with Port Control (VTS)", done: false },
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-red-950/60 dark:bg-red-950/20"
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${c.done ? "bg-teal-500" : "bg-amber-400"}`} />
                        <span className={`text-fluid-xs flex-1 ${c.done ? "line-through opacity-70" : "font-semibold"}`}>
                          {c.item}
                        </span>
                        <span className="text-[10px] font-bold uppercase opacity-60">
                          {c.done ? "COMPLETED" : "PENDING"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GridDetailPane>
          </ResponsiveGrid>
        )}

        {/* TAB 3: SCALABLE FLUID TYPOGRAPHY DEMO */}
        {activeTab === "typography" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-red-950 dark:bg-[#0c0c0e] space-y-6">
            <div>
              <h2 className="text-fluid-xl font-bold text-slate-900 dark:text-red-100">
                Utopia-Derived CSS Fluid Typography Scale
              </h2>
              <p className="text-fluid-xs text-slate-500 dark:text-red-300/70">
                Mathematically scales smoothly between 360px viewport (mobile) and 1280px+ (desktop) using CSS clamp().
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-red-950/60">
              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-readout (1.75rem → 3.25rem)
                </span>
                <p className="text-fluid-readout font-tabular text-slate-900 dark:text-red-100">
                  274.5° GYRO
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-3xl (1.875rem → 2.75rem)
                </span>
                <p className="text-fluid-3xl font-extrabold text-slate-900 dark:text-red-100">
                  Officer-Asistant Dashboard
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-2xl (1.5rem → 2.0rem)
                </span>
                <p className="text-fluid-2xl font-bold text-slate-900 dark:text-red-100">
                  Section Header: Voyage Plan & Weather Routing
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-xl (1.25rem → 1.5625rem)
                </span>
                <p className="text-fluid-xl font-semibold text-slate-900 dark:text-red-100">
                  Card Title: Automatic Radar Plotting Aid (ARPA) Targets
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-lg (1.0625rem → 1.25rem)
                </span>
                <p className="text-fluid-lg font-medium text-slate-800 dark:text-red-200">
                  Emphasized Subhead: Closest Point of Approach (CPA) 2.4 nm in 18 minutes.
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-base (0.9375rem → 1.0625rem)
                </span>
                <p className="text-fluid-base text-slate-700 dark:text-red-200">
                  Standard Body Text: All crew members must report to their emergency stations during fire drill. Lifeboat launching mechanisms and hydrostatic releases have been inspected per SOLAS requirements.
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-sm (0.8125rem → 0.9375rem)
                </span>
                <p className="text-fluid-sm text-slate-600 dark:text-red-300/80">
                  Secondary Details: Logged by Second Officer at 14:00 UTC under Beaufort Force 5 wind conditions.
                </p>
              </div>

              <div className="pt-3">
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  .text-fluid-xs (0.72rem → 0.8125rem)
                </span>
                <p className="text-fluid-xs uppercase tracking-wider text-slate-500 dark:text-red-400/70 font-semibold">
                  Overline / Units: LAT 62° 27.599&apos; N • LON 006° 11.996&apos; E • GEODETIC WGS-84
                </p>
              </div>
            </div>

            {/* Tabular vs Non-Tabular Comparison */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-red-950 dark:bg-black">
              <h4 className="text-fluid-sm font-bold text-slate-900 dark:text-red-200 mb-2">
                Tabular Numbers Comparison (IEC 62288 Compliance)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-[#0c0c0e] dark:border-red-950">
                  <p className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400">
                    With .font-tabular (Zero Jitter)
                  </p>
                  <p className="font-mono font-tabular text-2xl font-extrabold text-slate-900 dark:text-red-100">
                    HDG {heading.toFixed(1)}° • SOG {speed.toFixed(1)} kn
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200 dark:bg-[#0c0c0e] dark:border-red-950">
                  <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                    Standard Proportional (Causes Text Shaking)
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-red-100">
                    HDG {heading.toFixed(1)}° • SOG {speed.toFixed(1)} kn
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
