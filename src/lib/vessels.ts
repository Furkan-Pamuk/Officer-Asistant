// Normalized vessel schema — the ONLY shape the frontend ever sees.
// Unknown fields are null, never fabricated.

export interface VesselPosition {
  lat: number | null;
  lon: number | null;
  sog: number | null;
  cog: number | null;
  heading: number | null;
  status: string | null;
  destination: string | null;
  eta: string | null;
  timestamp: string | null;
  source: string;
}

export interface VesselProfile {
  imo: string;
  mmsi: string | null;
  name: string | null;
  callSign: string | null;
  flag: string | null;
  type: string | null;
  dwt: number | null;
  gt: number | null;
  loa: number | null;
  breadth: number | null;
  yearBuilt: number | null;
}

export type Availability = "live" | "cached" | "unavailable" | "not-found";

export interface VesselResult {
  profile: VesselProfile;
  position: VesselPosition | null;
  cached: boolean;
  availability: Availability;
  provider: string;
  message?: string;
  fetchedAt: string;
}

export function blankProfile(imo: string): VesselProfile {
  return { imo, mmsi: null, name: null, callSign: null, flag: null, type: null, dwt: null, gt: null, loa: null, breadth: null, yearBuilt: null };
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return isFinite(n) ? n : null;
};

/** Normalize a DataDocked location response — the only place its shape is known. */
export function normalizeDataDocked(imo: string, d: Record<string, unknown>): VesselResult {
  const now = new Date().toISOString();
  return {
    profile: {
      ...blankProfile(imo),
      mmsi: typeof d.mmsi === "string" ? d.mmsi : null,
      name: typeof d.name === "string" ? d.name : null,
    },
    position: {
      lat: num(d.latitude),
      lon: num(d.longitude),
      sog: num(d.speed),
      cog: num(d.course),
      heading: null,
      status: typeof d.navigationalStatus === "string" ? d.navigationalStatus : null,
      destination: typeof d.destination === "string" ? d.destination : null,
      eta: null,
      timestamp: typeof d.updateTime === "string" ? d.updateTime : typeof d.positionReceived === "string" ? d.positionReceived : null,
      source: "DataDocked",
    },
    cached: false,
    availability: "live",
    provider: "datadocked",
    fetchedAt: now,
  };
}

/** Development mock — clearly fake data, never used in production builds. */
export function mockResult(imo: string): VesselResult {
  const now = new Date().toISOString();
  return {
    profile: { ...blankProfile(imo), mmsi: "MOCK", name: "MOCK VESSEL (dev only)", flag: "XX", type: "Tanker" },
    position: { lat: 41.0, lon: 29.0, sog: 10, cog: 90, heading: 90, status: "Underway (mock)", destination: "MOCKPORT", eta: null, timestamp: now, source: "Mock" },
    cached: false,
    availability: "live",
    provider: "mock",
    fetchedAt: now,
  };
}

// ---- Open Waters AIS (free tier) ----

export interface VesselCandidate {
  mmsi: string;
  name: string | null;
  seen: string | null;
}

const AIS_NAV_STATUS: Record<number, string> = {
  0: "Underway",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuvrability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Fishing",
  8: "Sailing",
};

export function aisStatusText(n: number | null): string | null {
  if (n == null || !isFinite(n)) return null;
  return AIS_NAV_STATUS[n] ?? `Status ${n}`;
}

/** Normalize an Open Waters GeoJSON vessel feature (search or detail). */
export function normalizeOpenWaters(mmsi: string, f: Record<string, unknown>): VesselResult {
  const now = new Date().toISOString();
  const p = (f?.properties as Record<string, unknown> | undefined) ?? {};
  const coords: unknown = (f as { geometry?: { coordinates?: unknown } })?.geometry?.coordinates;
  const lon = Array.isArray(coords) ? num(coords[0]) : null;
  const lat = Array.isArray(coords) ? num(coords[1]) : null;
  const part = (p.particulars as Record<string, unknown> | undefined) ?? {};
  return {
    profile: {
      ...blankProfile(typeof p.imo === "number" ? String(p.imo) : ""),
      mmsi,
      name: typeof p.name === "string" ? p.name : null,
      callSign: typeof p.callsign === "string" ? p.callsign : null,
      flag: typeof p.flag === "string" ? p.flag : null,
      type: typeof part.ship_type === "string" ? part.ship_type : null,
    },
    position: {
      lat,
      lon,
      sog: num(p.sog),
      cog: num(p.cog),
      heading: num(p.heading),
      status: aisStatusText(typeof p.nav_status === "number" ? p.nav_status : null),
      destination: typeof p.destination === "string" ? p.destination : null,
      eta: typeof p.eta === "string" ? p.eta : null,
      timestamp: typeof p.seen === "string" ? p.seen : null,
      source: "Open Waters AIS",
    },
    cached: false,
    availability: "live",
    provider: "openwaters",
    fetchedAt: now,
  };
}
