import { db, uid } from "./db";
import { PORTS, type Port } from "./ports";
import type { Voyage } from "./types";

const RADIUS_KM = 25;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLa = ((lat2 - lat1) * Math.PI) / 180;
  const dLo = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestPort(lat: number, lon: number): Port | null {
  let best: Port | null = null;
  let bestD = RADIUS_KM;
  for (const p of PORTS) {
    const d = haversine(lat, lon, p.lat, p.lon);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

function curKey(contractId: string) {
  return `oa-portlog-current-${contractId}`;
}

export function getCurrentPortCode(contractId: string): string | null {
  try {
    return localStorage.getItem(curKey(contractId));
  } catch {
    return null;
  }
}

// Run one detection step from a position. Returns a human message of what changed.
export async function detectStep(contractId: string, lat: number, lon: number): Promise<string> {
  const now = new Date().toISOString();
  const near = nearestPort(lat, lon);
  const cur = getCurrentPortCode(contractId);
  const voyages = await db.voyages.where("contractId").equals(contractId).toArray();
  const open = voyages.find((v) => v.status === "open") ?? null;

  const setCur = (code: string | null) => {
    try {
      if (code) localStorage.setItem(curKey(contractId), code);
      else localStorage.removeItem(curKey(contractId));
    } catch { /* ignore */ }
  };
  const nextNo = voyages.reduce((m, v) => Math.max(m, v.no), 0) + 1;

  if (near && near.code === cur) return `Still at ${near.name} — no change.`;

  if (near && (!cur || cur !== near.code)) {
    // arrived at near (from cur port or first sighting)
    if (open && open.fromCode !== near.code) {
      await db.voyages.update(open.id, { toPort: near.name, toCode: near.code, toTime: now, status: "closed" });
      setCur(near.code);
      return `Voyage ${open.no} closed: ${open.fromPort} → ${near.name}.`;
    }
    setCur(near.code);
    return `Now at ${near.name} (${near.code}). Voyage starts on departure.`;
  }

  if (!near && cur) {
    // departed cur into open sea → open a voyage
    const from = PORTS.find((p) => p.code === cur);
    if (open) {
      setCur(null);
      return "Left port waters — open voyage continues.";
    }
    await db.voyages.add({
      id: uid("voy"), contractId, no: nextNo,
      fromPort: from?.name ?? cur, fromCode: cur, fromTime: now,
      toPort: "", toCode: "", toTime: "", status: "open",
    });
    setCur(null);
    return `Voyage ${nextNo} opened: departed ${from?.name ?? cur}.`;
  }

  return "At sea — no port in range.";
}
