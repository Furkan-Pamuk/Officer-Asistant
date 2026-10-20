import { PORTS, type Port } from "./ports";
import { CHOKEPOINTS, EDGES, PORT_GATEWAYS, WAYPOINTS } from "./route-data";

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

function buildGraph(
  closedIds: string[] = [],
  avoid: string[] = [],
  extra: ExtraNode[] = []
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
  const link = (a: string, b: string) => {
    if (banned.has([a, b].sort().join("|"))) return;
    if (avoidSet.has(a) || avoidSet.has(b)) return;
    if (!nodes.has(a) || !nodes.has(b)) return;
    const na = nodes.get(a)!;
    const nb = nodes.get(b)!;
    const nm = haversineNm(na.lat, na.lon, nb.lat, nb.lon);
    adj.get(a)!.push({ to: b, nm });
    adj.get(b)!.push({ to: a, nm });
  };
  for (const w of WAYPOINTS) {
    nodes.set(`w:${w.id}`, { id: `w:${w.id}`, label: w.name, lat: w.lat, lon: w.lon });
    adj.set(`w:${w.id}`, []);
  }
  for (const [a, b] of EDGES) link(`w:${a}`, `w:${b}`);
  for (const p of PORTS) {
    const pid = `p:${p.code}`;
    nodes.set(pid, { id: pid, label: p.name, lat: p.lat, lon: p.lon });
    adj.set(pid, []);
    for (const g of PORT_GATEWAYS[p.code] ?? []) {
      if (nodes.has(`w:${g}`)) link(pid, `w:${g}`);
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
  const { nodes, adj } = buildGraph(closedIds);
  const start = `p:${fromCode}`;
  const goal = `p:${toCode}`;
  const path = shortestPath(adj, start, goal);
  if (!path) return null;
  return buildPlan(from, to, nodes, path);
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
    const near = WAYPOINTS.map((w) => ({ id: `w:${w.id}`, nm: haversineNm(c.lat, c.lon, w.lat, w.lon) }))
      .sort((a, b) => a.nm - b.nm)
      .slice(0, 3)
      .map((n) => n.id);
    return { id: `c:${i}`, label: `Via ${i + 1}`, lat: c.lat, lon: c.lon, linkTo: near };
  });
  const { nodes, adj } = buildGraph(closedIds, avoid, extra);
  const anchors = [`p:${fromCode}`, ...customs.map((_, i) => `c:${i}`), `p:${toCode}`];
  const fullPath: string[] = [];
  for (let k = 0; k < anchors.length - 1; k++) {
    const seg = shortestPath(adj, anchors[k], anchors[k + 1]);
    if (!seg) return null;
    fullPath.push(...(k === 0 ? seg : seg.slice(1)));
  }
  return buildPlan(from, to, nodes, fullPath);
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
