import { db } from "./db";

export const RET_KEY = "oa-log-retention";
export const INT_KEY = "oa-log-interval";

export const RETENTIONS = [
  { id: "24h", label: "24 hours", ms: 24 * 3600000 },
  { id: "48h", label: "48 hours", ms: 48 * 3600000 },
  { id: "1w", label: "1 week", ms: 7 * 24 * 3600000 },
];

export const INTERVALS = [
  { id: "30m", label: "30 min", ms: 30 * 60000 },
  { id: "1h", label: "1 hour", ms: 3600000 },
  { id: "2h", label: "2 hours", ms: 2 * 3600000 },
  { id: "4h", label: "4 hours", ms: 4 * 3600000 },
];

// Hourly deck log: auto position + wind/sea/visibility from the same
// sources as the tracker, manual compass/temperatures/variation.
export interface LogSnapshot {
  lat: number | null;
  lon: number | null;
  tz: string;
  windKn: string;
  windDir: string;
  waveM: string;
  visKm: string;
}

export async function snapshotPosition(): Promise<LogSnapshot> {
  let lat: number | null = null, lon: number | null = null, tz = "";
  try {
    const raw = localStorage.getItem("oa-pos");
    if (raw) {
      const p = JSON.parse(raw);
      lat = p.lat;
      lon = p.lon;
    }
  } catch {
    /* ignore */
  }
  let windKn = "", windDir = "", waveM = "", visKm = "";
  if (lat !== null && lon !== null) {
    try {
      const [m, w] = await Promise.all([
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction&timezone=auto`).then((r) => {
          if (!r.ok) throw 0;
          return r.json();
        }),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&hourly=visibility&forecast_days=1&wind_speed_unit=kn&timezone=auto`).then((r) => {
          if (!r.ok) throw 0;
          return r.json();
        }),
      ]);
      windKn = String(Math.round(w.current.wind_speed_10m));
      windDir = String(Math.round(w.current.wind_direction_10m));
      waveM = String(m.current.wave_height);
      tz = w.timezone_abbreviation ?? "";
      try {
        const i = (w.hourly.time as string[]).findIndex((t) => t.slice(0, 13) === (w.current.time as string).slice(0, 13));
        if (i >= 0) visKm = String(Math.round(w.hourly.visibility[i] / 100) / 10);
      } catch {
        /* ignore */
      }
    } catch {
      /* offline — manual fields still work */
    }
  }
  return { lat, lon, tz, windKn, windDir, waveM, visKm };
}

// Prune entries older than the retention window
export async function pruneLog(cid: string, retId: string) {
  const r = RETENTIONS.find((x) => x.id === retId) ?? RETENTIONS[1];
  const cutoff = new Date(Date.now() - r.ms).toISOString();
  const old = await db.logEntries.where("contractId").equals(cid).toArray();
  const ids = old.filter((e) => e.time < cutoff).map((e) => e.id);
  if (ids.length) await db.logEntries.bulkDelete(ids);
}
