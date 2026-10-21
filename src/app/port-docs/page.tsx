"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, exportJSON } from "@/lib/db";
import { useActiveContract } from "@/hooks/useActiveContract";
import {
  PORT_DOC_MODULES,
  blankData,
  getPortDoc,
  prefillFromContract,
  savePortDoc,
  fillModuleFromShipData,
  pushShipData,
  crewRowsFor,
  voyageRowsFor,
  type PortDocModule,
} from "@/lib/portdocs";
import type { PortDocData } from "@/lib/types";

function modById(id: string | null): PortDocModule {
  return PORT_DOC_MODULES.find((m) => m.id === id) ?? PORT_DOC_MODULES[0];
}

function DocsInner() {
  const params = useSearchParams();
  const { contract } = useActiveContract();
  const [modId, setModId] = useState<string>("ship-data");
  const [data, setData] = useState<PortDocData | null>(null);

  useEffect(() => {
    const q = params.get("module");
    if (q && PORT_DOC_MODULES.some((m) => m.id === q)) setModId(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mod = modById(modId);
  const contractId = contract?.id ?? null;
  const [shipHead, setShipHead] = useState<{ ship: string; port: string; date: string } | null>(null);

  useEffect(() => {
    if (!contractId) {
      setData(null);
      return;
    }
    let live = true;
    (async () => {
      const row = await getPortDoc(contractId, mod.id);
      let d: PortDocData;
      if (row) {
        try {
          d = JSON.parse(row.data) as PortDocData;
        } catch {
          d = blankData(mod);
          if (contract) Object.assign(d.fields, prefillFromContract(mod, contract as unknown as Record<string, unknown>));
        }
      } else {
        d = blankData(mod);
        if (contract) Object.assign(d.fields, prefillFromContract(mod, contract as unknown as Record<string, unknown>));
      }
      // Ship Data is the master copy: fill this module's blank fields from it.
      const merged = await fillModuleFromShipData(contractId, mod.id, d.fields);
      if (!live) return;
      if (merged.changed) {
        d = { ...d, fields: merged.fields };
        savePortDoc(contractId, mod.id, d).catch(() => {});
      }
      setData(d);
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, modId]);

  useEffect(() => {
    if (!contractId) {
      setData(null);
      setShipHead(null);
      return;
    }
    getPortDoc(contractId, "ship-data").then((row) => {
      if (!row) {
        setShipHead(null);
        return;
      }
      try {
        const d = JSON.parse(row.data) as PortDocData;
        setShipHead({ ship: d.fields.shipName ?? "", port: d.fields.arrPort ?? "", date: d.fields.arrDate ?? "" });
      } catch {
        setShipHead(null);
      }
    });
  }, [contractId]);

  function update(next: PortDocData) {
    setData(next);
    if (!contractId) return;
    savePortDoc(contractId, mod.id, next);
    if (mod.id === "ship-data") {
      setShipHead({ ship: next.fields.shipName ?? "", port: next.fields.arrPort ?? "", date: next.fields.arrDate ?? "" });
      // Master copy changed → push into the other papers (blank fields only).
      pushShipData(contractId, next.fields).catch(() => {});
    }
    // Arrival feeds departure while departure is still blank — afterwards
    // departure lives its own life (manual edits are never overwritten).
    if (mod.id === "crew-arrival") {
      const cid = contractId;
      const rows = next.rows.map((r) => ({ ...r }));
      const blank = (r: Record<string, string>) => Object.values(r).every((v) => !String(v ?? "").trim());
      getPortDoc(cid, "crew-departure").then((dep) => {
        let depRows: Record<string, string>[] = [];
        if (dep) {
          try {
            depRows = (JSON.parse(dep.data) as PortDocData).rows ?? [];
          } catch {
            /* ignore */
          }
        }
        if (rows.length > 0 && (depRows.length === 0 || depRows.every(blank))) {
          savePortDoc(cid, "crew-departure", { fields: {}, rows });
        }
      });
    }
  }

  async function syncFromArrival() {
    if (!contractId) return;
    const arr = await getPortDoc(contractId, "crew-arrival");
    if (!arr) {
      alert("Arrival list is empty — fill it first.");
      return;
    }
    let rows: Record<string, string>[] = [];
    try {
      rows = (JSON.parse(arr.data) as PortDocData).rows ?? [];
    } catch {
      /* ignore */
    }
    if (!rows.length) {
      alert("Arrival list is empty — fill it first.");
      return;
    }
    if (!confirm("Replace the departure list with the arrival list? Manual edits will be lost.")) return;
    const copy = rows.map((r) => ({ ...r }));
    await savePortDoc(contractId, "crew-departure", { fields: {}, rows: copy });
    if (mod.id === "crew-departure") setData({ fields: {}, rows: copy });
  }

  function setField(key: string, v: string) {
    if (!data) return;
    update({ ...data, fields: { ...data.fields, [key]: v } });
  }

  async function refillFromShip() {
    if (!data || !contractId || mod.id === "ship-data") return;
    const merged = await fillModuleFromShipData(contractId, mod.id, data.fields);
    if (merged.changed) {
      update({ ...data, fields: merged.fields });
    } else {
      alert("Nothing blank to fill — every field already has a value.");
    }
  }

  function setCell(i: number, key: string, v: string) {
    if (!data) return;
    const rows = data.rows.map((r, ix) => (ix === i ? { ...r, [key]: v } : r));
    update({ ...data, rows });
  }

  function addRow() {
    if (!data || !mod.columns) return;
    const blank: Record<string, string> = {};
    for (const c of mod.columns) blank[c.key] = "";
    update({ ...data, rows: [...data.rows, blank] });
  }

  function delRow(i: number) {
    if (!data) return;
    update({ ...data, rows: data.rows.filter((_, ix) => ix !== i) });
  }

  async function importCrew() {
    if (!data || !contractId) return;
    const crew = await crewRowsFor(contractId);
    if (!crew.length) {
      alert("No crew in Crew Accounts yet — add them there first, or type rows manually.");
      return;
    }
    const have = new Set(data.rows.map((r) => (r.name || "").toLowerCase()).filter(Boolean));
    const extra = crew.filter((c) => c.name && !have.has(c.name.toLowerCase()));
    if (!extra.length) {
      alert("Crew already imported.");
      return;
    }
    const snap = await db.crewRows.where("contractId").equals(contractId).toArray();
    const byName = new Map(snap.map((r) => [r.name.toLowerCase(), r]));
    const rows = [...data.rows];
    for (const c of extra) {
      const src = byName.get(c.name.toLowerCase());
      const row: Record<string, string> = { name: c.name, rank: c.rank };
      if (mod.id === "cash-advance" && src) {
        row.usd = src.advUSD ? String(src.advUSD) : "";
        row.eur = src.advEUR ? String(src.advEUR) : "";
      }
      rows.push(row);
    }
    update({ ...data, rows });
  }

  async function importVoyages() {
    if (!data || !contractId) return;
    const legs = await voyageRowsFor(contractId);
    if (!legs.length) {
      alert("No closed voyages in Port Log yet.");
      return;
    }
    const have = new Set(data.rows.map((r) => `${r.port}__${r.arrDate}__${r.depDate}`));
    const extra = legs.filter((r) => !have.has(`${r.port}__${r.arrDate}__${r.depDate}`));
    if (!extra.length) {
      alert("Voyages already imported.");
      return;
    }
    update({ ...data, rows: [...data.rows, ...extra] });
  }

  function docText(d: PortDocData, mod: PortDocModule) {
    const lines: string[] = [];
    if (mod.kind === "form" && mod.fields) {
      for (const f of mod.fields) {
        const v = d.fields[f.key] ?? "";
        if (v) lines.push(`${f.label}: ${v}`);
      }
    } else if (mod.columns) {
      for (const r of d.rows) {
        lines.push(mod.columns.map((c) => r[c.key] ?? "").filter(Boolean).join(" | "));
      }
    }
    return lines.filter(Boolean).join("\n");
  }

  async function share() {
    if (!data) return;
    const text = `🛃 ${mod.label}\n${contract?.shipName ?? ""}\n${docText(data, mod)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: mod.label, text });
        return;
      }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert("Document copied — paste it anywhere.");
      } catch {
        alert("Sharing not available here.");
      }
    }
  }

  function csv() {
    if (!data) return;
    const lines: string[] = [`# ${mod.label} — ${contract?.shipName ?? ""}`];
    if (mod.kind === "form" && mod.fields) {
      lines.push("field,value");
      for (const f of mod.fields) lines.push(`"${f.label}","${(data.fields[f.key] ?? "").replace(/"/g, "")}"`);
    } else if (mod.columns) {
      lines.push(mod.columns.map((c) => `"${c.label}"`).join(","));
      for (const r of data.rows) lines.push(mod.columns!.map((c) => `"${(r[c.key] ?? "").replace(/"/g, "")}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `portdocs-${mod.id}.csv`;
    a.click();
  }

  if (!contract) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">🛃 Port Documents</h1>
        <p className="text-sm">Select a contract first — port papers are kept per vessel.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">🛃 Port Documents</h1>
          <p className="text-sm font-medium opacity-70">Arrival & departure papers per vessel — saved automatically as you type.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={csv} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">CSV</button>
          <button
            onClick={async () => {
              const all = await db.portdocs.where("contractId").equals(contract!.id).toArray();
              const known = new Set(PORT_DOC_MODULES.map((m) => m.id));
              exportJSON(`port-docs-${contract!.id}.json`, { docs: all.filter((d) => known.has(d.module)) });
            }}
            className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black"
          >
            Export
          </button>
          <button onClick={share} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">📤 Share</button>
          <button onClick={() => window.print()} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">🖨️ Print</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PORT_DOC_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setModId(m.id)}
            title={m.hint}
            className={`rounded-full px-3 py-1.5 text-sm font-bold ${modId === m.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border bg-white dark:bg-black"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {shipHead && (shipHead.ship || shipHead.port || shipHead.date) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold dark:border-red-950 dark:bg-neutral-950">
          {shipHead.ship && <span>🚢 {shipHead.ship}</span>}
          {shipHead.port && <span>⚓ {shipHead.port}</span>}
          {shipHead.date && <span>📅 {shipHead.date}</span>}
        </div>
      )}

      {!data ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : mod.kind === "form" ? (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">{mod.label} <span className="font-normal opacity-60">• {mod.hint}</span></h2>
            {mod.id !== "ship-data" && (
              <button onClick={refillFromShip} title="Copy blank fields from Ship Data" className="rounded-full border px-3 py-1 text-xs font-bold print:hidden">⚡ Fill from Ship Data</button>
            )}
          </div>
          {mod.id === "ship-data" ? (
            <p className="mt-1 text-xs opacity-60">🚢 Master copy — values typed here auto-fill the other papers (blank fields only; your edits are never overwritten).</p>
          ) : (
            <p className="mt-1 text-xs opacity-60">Blank fields auto-fill from 🚢 Ship Data when this paper opens.</p>
          )}
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {(mod.fields ?? []).map((f) => (
              <label key={f.key} className="grid gap-1 text-sm">
                <span className="text-xs font-bold opacity-70">{f.label}</span>
                <input
                  value={data.fields[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="rounded-xl border px-3 py-2"
                />
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">{mod.label} <span className="font-normal opacity-60">• {mod.hint} ({data.rows.length})</span></h2>
            <div className="flex gap-2 print:hidden">
              {mod.importCrew && (
                <button onClick={importCrew} className="rounded-full border px-3 py-1 text-xs font-bold">👥 Import crew</button>
              )}
              {mod.id === "crew-departure" && (
                <button onClick={syncFromArrival} className="rounded-full border px-3 py-1 text-xs font-bold">🔄 Sync from Arrival</button>
              )}
              {mod.importVoyages && (
                <button onClick={importVoyages} className="rounded-full border px-3 py-1 text-xs font-bold">🗺️ Import voyages</button>
              )}
              <button onClick={addRow} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">+ Row</button>
            </div>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider opacity-60">
                  {(mod.columns ?? []).map((c) => (
                    <th key={c.key} className="px-2 py-1">{c.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={i} className="border-t border-amber-100 dark:border-red-950">
                    {(mod.columns ?? []).map((c) => (
                      <td key={c.key} className="px-1 py-1">
                        <input
                          value={r[c.key] ?? ""}
                          onChange={(e) => setCell(i, c.key, e.target.value)}
                          className="w-full rounded-lg border bg-transparent px-2 py-1"
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1 print:hidden">
                      <button onClick={() => delRow(i)} title="Delete row" className="rounded-full border px-2 py-0.5 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr><td className="p-3 text-sm opacity-70">Empty — import or add rows above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortDocsPage() {
  return (
    <Suspense fallback={<p>Loading port documents…</p>}>
      <DocsInner />
    </Suspense>
  );
}
