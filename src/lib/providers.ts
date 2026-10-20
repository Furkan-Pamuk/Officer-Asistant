import { normalizeDataDocked, mockResult, type VesselResult } from "@/lib/vessels";
import { validateIMO } from "@/lib/imo";

// Server-side provider manager. Frontend never touches provider responses.
// Monthly cap guards the paid adapter; no silent fallback to paid sources.

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const usage = new Map<string, number>(); // resets on restart — documented limit

export function monthlyCap(): number {
  const v = Number(process.env.PAID_API_MAX_MONTHLY_REQUESTS ?? 20);
  return isFinite(v) && v >= 0 ? Math.floor(v) : 20;
}

export function monthlyUsage(): number {
  return usage.get(monthKey()) ?? 0;
}

export type VesselError =
  | { kind: "invalid"; message: string }
  | { kind: "not-found"; message: string }
  | { kind: "unavailable"; message: string }
  | { kind: "rate-limited"; message: string }
  | { kind: "credits"; message: string };

export async function lookupVessel(rawImo: string): Promise<{ ok: true; data: VesselResult } | { ok: false; error: VesselError }> {
  const v = validateIMO(rawImo);
  if (!v.ok) return { ok: false, error: { kind: "invalid", message: v.error! } };

  const mode = (process.env.VESSEL_PROVIDER_MODE ?? "free").toLowerCase();
  if (mode === "off") {
    return { ok: false, error: { kind: "unavailable", message: "Vessel lookup is disabled by configuration." } };
  }
  if (mode === "mock") {
    return { ok: true, data: mockResult(v.imo) };
  }

  const key = process.env.DATADOCKED_API_KEY;
  if (!key) {
    return { ok: false, error: { kind: "unavailable", message: "No authorized live provider configured. Technical profile unavailable — position cannot be resolved." } };
  }
  if (monthlyUsage() >= monthlyCap()) {
    return { ok: false, error: { kind: "rate-limited", message: `Monthly lookup budget reached (${monthlyCap()}). Cached positions remain visible.` } };
  }

  try {
    const r = await fetch(`https://datadocked.com/api/vessels_operations/get-vessel-location?imo_or_mmsi=${v.imo}`, {
      headers: { accept: "application/json", "x-api-key": key },
      cache: "no-store",
    });
    const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (r.status === 404) {
      return { ok: false, error: { kind: "not-found", message: "Vessel not found with this IMO." } };
    }
    if (r.status === 429) {
      return { ok: false, error: { kind: "rate-limited", message: "Provider rate limit reached — wait a minute and retry." } };
    }
    if (r.status === 403) {
      return { ok: false, error: { kind: "credits", message: "Provider credits exhausted. Cached positions remain visible." } };
    }
    if (!r.ok) {
      return { ok: false, error: { kind: "unavailable", message: "Provider temporarily unavailable." } };
    }
    usage.set(monthKey(), monthlyUsage() + 1);
    return { ok: true, data: normalizeDataDocked(v.imo, data) };
  } catch {
    return { ok: false, error: { kind: "unavailable", message: "AIS provider unreachable." } };
  }
}

// Legacy shape for the contract tracker (same data, old field names kept).
export function legacyShape(data: VesselResult) {
  const p = data.position;
  return {
    name: data.profile.name,
    imo: data.profile.imo,
    mmsi: data.profile.mmsi,
    latitude: p?.lat !== null && p?.lat !== undefined ? String(p.lat) : "",
    longitude: p?.lon !== null && p?.lon !== undefined ? String(p.lon) : "",
    speed: p?.sog !== null && p?.sog !== undefined ? String(p.sog) : "",
    course: p?.cog !== null && p?.cog !== undefined ? String(p.cog) : "",
    destination: p?.destination ?? "",
    navigationalStatus: p?.status ?? "",
    updateTime: p?.timestamp ?? "",
    positionReceived: p?.timestamp ?? "",
    availability: data.availability,
    provider: data.provider,
  };
}
