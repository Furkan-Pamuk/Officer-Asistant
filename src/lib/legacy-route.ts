import { PORTS, type Port } from "./ports";
import { CHOKEPOINTS, DIRECTED_EDGES, EDGES, PORT_GATEWAYS, WAYPOINTS } from "./route-data";
import { LAND_RINGS } from "./routing-land";

export interface RouteLeg {
  from: string;
  to: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  nm: number;
  via?: string;
}

export interface RoutePlan {
  from: Port;
  to: Port;
  legs: RouteLeg[];
  totalNm: number;
  via: string[];
  points: TrackPoint[];
}

export function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

interface GNode {
  id: string;
  label: string;
  lat: number;
  lon: number;
}

export interface TrackPoint {
  lat: number;
  lon: number;
  kind: "port" | "way" | "custom";
  id: string;
  label: string;
}

export interface ExtraNode {
  id: string;
  label: string;
  lat: number;
  lon: number;
  linkTo: string[];
}

// Bounds are reused by point and segment checks on the offline coastline.
const LAND_BOUNDS = LAND_RINGS.map((ring) => ({
  ring,
  minX: Math.min(...ring.map(([x]) => x)), maxX: Math.max(...ring.map(([x]) => x)),
  minY: Math.min(...ring.map(([, y]) => y)), maxY: Math.max(...ring.map(([, y]) => y)),
}));

// Coarse land check (simplified Natural Earth rings, [lon,lat]).
export function isWater(lat: number, lon: number): boolean {
  for (const { ring, minX, maxX, minY, maxY } of LAND_BOUNDS) {
    if (lon < minX || lon > maxX || lat < minY || lat > maxY) continue;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return false;
  }
  return true;
}

// Longitude helpers for antimeridian-safe drawing: unwrapping keeps a
// transpacific track continuous (Leaflet wraps out-of-range longitudes
// when rendering, so the line draws across the Pacific instead of
// backwards over Eurasia/America).
export function wrapLon(lon: number): number {
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return lon;
}

export function unwrapTrack<T extends { lat: number; lon: number }>(pts: T[]): T[] {
  let prev: number | null = null;
  return pts.map((p) => {
    let lon = p.lon;
    if (prev != null) {
      while (lon - prev > 180) lon -= 360;
      while (lon - prev < -180) lon += 360;
    }
    prev = lon;
    return { ...p, lon };
  });
}

// Full coastline intersection, rather than only endpoints or a midpoint.
// Used for new approaches and custom stops; touching land is rejected as well.
function computeWaterSegment(startLat: number, startLon: number, endLat: number, endLon: number): boolean {
  if (!isWater(startLat, wrapLon(startLon)) || !isWater(endLat, wrapLon(endLon))) return false;
  while (endLon - startLon > 180) endLon -= 360;
  while (endLon - startLon < -180) endLon += 360;
  const orient = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
    (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const overlaps = (a: number, b: number, c: number, d: number) =>
    Math.max(Math.min(a, b), Math.min(c, d)) <= Math.min(Math.max(a, b), Math.max(c, d)) + 1e-10;
  const centerLon = (startLon + endLon) / 2;
  for (const { ring, minX, maxX, minY, maxY } of LAND_BOUNDS) {
    if (!overlaps(startLat, endLat, minY, maxY)) continue;
    // Check adjacent world copies for connectors crossing the antimeridian.
    const shift = Math.round((centerLon - (minX + maxX) / 2) / 360) * 360;
    if (!overlaps(startLon, endLon, minX + shift, maxX + shift)) continue;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const ax = ring[j][0] + shift, ay = ring[j][1];
      const bx = ring[i][0] + shift, by = ring[i][1];
      if (!overlaps(startLon, endLon, ax, bx) || !overlaps(startLat, endLat, ay, by)) continue;
      const a = orient(startLon, startLat, endLon, endLat, ax, ay);
      const b = orient(startLon, startLat, endLon, endLat, bx, by);
      const c = orient(ax, ay, bx, by, startLon, startLat);
      const d = orient(ax, ay, bx, by, endLon, endLat);
      if (a * b <= 0 && c * d <= 0) return false;
    }
  }
  return true;
}

// Geometry is immutable; reuse the same coastline verdict across port pairs.
const waterSegmentCache = new Map<string, boolean>();
export function isWaterSegment(a: number, b: number, c: number, d: number): boolean {
  if (![a, b, c, d].every(Number.isFinite) || Math.abs(a) > 90 || Math.abs(c) > 90) return false;
  const ends = [a + "," + wrapLon(b), c + "," + wrapLon(d)].sort();
  const key = ends.join("|");
  const cached = waterSegmentCache.get(key);
  if (cached !== undefined) return cached;
  const clear = computeWaterSegment(a, b, c, d);
  if (waterSegmentCache.size >= 8192) waterSegmentCache.clear();
  waterSegmentCache.set(key, clear);
  return clear;
}

function waterLinked(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  return isWaterSegment(lat1, lon1, lat2, lon2);
}

// Only local, visible approaches may bypass a coarse offshore gateway.
// A short harbour allowance handles ports inside the simplified coastline;
// after reaching water, the entire connector must stay outside every land ring.
const approachCache = new Map<string, boolean>();
function clearPortApproach(port: Port, waypoint: GNode): boolean {
  const key = port.code + "|" + waypoint.id;
  const cached = approachCache.get(key);
  if (cached !== undefined) return cached;
  const check = () => {
    const nm = haversineNm(port.lat, port.lon, waypoint.lat, waypoint.lon);
    if (nm > 300 || !isWater(waypoint.lat, waypoint.lon)) return false;
    let endLon = waypoint.lon;
    while (endLon - port.lon > 180) endLon -= 360;
    while (endLon - port.lon < -180) endLon += 360;
    let startLat = port.lat, startLon = port.lon;
    if (!isWater(startLat, startLon)) {
      // Do not turn an inland port into a new cross-country shortcut.
      const steps = Math.max(1, Math.ceil(nm));
      let reachedWater = false;
      for (let i = 1; i <= steps && nm * i / steps <= 12; i++) {
        startLat = port.lat + (waypoint.lat - port.lat) * i / steps;
        startLon = port.lon + (endLon - port.lon) * i / steps;
        if (isWater(startLat, wrapLon(startLon))) { reachedWater = true; break; }
      }
      if (!reachedWater) return false;
    }
    return isWaterSegment(startLat, startLon, waypoint.lat, endLon);
  };
  const clear = check();
  approachCache.set(key, clear);
  return clear;
}

function buildGraph(
  closedIds: string[] = [],
  avoid: string[] = [],
  extra: ExtraNode[] = [],
  portCodes: string[] = []
): { nodes: Map<string, GNode>; adj: Map<string, { to: string; nm: number }[]> } {
  const nodes = new Map<string, GNode>();
  const adj = new Map<string, { to: string; nm: number }[]>();
  const banned = new Set<string>();
  for (const cp of CHOKEPOINTS) {
    if (!closedIds.includes(cp.id)) continue;
    for (const [a, b] of cp.edges) {
      banned.add([`w:${a}`, `w:${b}`].sort().join("|"));
    }
    for (const code of cp.ports ?? []) {
      for (const g of PORT_GATEWAYS[code] ?? []) {
        banned.add([`p:${code}`, `w:${g}`].sort().join("|"));
      }
    }
  }
  const avoidSet = new Set(avoid.map((a) => `w:${a}`));
  const corridorNodes = new Set(WAYPOINTS.filter((w) => w.corridor).map((w) => `w:${w.id}`));
  const link = (a: string, b: string, directed = false) => {
    if (banned.has([a, b].sort().join("|"))) return;
    if (avoidSet.has(a) || avoidSet.has(b)) return;
    if (!nodes.has(a) || !nodes.has(b)) return;
    const na = nodes.get(a)!;
    const nb = nodes.get(b)!;
    if ((corridorNodes.has(a) || corridorNodes.has(b)) && !isWaterSegment(na.lat, na.lon, nb.lat, nb.lon)) return;
    const nm = haversineNm(na.lat, na.lon, nb.lat, nb.lon);
    adj.get(a)!.push({ to: b, nm });
    if (!directed) adj.get(b)!.push({ to: a, nm });
  };
  for (const w of WAYPOINTS) {
    nodes.set(`w:${w.id}`, { id: `w:${w.id}`, label: w.name, lat: w.lat, lon: w.lon });
    adj.set(`w:${w.id}`, []);
  }
  for (const [a, b] of EDGES) link(`w:${a}`, `w:${b}`);
  for (const [a, b] of DIRECTED_EDGES ?? []) link(`w:${a}`, `w:${b}`, true);
  for (const p of PORTS) {
    if (!portCodes.includes(p.code)) continue;
    const pid = `p:${p.code}`;
    nodes.set(pid, { id: pid, label: p.name, lat: p.lat, lon: p.lon });
    adj.set(pid, []);
    for (const g of PORT_GATEWAYS[p.code] ?? []) {
      if (nodes.has(`w:${g}`)) link(pid, `w:${g}`);
    }
  }
  // Ports are endpoints, never transit links between unrelated sea lanes.
  // Link them to neighbouring points of their existing, open gateways when
  // a local approach is clear. This removes gateway overshoot and backtracking
  // without inventing links across closed/avoided passages or across land.
  for (const p of PORTS.filter((p) => portCodes.includes(p.code))) {
    const pid = "p:" + p.code;
    const gateways = (adj.get(pid) ?? []).map((edge) => edge.to);
    for (const gateway of gateways) {
      if (corridorNodes.has(gateway)) continue;
      for (const edge of [...(adj.get(gateway) ?? [])]) {
        if (corridorNodes.has(edge.to) || !edge.to.startsWith("w:") || (adj.get(pid) ?? []).some((e) => e.to === edge.to)) continue;
        const candidate = nodes.get(edge.to)!;
        if (clearPortApproach(p, candidate)) link(pid, edge.to);
      }
    }
  }
  for (const e of extra) {
    nodes.set(e.id, { id: e.id, label: e.label, lat: e.lat, lon: e.lon });
    adj.set(e.id, []);
  }
  for (const e of extra) {
    for (const t of e.linkTo) link(e.id, t);
  }
  return { nodes, adj };
}

function shortestPath(
  adj: Map<string, { to: string; nm: number }[]>,
  start: string,
  goal: string
): string[] | null {
  if (start === goal) return [start];
  if (!adj.has(start) || !adj.has(goal)) return null;
  if ((adj.get(start) ?? []).length === 0 || (adj.get(goal) ?? []).length === 0) return null;
  // Dijkstra
  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string | null>([[start, null]]);
  const done = new Set<string>();
  for (;;) {
    let cur: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!done.has(id) && d < best) {
        best = d;
        cur = id;
      }
    }
    if (cur === null) return null;
    if (cur === goal) break;
    done.add(cur);
    for (const e of adj.get(cur) ?? []) {
      const nd = best + e.nm;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, cur);
      }
    }
  }
  const path: string[] = [];
  let c: string | null = goal;
  while (c) {
    path.unshift(c);
    c = prev.get(c) ?? null;
  }
  return path;
}

// Remove offshore overshoot after finding a valid network path. Fixed
// passage nodes and user-supplied stops remain anchors: closed passages,
// directed TSS corridors and explicit stops cannot disappear in a shortcut.
const FIXED_ROUTE_NODES = new Set([
  ...CHOKEPOINTS.flatMap((passage) => passage.edges.flat()),
  ...WAYPOINTS.filter((point) => point.corridor).map((point) => point.id),
].map((id) => "w:" + id));

function optimiseOffshorePath(nodes: Map<string, GNode>, original: string[]): string[] {
  const path = original.slice();
  let index = 1;
  while (index < path.length - 1) {
    const middle = path[index];
    if (FIXED_ROUTE_NODES.has(middle) || !middle.startsWith("w:")) { index++; continue; }
    const a = nodes.get(path[index - 1])!, b = nodes.get(middle)!, c = nodes.get(path[index + 1])!;
    const before = haversineNm(a.lat, a.lon, b.lat, b.lon) + haversineNm(b.lat, b.lon, c.lat, c.lon);
    const direct = haversineNm(a.lat, a.lon, c.lat, c.lon);
    if (before - direct < 0.5 || !isWaterSegment(a.lat, a.lon, c.lat, c.lon)) { index++; continue; }
    path.splice(index, 1);
    index = Math.max(1, index - 1);
  }
  return path;
}

function buildPlan(
  from: Port,
  to: Port,
  nodes: Map<string, GNode>,
  path: string[]
): RoutePlan {
  const legs: RouteLeg[] = [];
  const via: string[] = [];
  const points: TrackPoint[] = [];
  for (let i = 0; i < path.length; i++) {
    const n = nodes.get(path[i])!;
    points.push({
      lat: n.lat,
      lon: n.lon,
      kind: n.id.startsWith("p:") ? "port" : n.id.startsWith("c:") ? "custom" : "way",
      id: n.id,
      label: n.label,
    });
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = nodes.get(path[i])!;
    const b = nodes.get(path[i + 1])!;
    const nm = haversineNm(a.lat, a.lon, b.lat, b.lon);
    legs.push({ from: a.label, to: b.label, fromLat: a.lat, fromLon: a.lon, toLat: b.lat, toLon: b.lon, nm });
    if (i > 0 && i < path.length - 2 && path[i].startsWith("w:")) via.push(a.label);
  }
  return { from, to, legs, totalNm: legs.reduce((s, l) => s + l.nm, 0), via, points };
}

export function planRoute(fromCode: string, toCode: string, closedIds: string[] = []): RoutePlan | null {
  const from = PORTS.find((p) => p.code === fromCode);
  const to = PORTS.find((p) => p.code === toCode);
  if (!from || !to || fromCode === toCode) return null;
  const { nodes, adj } = buildGraph(closedIds, [], [], [fromCode, toCode]);
  const start = `p:${fromCode}`;
  const goal = `p:${toCode}`;
  const path = shortestPath(adj, start, goal);
  if (!path) return null;
  return buildPlan(from, to, nodes, optimiseOffshorePath(nodes, path));
}

export interface CustomStop {
  lat: number;
  lon: number;
}

// Route forced through user-supplied stops in order, steering clear of avoided
// waypoint ids. Each consecutive pair is routed independently (Dijkstra) on the
// graph augmented with the custom stops (each linked to its 3 nearest
// waypoints), then concatenated.
export function planRouteWithStops(
  fromCode: string,
  toCode: string,
  customs: CustomStop[],
  avoid: string[] = [],
  closedIds: string[] = []
): RoutePlan | null {
  const from = PORTS.find((p) => p.code === fromCode);
  const to = PORTS.find((p) => p.code === toCode);
  if (!from || !to || fromCode === toCode) return null;
  const extra: ExtraNode[] = customs.map((c, i) => {
    const near = WAYPOINTS.filter((w) => !avoid.includes(w.id))
      .map((w) => ({ id: `w:${w.id}`, nm: haversineNm(c.lat, c.lon, w.lat, w.lon), w }))
      .sort((a, b) => a.nm - b.nm)
      .slice(0, 6)
      .filter((n) => waterLinked(c.lat, c.lon, n.w.lat, n.w.lon))
      .map((n) => n.id);
    return { id: `c:${i}`, label: `Via ${i + 1}`, lat: c.lat, lon: c.lon, linkTo: near };
  });
  const { nodes, adj } = buildGraph(closedIds, avoid, extra, [fromCode, toCode]);
  const anchors = [`p:${fromCode}`, ...customs.map((_, i) => `c:${i}`), `p:${toCode}`];
  const fullPath: string[] = [];
  for (let k = 0; k < anchors.length - 1; k++) {
    const seg = shortestPath(adj, anchors[k], anchors[k + 1]);
    if (!seg) return null;
    fullPath.push(...(k === 0 ? seg : seg.slice(1)));
  }
  return buildPlan(from, to, nodes, optimiseOffshorePath(nodes, fullPath));
}

export function formatDuration(hours: number): string {
  if (!isFinite(hours) || hours < 0) return "—";
  let d = Math.floor(hours / 24);
  let h = Math.floor(hours % 24);
  let m = Math.round((hours * 60) % 60);
  if (m === 60) {
    m = 0;
    h++;
  }
  if (h === 24) {
    h = 0;
    d++;
  }
  return `${d}d ${h}h ${m}m`;
}

// Initial bearing (degrees, 0-360) of the rhumb line between two points.
export function courseDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Display-only simplification: merge consecutive near-collinear open-water legs
// so the leg list stays readable. Distances are summed exactly (total unchanged).
// The sailed track still passes through every waypoint — the map polyline keeps
// all points, so no corner is ever cut on screen.
export function mergeLegs(legs: RouteLeg[]): RouteLeg[] {
  if (legs.length < 2) return legs.slice();
  const out: RouteLeg[] = [];
  let cur: RouteLeg = { ...legs[0] };
  for (let i = 1; i < legs.length; i++) {
    const nx = legs[i];
    const c1 = courseDeg(cur.fromLat, cur.fromLon, cur.toLat, cur.toLon);
    const c2 = courseDeg(nx.fromLat, nx.fromLon, nx.toLat, nx.toLon);
    let d = Math.abs(c1 - c2) % 360;
    if (d > 180) d = 360 - d;
    if (d <= 10 && cur.nm >= 60 && nx.nm >= 60) {
      cur = { ...cur, to: nx.to, toLat: nx.toLat, toLon: nx.toLon, nm: cur.nm + nx.nm };
    } else {
      out.push(cur);
      cur = { ...nx };
    }
  }
  out.push(cur);
  return out;
}
