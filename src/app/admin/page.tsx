"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDocTitle } from "@/lib/doctitle";
import type { AdminUser, ApiActivityLog, AdminMetrics, PerUserStats } from "@/lib/server-admin-tracker";

interface SelectedUserDetail {
  user: AdminUser;
  stats: PerUserStats;
  logs: ApiActivityLog[];
}

export default function AdminDashboardPage() {
  useDocTitle("admin.title");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [logs, setLogs] = useState<ApiActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "success" | "failed">("all");
  const [simulating, setSimulating] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<SelectedUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeUserDetail();
    }
    if (selectedUserId) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedUserId]);

  async function openUserDetail(userId: string) {
    setSelectedUserId(userId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to load user detail");
      const data = await res.json();
      if (data.success) {
        setUserDetail({ user: data.user, stats: data.stats, logs: data.logs || [] });
      }
    } catch (err) {
      console.error("User detail fetch error:", err);
      setUserDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeUserDetail() {
    setSelectedUserId(null);
    setUserDetail(null);
  }

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/admin/metrics");
      if (!res.ok) throw new Error("Failed to load metrics");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setMetrics(data.metrics || null);
        setLogs(data.logs || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  }

  async function simulateRequest() {
    setSimulating(true);
    try {
      const sampleItems = [
        { id: "791821", name: "CHIPPING HAMMER STEEL HANDLE 500G", cat: "spare-deck" },
        { id: "150281", name: "PILLOW FOAM RUBBER 400X600MM", cat: "galley" },
        { id: "232011", name: "BALLPOINT PEN BLUE MEDIUM", cat: "stationery" },
        { id: "610115", name: "PIPE WRENCH HEAVY DUTY 14-INCH", cat: "spare-engine" },
        { id: "190111", name: "SAFETY HELMET WHITE VENTED", cat: "spare-deck" },
      ];
      const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)] || {
        id: "usr_cadet",
        name: "Leo Miller",
        rank: "Deck Cadet",
        vessel: "M/V Pacific Horizon",
      };

      const isSuccess = Math.random() > 0.15;

      await fetch("/api/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate",
          userId: randomUser.id,
          userName: randomUser.name,
          userRank: randomUser.rank,
          vessel: randomUser.vessel,
          status: isSuccess ? "success" : "failed",
          productId: isSuccess ? randomItem.id : undefined,
          productName: isSuccess ? randomItem.name : undefined,
          category: isSuccess ? randomItem.cat : undefined,
          errorMessage: isSuccess ? undefined : "Image blurry: unable to resolve IMPA catalog number",
        }),
      });

      await fetchMetrics();
    } catch (err) {
      console.error("Simulate error:", err);
    } finally {
      setSimulating(false);
    }
  }

  function exportAuditLog() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ users, metrics, logs }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shark-admin-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.rank.toLowerCase().includes(q) ||
        u.vessel.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return logs;
    return logs.filter((l) => l.status === logFilter);
  }, [logs, logFilter]);

  return (
    <div className="shark-interior-page">
      <div className="grid gap-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-amber-200/60 pb-4 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-lg">
                👑
              </span>
              <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Live Monitoring
              </span>
            </div>
            <p className="mt-1 text-sm font-medium opacity-70">
              User activity oversight, API request counts, and Google AI vision performance.
              {lastRefreshed && <span className="ml-2 font-mono text-xs opacity-60">• Updated {lastRefreshed}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={simulateRequest}
              disabled={simulating}
              className="flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-stone-900 hover:bg-amber-200 disabled:opacity-50 dark:border-red-900 dark:bg-stone-900 dark:text-amber-200"
            >
              <span>⚡</span>
              <span>{simulating ? "Simulating..." : "Simulate Test Request"}</span>
            </button>

            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-50 dark:border-stone-800 dark:bg-black dark:text-stone-200"
            >
              <span>📥</span>
              <span>Export Audit Log</span>
            </button>

            <button
              onClick={fetchMetrics}
              className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold text-amber-50 hover:bg-stone-800 dark:bg-red-700 dark:text-white"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-amber-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Total API Requests
              </span>
              <span className="rounded-full bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
                📊
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-black">
                {metrics?.totalRequests ?? 0}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {metrics?.successfulRequests ?? 0} success
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${metrics?.successRate ?? 95}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold">{metrics?.successRate ?? 95}%</span>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Active Users
              </span>
              <span className="rounded-full bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                👥
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-black">
                {metrics?.activeUsersCount ?? 0}
              </span>
              <span className="text-xs font-medium opacity-60">
                of {metrics?.totalUsersCount ?? 0} registered crew
              </span>
            </div>
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
              Officers & crew making store requests
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Products Identified
              </span>
              <span className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                📦
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-black">
                {metrics?.totalProductsIdentified ?? 0}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                IMPA Verified
              </span>
            </div>
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
              Matched strictly against My List catalog
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Avg Model Latency
              </span>
              <span className="rounded-full bg-purple-500/10 p-1.5 text-purple-600 dark:text-purple-400">
                ⚡
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-black">
                {metrics?.avgLatencyMs ?? 740}
              </span>
              <span className="text-xs font-medium opacity-60">ms</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Google Gemini 2.0 Flash</span>
            </div>
          </div>
        </div>

        {/* Section 1: User Directory & Request Tracking */}
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Crew & Officer API Usage</h2>
              <p className="text-xs opacity-70">
                Tracks the number of AI vision requests made per user, department, and vessel.
                Select a row to open the per-user API breakdown.
              </p>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by officer name, rank, vessel..."
              className="w-72 rounded-xl border border-amber-200 bg-stone-50 px-3 py-1.5 text-xs dark:border-stone-800 dark:bg-stone-900"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-100 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th className="py-2.5 font-bold">Officer / User</th>
                  <th className="py-2.5 font-bold">Rank & Dept</th>
                  <th className="py-2.5 font-bold">Vessel</th>
                  <th className="py-2.5 font-bold text-center">Total Requests</th>
                  <th className="py-2.5 font-bold text-center">Success / Fail</th>
                  <th className="py-2.5 font-bold">Success Rate</th>
                  <th className="py-2.5 font-bold">Last Active</th>
                  <th className="py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                {filteredUsers.map((u) => {
                  const rate = u.totalRequests > 0 ? Math.round((u.successfulRequests / u.totalRequests) * 100) : 100;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => openUserDetail(u.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openUserDetail(u.id);
                        else if (e.key === " ") {
                          e.preventDefault();
                          openUserDetail(u.id);
                        }
                      }}
                      tabIndex={0}
                      className="cursor-pointer hover:bg-amber-50/50 focus:bg-amber-50/50 focus:outline-none dark:hover:bg-stone-900/50"
                      title={`View per-user API breakdown for ${u.name}`}
                    >
                      <td className="py-3 font-bold text-stone-900 dark:text-stone-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUserDetail(u.id);
                          }}
                          className="flex items-center gap-2 rounded-xl text-left underline-offset-2 hover:underline focus:underline focus:outline-none"
                          aria-label={`View API usage detail for ${u.name}`}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-amber-50 dark:bg-red-700">
                            {u.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div>{u.name}</div>
                            <div className="font-mono text-[10px] opacity-50">{u.email}</div>
                          </div>
                        </button>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold">{u.rank}</span>
                        <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          {u.department.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-stone-600 dark:text-stone-400">{u.vessel}</td>
                      <td className="py-3 text-center font-mono font-black text-sm">
                        {u.totalRequests}
                      </td>
                      <td className="py-3 text-center font-mono text-[11px]">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {u.successfulRequests}
                        </span>
                        <span className="mx-1 opacity-40">/</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {u.failedRequests}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-[11px] text-stone-500 dark:text-stone-400">
                        {new Date(u.lastActiveAt).toLocaleString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-stone-500/10 text-stone-500"
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Department Category Breakdown & Model Diagnostics */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Category Distribution */}
          <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <h3 className="text-base font-black tracking-tight">AI Requests by Department Category</h3>
            <p className="mt-0.5 text-xs opacity-70">Distribution of store items scanned across departments</p>

            <div className="mt-4 grid gap-3">
              {[
                { label: "Spare Deck (Rigging, Tools, Safety)", key: "spare-deck", color: "bg-amber-500" },
                { label: "Spare Engine (Pipes, Valves, Spares)", key: "spare-engine", color: "bg-blue-500" },
                { label: "Galley & Provisions", key: "galley", color: "bg-emerald-500" },
                { label: "Stationery & Office", key: "stationery", color: "bg-purple-500" },
                { label: "Other Supplies", key: "other", color: "bg-stone-500" },
              ].map((cat) => {
                const count = metrics?.categoryBreakdown[cat.key] || 0;
                const total = Math.max(1, metrics?.totalProductsIdentified || 1);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat.key} className="text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{cat.label}</span>
                      <span className="font-mono">{count} items ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div className={`h-full ${cat.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Authentication & Processing Architecture */}
          <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
            <h3 className="text-base font-black tracking-tight">Google AI Authentication Architecture</h3>
            <p className="mt-0.5 text-xs opacity-70">Active protocol and security compliance</p>

            <div className="mt-3 grid gap-2.5 text-xs">
              <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 p-3 dark:bg-stone-900">
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Primary Neural Engine</strong>
                  <span className="text-[11px] opacity-70">Google Gemini 2.0 Flash (Multimodal Vision)</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 p-3 dark:bg-stone-900">
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Authentication Protocol</strong>
                  <span className="text-[11px] opacity-70">Google API Key header authentication (x-goog-api-key)</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 p-3 dark:bg-stone-900">
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Strict Error Enforcement</strong>
                  <span className="text-[11px] opacity-70">Random fallback products disabled; explicit failure reporting active</span>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  Strict Mode
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 p-3 dark:bg-stone-900">
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Catalog Context Sync</strong>
                  <span className="text-[11px] opacity-70">My List active catalog context included in all inference prompts</span>
                </div>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Synchronized
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: User Activity & Audit Stream */}
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-neutral-950">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Recent User Activity & API Request Log</h2>
              <p className="text-xs opacity-70">
                Live chronological audit trail of all camera captures and identification events.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1 rounded-full border border-stone-200 bg-stone-50 p-1 text-xs dark:border-stone-800 dark:bg-stone-900">
              <button
                onClick={() => setLogFilter("all")}
                className={`rounded-full px-3 py-1 font-bold ${
                  logFilter === "all" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70"
                }`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setLogFilter("success")}
                className={`rounded-full px-3 py-1 font-bold ${
                  logFilter === "success" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70"
                }`}
              >
                Success ({logs.filter((l) => l.status === "success").length})
              </button>
              <button
                onClick={() => setLogFilter("failed")}
                className={`rounded-full px-3 py-1 font-bold ${
                  logFilter === "failed" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70"
                }`}
              >
                Failed ({logs.filter((l) => l.status === "failed").length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-100 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th className="py-2.5 font-bold">Time</th>
                  <th className="py-2.5 font-bold">User / Officer</th>
                  <th className="py-2.5 font-bold">Vessel</th>
                  <th className="py-2.5 font-bold">Action / Result</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Latency</th>
                  <th className="py-2.5 font-bold">Auth Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-900/50">
                    <td className="py-3 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                      {new Date(log.timestamp).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => openUserDetail(log.userId)}
                        className="block rounded-lg text-left underline-offset-2 hover:underline focus:underline focus:outline-none"
                        aria-label={`View API usage detail for ${log.userName}`}
                        title={`View per-user API breakdown for ${log.userName}`}
                      >
                        <strong className="block text-stone-900 dark:text-stone-100">{log.userName}</strong>
                        <span className="text-[10px] opacity-60">{log.userRank}</span>
                      </button>
                    </td>
                    <td className="py-3 text-stone-600 dark:text-stone-400">{log.vessel}</td>
                    <td className="py-3">
                      {log.status === "success" ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-stone-900 px-1.5 py-0.5 font-mono text-[10px] text-amber-50 dark:bg-red-700">
                              {log.productId}
                            </span>
                            <span className="font-bold text-stone-800 dark:text-stone-200">
                              {log.productName}
                            </span>
                          </div>
                          {log.category && (
                            <span className="text-[10px] opacity-60">Category: {log.category}</span>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-md text-red-600 dark:text-red-400 font-medium">
                          ⚠️ {log.errorMessage || "Recognition failed"}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          log.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-stone-500">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3 text-[11px] opacity-70">
                      {log.authMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-user drilldown modal */}
        {selectedUserId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeUserDetail}
            role="dialog"
            aria-modal="true"
            aria-label="Per-user API usage detail"
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-200 bg-white p-5 shadow-xl dark:border-stone-800 dark:bg-neutral-950"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading || !userDetail ? (
                <div className="py-10 text-center text-sm opacity-70">
                  {detailLoading ? "Loading per-user API breakdown..." : "User detail unavailable."}
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-amber-50 dark:bg-red-700">
                        {userDetail.user.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="text-lg font-black tracking-tight">{userDetail.user.name}</h3>
                        <p className="font-mono text-[11px] opacity-60">{userDetail.user.email}</p>
                        <p className="mt-0.5 text-xs opacity-70">
                          {userDetail.user.rank} • {userDetail.user.vessel} •{" "}
                          {userDetail.user.department.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeUserDetail}
                      className="rounded-full border border-stone-300 px-3 py-1 text-xs font-bold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900"
                      aria-label="Close user detail"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid gap-2 text-[11px] sm:grid-cols-2">
                    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                      <span className="font-bold uppercase tracking-wide opacity-60">Status</span>
                      <div className="mt-1 font-bold">{userDetail.user.status.toUpperCase()}</div>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                      <span className="font-bold uppercase tracking-wide opacity-60">Last active</span>
                      <div className="mt-1 font-mono">
                        {new Date(userDetail.user.lastActiveAt).toLocaleString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                      <span className="font-bold uppercase tracking-wide opacity-60">Created</span>
                      <div className="mt-1 font-mono">
                        {new Date(userDetail.user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-3 dark:bg-stone-900">
                      <span className="font-bold uppercase tracking-wide opacity-60">Totals</span>
                      <div className="mt-1 font-mono font-bold">
                        {userDetail.stats.total} total •{" "}
                        <span className="text-emerald-600">{userDetail.stats.success} success</span> •{" "}
                        <span className="text-red-600">{userDetail.stats.failed} failed</span> •{" "}
                        {userDetail.stats.successRate}% • {userDetail.stats.avgLatencyMs}ms avg
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-black">Per-API-service usage (by endpoint)</h4>
                      {Object.keys(userDetail.stats.byEndpoint).length === 0 ? (
                        <p className="mt-1 text-xs opacity-60">
                          No endpoint breakdown yet — showing seeded totals only.
                        </p>
                      ) : (
                        <table className="mt-2 w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-amber-100 text-stone-500 dark:border-stone-800">
                              <th className="py-1.5 font-bold">Endpoint</th>
                              <th className="py-1.5 text-center font-bold">Count</th>
                              <th className="py-1.5 text-center font-bold">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                            {Object.entries(userDetail.stats.byEndpoint).map(([endpoint, b]) => (
                              <tr key={endpoint}>
                                <td className="py-1.5 font-mono text-[11px]">{endpoint}</td>
                                <td className="py-1.5 text-center font-mono">
                                  {b.total} (<span className="text-emerald-600">{b.success}</span>/
                                  <span className="text-red-600">{b.failed}</span>)
                                </td>
                                <td className="py-1.5 text-center font-mono font-bold">{b.successRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black">Per-API-service usage (by model)</h4>
                      {Object.keys(userDetail.stats.byModel).length === 0 ? (
                        <p className="mt-1 text-xs opacity-60">
                          No model breakdown yet — showing seeded totals only.
                        </p>
                      ) : (
                        <table className="mt-2 w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-amber-100 text-stone-500 dark:border-stone-800">
                              <th className="py-1.5 font-bold">Model</th>
                              <th className="py-1.5 text-center font-bold">Count</th>
                              <th className="py-1.5 text-center font-bold">Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                            {Object.entries(userDetail.stats.byModel).map(([model, b]) => (
                              <tr key={model}>
                                <td className="py-1.5 font-mono text-[11px]">{model}</td>
                                <td className="py-1.5 text-center font-mono">
                                  {b.total} (<span className="text-emerald-600">{b.success}</span>/
                                  <span className="text-red-600">{b.failed}</span>)
                                </td>
                                <td className="py-1.5 text-center font-mono font-bold">{b.successRate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {Object.keys(userDetail.stats.byCategory).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {Object.entries(userDetail.stats.byCategory).map(([cat, count]) => (
                        <span
                          key={cat}
                          className="rounded-full bg-stone-100 px-2.5 py-1 font-mono font-bold dark:bg-stone-800"
                        >
                          {cat}: {count}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-black">
                      Account statement — chronological request list ({userDetail.logs.length})
                    </h4>
                    {userDetail.logs.length === 0 ? (
                      <p className="mt-1 text-xs opacity-60">
                        No individual request logs recorded for this user yet.
                      </p>
                    ) : (
                      <div className="mt-2 max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-amber-100 text-stone-500 dark:border-stone-800">
                              <th className="py-1.5 font-bold">Time</th>
                              <th className="py-1.5 font-bold">Endpoint / Model</th>
                              <th className="py-1.5 font-bold">Result</th>
                              <th className="py-1.5 font-bold">Status</th>
                              <th className="py-1.5 font-bold">Latency</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-900">
                            {userDetail.logs.map((log) => (
                              <tr key={log.id}>
                                <td className="py-1.5 font-mono text-[11px] opacity-70">
                                  {new Date(log.timestamp).toLocaleString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </td>
                                <td className="py-1.5 font-mono text-[11px]">
                                  {log.endpoint}
                                  <span className="block opacity-60">{log.model}</span>
                                </td>
                                <td className="py-1.5 text-[11px]">
                                  {log.status === "success" ? (
                                    <span className="font-bold">
                                      {log.productId ? `${log.productId} — ` : ""}
                                      {log.productName || "Identified"}
                                    </span>
                                  ) : (
                                    <span className="text-red-600 dark:text-red-400">
                                      {log.errorMessage || "Recognition failed"}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      log.status === "success"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-red-500/10 text-red-600"
                                    }`}
                                  >
                                    {log.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-1.5 font-mono text-[11px]">{log.latencyMs}ms</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Link back to Store Requests */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs dark:border-stone-800 dark:bg-stone-900">
          <div>
            <strong>Need to test or make new store requests?</strong>
            <p className="opacity-70">Head over to the Store Requests page to scan items or manage lists.</p>
          </div>
          <Link
            href="/requests"
            className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 hover:bg-stone-800 dark:bg-red-700 dark:text-white"
          >
            Open Store Requests →
          </Link>
        </div>
      </div>
    </div>
  );
}
