import { network } from "./searoute-network";
import { approaches } from "./searoute-approaches";
import { PORTS, type Port } from "./ports";
import { CHOKEPOINTS, WAYPOINTS } from "./route-data";
import { haversineNm, isWater, isWaterSegment, wrapLon } from "./legacy-route";
import type { CustomStop, RoutePlan, TrackPoint } from "./legacy-route";

// Independently implemented browser router. Dataset: Eurostat/SeaRoute,
// EUPL-1.2; see THIRD_PARTY_NOTICES.md and public/third-party/searoute/.
interface Node { lat: number; lon: number; id: string; label: string }
interface Edge { to: number; nm: number; pass: string }
interface Link { node: number; nm: number; track?: Node[] }
const nodes: Node[] = network.nodes.map(([lat, lon], i) => ({
  lat: lat / network.precision, lon: lon / network.precision, id: "w:sea:" + i,
  label: `${(lat / network.precision).toFixed(3)}°, ${(lon / network.precision).toFixed(3)}°`,
}));
const adj: Edge[][] = nodes.map(() => []);
const fixed = new Set<number>();
function add(a: number, b: number, pass: string, directed = false) {
  const nm = haversineNm(nodes[a].lat, nodes[a].lon, nodes[b].lat, nodes[b].lon);
  adj[a].push({ to: b, nm, pass });
  if (!directed) adj[b].push({ to: a, nm, pass });
  if (pass) { fixed.add(a); fixed.add(b); }
}
for (const [a, b, pass] of network.edges) {
  const name = network.passes[pass];
  // Use Shark's separate directional Dover lanes. Polar passages require
  // vessel/ice planning beyond the current UI, and are disabled by default.
  if (["dover", "northwest", "northeast", "corinth"].includes(name)) continue;
  add(a, b, name);
}
function nearest(point: {lat:number;lon:number}, count = 64, filter?: (n: Node) => boolean): Link[] {
  return nodes.map((n, node) => ({ node, nm: (!filter || filter(n)) ? haversineNm(point.lat, point.lon, n.lat, n.lon) : Infinity }))
    .sort((a, b) => a.nm - b.nm).slice(0, count).filter(l => Number.isFinite(l.nm));
}
// Match to nearby water-visible network vertices, not a distant ocean gateway.
// A bounded harbour allowance is only used when the port itself is inside the
// simplified land mask. Unverified nearest-node snaps are recorded for review.
export const SEAROUTE_APPROACH_REVIEW: {code:string;nm:number}[] = [];
const portLinks = new Map<string, Link[]>();
function visible(point: {lat:number;lon:number}, other: Node, harbour: boolean): boolean {
  if (isWaterSegment(point.lat, point.lon, other.lat, other.lon)) return true;
  if (!harbour || isWater(point.lat, point.lon) || !isWater(other.lat, other.lon)) return false;
  const nm = haversineNm(point.lat, point.lon, other.lat, other.lon);
  let endLon = other.lon;
  while (endLon - point.lon > 180) endLon -= 360;
  while (endLon - point.lon < -180) endLon += 360;
  for (let d = 0.25; d <= Math.min(12, nm); d += 0.25) {
    const lat = point.lat + (other.lat - point.lat) * d / nm;
    const lon = point.lon + (endLon - point.lon) * d / nm;
    if (isWater(lat, wrapLon(lon))) return isWaterSegment(lat, lon, other.lat, endLon);
  }
  return false;
}
function linksForPort(port: Port): Link[] {
  if (portLinks.has(port.code)) return portLinks.get(port.code)!;
  if (approaches[port.code]) {
    const links = approaches[port.code].map(link => {
      const track = link.track.map(([lat, lon], i) => ({lat, lon, id: "w:approach:" + port.code + ":" + i, label: lat.toFixed(3) + "°, " + lon.toFixed(3) + "°"}));
      const points = [port, ...track];
      return {node: link.node, track: track.slice(0, -1), nm: points.slice(1).reduce((sum, p, i) => sum + haversineNm(points[i].lat, points[i].lon, p.lat, p.lon), 0)};
    });
    portLinks.set(port.code, links); return links;
  }
  const near = nearest(port);
  const visibleLinks = near.filter(l => l.nm <= 75 && visible(port, nodes[l.node], true)).slice(0, 6);
  // Retain an explicit approximation for harbour/river ports not resolved by
  // the coastline. Never silently restore the old offshore network.
  if (!visibleLinks.length && near[0]?.nm <= 35) {
    visibleLinks.push(near[0]);
    SEAROUTE_APPROACH_REVIEW.push({ code: port.code, nm: near[0].nm });
  }
  portLinks.set(port.code, visibleLinks);
  return visibleLinks;
}

// The surrounding Eurostat edges remain intact; only the marked Dover
// crossing is replaced. Attach each end on its own side of the strait.
for (const direction of ["ne", "sw"]) {
  const ids = direction === "ne"
    ? ["dover_ne_entry", "dover_ne_s", "dover_ne_gris", "dover", "dover_ne_exit"]
    : ["dover_sw_entry", "dover_sw_mid", "dover_sw_gris", "dover_sw_s", "dover_sw_exit"];
  const lane = ids.map(id => {
    const point = WAYPOINTS.find(w => w.id === id)!;
    const i = nodes.length;
    nodes.push({ lat:point.lat, lon:point.lon, id: "w:" + id, label: point.name }); adj.push([]); fixed.add(i);
    return i;
  });
  for (let i = 1; i < lane.length; i++) add(lane[i - 1], lane[i], "dover", true);
  for (const [position, incoming] of [[0, true], [lane.length - 1, false]] as const) {
    const at = lane[position], point = nodes[at];
    const south = direction === "ne" ? incoming : !incoming;
    const candidates = nearest(point, 64, n => n.id.startsWith("w:sea:") &&
      (south ? n.lat < 50.43 && n.lon < 1 : n.lat > 51.55 && n.lon > 1.8));
    for (const link of candidates.filter(l => visible(point, nodes[l.node], false)).slice(0, 4)) {
      add(incoming ? link.node : at, incoming ? at : link.node, "dover", true);
    }
  }
}

class Heap {
  values: [number, number][] = [];
  push(node: number, score: number) {
    const entry: [number, number] = [node, score]; let i = this.values.length;
    this.values.push(entry);
    while (i > 0) { const p = (i - 1) >> 1; if (this.values[p][1] <= score) break; this.values[i] = this.values[p]; i = p; }
    this.values[i] = entry;
  }
  pop(): [number, number] | undefined {
    const top = this.values[0], last = this.values.pop();
    if (!this.values.length || !last) return top;
    let i = 0;
    while (i * 2 + 1 < this.values.length) {
      let child = i * 2 + 1;
      if (child + 1 < this.values.length && this.values[child + 1][1] < this.values[child][1]) child++;
      if (this.values[child][1] >= last[1]) break;
      this.values[i] = this.values[child]; i = child;
    }
    this.values[i] = last; return top;
  }
}
const treeCache = new Map<string, {dist:Float64Array;prev:Int32Array}>();
function tree(start: Link[], closed: string[], avoid: string[]) {
  const key = JSON.stringify([start, [...closed].sort(), [...avoid].sort()]);
  const old = treeCache.get(key); if (old) return old;
  const blocked = new Set(avoid.map(id => id.startsWith("w:") ? id : "w:" + id));
  // Preserve saved avoids from the previous, named network at their closest
  // new vertex. New edits refer directly to stable w:sea:<index> ids.
  for (const id of avoid) {
    const legacy = WAYPOINTS.find(w => "w:" + w.id === (id.startsWith("w:") ? id : "w:" + id));
    if (legacy) { const closest = nearest(legacy, 1)[0]; if (closest) blocked.add(nodes[closest.node].id); }
  }
  const dist = new Float64Array(nodes.length).fill(Infinity), prev = new Int32Array(nodes.length).fill(-1);
  const heap = new Heap();
  for (const l of start) if (!blocked.has(nodes[l.node].id)) { dist[l.node] = l.nm; heap.push(l.node, l.nm); }
  for (let next = heap.pop(); next; next = heap.pop()) {
    const [at, distance] = next; if (distance !== dist[at]) continue;
    for (const e of adj[at]) {
      if (closed.includes(e.pass) || blocked.has(nodes[e.to].id)) continue;
      const candidate = distance + e.nm;
      if (candidate < dist[e.to]) { dist[e.to] = candidate; prev[e.to] = at; heap.push(e.to, candidate); }
    }
  }
  const result = { dist, prev }; if (treeCache.size >= 3) treeCache.clear(); treeCache.set(key, result); return result;
}
function anchor(port: Port): TrackPoint { return { lat:port.lat, lon:port.lon, id: "p:" + port.code, label: port.name, kind: "port" }; }
function solve(start: TrackPoint, end: TrackPoint, closed: string[], avoid: string[]): TrackPoint[] | null {
  const getLinks = (p: TrackPoint) => p.kind === "port" ? linksForPort(PORTS.find(port => "p:" + port.code === p.id)!)
    : nearest(p).filter(l => l.nm < 100 && visible(p, nodes[l.node], false)).slice(0, 6);
  const a = getLinks(start), b = getLinks(end); if (!a.length || !b.length) return null;
  const {dist, prev} = tree(a, closed, avoid);
  const last = b.reduce((best, l) => dist[l.node] + l.nm < dist[best.node] + best.nm ? l : best);
  if (!Number.isFinite(dist[last.node])) return null;
  const indices: number[] = [];
  for (let at = last.node; at >= 0; at = prev[at]) indices.push(at);
  indices.reverse();
  const first = a.find(link => link.node === indices[0]);
  return [start, ...(first?.track ?? []).map(p => ({...p, kind: "way" as const})), ...indices.map(i => ({ ...nodes[i], kind: "way" as const })), ...(last.track ?? []).slice().reverse().map(p => ({...p, kind: "way" as const})), end];
}
export function planRoute(from: string, to: string, closed: string[] = []): RoutePlan | null {
  return planRouteWithStops(from, to, [], [], closed);
}
export function planRouteWithStops(fromCode: string, toCode: string, customs: CustomStop[], avoid: string[] = [], closed: string[] = []): RoutePlan | null {
  const from = PORTS.find(p => p.code === fromCode), to = PORTS.find(p => p.code === toCode);
  if (!from || !to || from === to || customs.some(p => !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || Math.abs(p.lat) > 90 || Math.abs(p.lon) > 180 || !isWater(p.lat, p.lon))) return null;
  const stops: TrackPoint[] = customs.map((p, i) => ({ ...p, id: "c:" + i, kind: "custom", label: `${p.lat.toFixed(3)}°, ${p.lon.toFixed(3)}°` }));
  const anchors = [anchor(from), ...stops, anchor(to)], points: TrackPoint[] = [];
  for (let i = 1; i < anchors.length; i++) {
    const segment = solve(anchors[i - 1], anchors[i], closed, avoid); if (!segment) return null;
    points.push(...(i === 1 ? segment : segment.slice(1)));
  }
  const legs = points.slice(1).map((b, i) => { const a = points[i]; return {
    from: a.label, to: b.label, fromLat: a.lat, fromLon: a.lon, toLat: b.lat, toLon: b.lon,
    nm: haversineNm(a.lat, a.lon, b.lat, b.lon),
  }; });
  const passages = new Set<string>();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (a.id.startsWith("w:dover") && b.id.startsWith("w:dover")) passages.add("dover");
    if (a.id.startsWith("w:sea:") && b.id.startsWith("w:sea:")) {
      const edge = adj[Number(a.id.slice(6))]?.find(e => nodes[e.to].id === b.id);
      if (edge?.pass) passages.add(edge.pass);
    }
  }
  const via = CHOKEPOINTS.filter(cp => passages.has(cp.id)).map(cp => cp.name);
  return {from, to, points, legs, totalNm: legs.reduce((sum, l) => sum + l.nm, 0), via};
}
