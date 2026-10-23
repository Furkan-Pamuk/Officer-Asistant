import { PORTS } from "./ports";
import { haversineNm, isWater, isWaterSegment, unwrapTrack, wrapLon, type RoutePlan, type TrackPoint } from "./route";

export function restoreEditedTrack(value: unknown, from: string, to: string): TrackPoint[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 2000) return null;
  if (!value.every((point) => point && typeof point.id === "string" && typeof point.label === "string" &&
    ["port", "way", "custom"].includes(point.kind) && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 &&
    Number.isFinite(point.lon) && Math.abs(point.lon) <= 180)) return null;
  if (value[0].id !== `p:${from}` || value.at(-1).id !== `p:${to}` || value[0].kind !== "port" || value.at(-1).kind !== "port") return null;
  if (value.slice(1, -1).some((point) => point.kind === "port")) return null;
  return value.map(({ id, label, kind, lat, lon }) => ({ id, label, kind, lat, lon }));
}

export function planEditedTrack(fromCode: string, toCode: string, points: TrackPoint[]): RoutePlan | null {
  const from = PORTS.find((p) => p.code === fromCode), to = PORTS.find((p) => p.code === toCode);
  const track = restoreEditedTrack(points, fromCode, toCode);
  if (!from || !to || !track) return null;
  // Port coordinates remain authoritative even when loading a saved edit.
  track[0] = { ...track[0], lat: from.lat, lon: from.lon, label: from.name };
  track[track.length - 1] = { ...track[track.length - 1], lat: to.lat, lon: to.lon, label: to.name };
  const legs = track.slice(1).map((b, i) => {
    const a = track[i];
    return { from: a.label, to: b.label, fromLat: a.lat, fromLon: a.lon, toLat: b.lat, toLon: b.lon, nm: haversineNm(a.lat, a.lon, b.lat, b.lon) };
  });
  return { from, to, points: track, legs, totalNm: legs.reduce((sum, leg) => sum + leg.nm, 0), via: track.slice(1, -1).map((p) => p.label) };
}

function legKey(a: TrackPoint, b: TrackPoint): string {
  return `${a.lat},${a.lon}|${b.lat},${b.lon}`;
}

function waterLeg(a: TrackPoint, b: TrackPoint): boolean {
  if (isWaterSegment(a.lat, a.lon, b.lat, b.lon)) return true;
  // The same short harbour allowance used by automatic approaches. After
  // leaving the simplified harbour shoreline the new leg must stay at sea.
  const port = a.kind === "port" ? a : b.kind === "port" ? b : null;
  const sea = port === a ? b : a;
  if (!port || !isWater(sea.lat, sea.lon) || isWater(port.lat, port.lon)) return false;
  const nm = haversineNm(port.lat, port.lon, sea.lat, sea.lon);
  const steps = Math.max(1, Math.ceil(nm));
  let endLon = sea.lon;
  while (endLon - port.lon > 180) endLon -= 360;
  while (endLon - port.lon < -180) endLon += 360;
  for (let i = 1; i <= steps && nm * i / steps <= 12; i++) {
    const lat = port.lat + (sea.lat - port.lat) * i / steps;
    const lon = wrapLon(port.lon + (endLon - port.lon) * i / steps);
    if (isWater(lat, lon)) return isWaterSegment(lat, lon, sea.lat, sea.lon);
  }
  return false;
}

export function canEditTrack(before: TrackPoint[], after: TrackPoint[]): boolean {
  if (after.length < 2 || after.length > 2000 || after[0].id !== before[0]?.id || after.at(-1)?.id !== before.at(-1)?.id) return false;
  const oldPoints = new Set(before.map((p) => `${p.lat},${p.lon}`));
  for (const p of after.slice(1, -1)) {
    if (!Number.isFinite(p.lat) || Math.abs(p.lat) > 90 || !Number.isFinite(p.lon) || Math.abs(p.lon) > 180) return false;
    if (!oldPoints.has(`${p.lat},${p.lon}`) && !isWater(p.lat, p.lon)) return false;
  }
  const oldLegs = new Set(before.slice(1).map((p, i) => legKey(before[i], p)));
  // Existing curated canals/harbour approaches are retained; only changed
  // legs are checked, so an unrelated edit cannot erase the original route.
  return after.slice(1).every((p, i) => oldLegs.has(legKey(after[i], p)) || waterLeg(after[i], p));
}

export function nearestTrackLeg(points: TrackPoint[], lat: number, lon: number): number {
  const track = unwrapTrack(points);
  let best = Infinity, index = 0;
  const cos = Math.max(0.01, Math.cos(lat * Math.PI / 180));
  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i], b = track[i + 1];
    let x = lon;
    while (x - (a.lon + b.lon) / 2 > 180) x -= 360;
    while (x - (a.lon + b.lon) / 2 < -180) x += 360;
    const dx = (b.lon - a.lon) * cos, dy = b.lat - a.lat;
    const length = dx * dx + dy * dy;
    const ratio = length ? Math.max(0, Math.min(1, ((x - a.lon) * cos * dx + (lat - a.lat) * dy) / length)) : 0;
    const distance = ((a.lon - x) * cos + ratio * dx) ** 2 + (a.lat - lat + ratio * dy) ** 2;
    if (distance < best) { best = distance; index = i; }
  }
  return index;
}
