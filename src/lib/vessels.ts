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
