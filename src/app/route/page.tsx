"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import PortLogPanel from "@/components/PortLogPanel";
import StoryModal from "@/components/StoryModal";
import { PORTS, VHF_DEFAULTS, type Port } from "@/lib/ports";
import { LOAD_MARKS, zoneAt } from "@/lib/loadlines";
import { CHOKEPOINTS } from "@/lib/route-data";
import { formatDuration, haversineNm, isWater, mergeLegs, planRoute, planRouteWithStops, unwrapTrack, wrapLon, type RoutePlan, type TrackPoint } from "@/lib/route";

const LS_KEY = "oa-route-v1";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDate(ms: number) {
  if (!isFinite(ms)) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

interface CustomStop {
  id: number;
  lat: number;
  lon: number;
}

function RouteLoadZone({ fromCode, toCode, departMs, arriveMs }: { fromCode: string; toCode: string; departMs: number; arriveMs: number }) {
  const legs: { port: Port; ms: number }[] = [];
  const fp = PORTS.find((p) => p.code === fromCode);
  const tp = PORTS.find((p) => p.code === toCode);
  if (fp && isFinite(departMs)) legs.push({ port: fp, ms: departMs });
  // Destination falls back to the departure date when no ETA is computed yet.
  if (tp && toCode !== fromCode) {
    const ms = isFinite(arriveMs) ? arriveMs : departMs;
    if (isFinite(ms)) legs.push({ port: tp, ms });
  }
  if (legs.length === 0) return null;
  const monthOf = (ms: number) => new Date(ms).getMonth() + 1;
  const dateOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <h2 className="font-bold">🔍 Which zone is my port in?</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {legs.map(({ port, ms }) => {
          const hit = zoneAt(port.lat, port.lon, monthOf(ms));
          const mark = LOAD_MARKS.find((x) => x.mark === hit?.mark);
          return (
            <div key={port.code} className="rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950">
              <p><strong>{port.name}</strong> <span className="opacity-60">{dateOf(ms)}</span></p>
              {hit && mark ? (
                <>
                  <p className="mt-0.5 text-xl font-black">{hit.mark} <span className="text-sm font-bold opacity-70">{hit.zone.name}</span></p>
                  {hit.zone.smallOnly && <p className="text-xs font-bold opacity-70">For vessels {hit.zone.smallOnly}.</p>}
                  {hit.zone.note && <p className="text-xs opacity-70">Note: {hit.zone.note}.</p>}
                </>
              ) : (
                <p className="mt-0.5 opacity-70">Outside simplified zones — check the ILLC chart.</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] opacity-60">From uses departure date, To uses ETA date (departure date until the route computes). Simplified ILLC guide — the official chart governs.</p>
    </div>
  );
}

function RoutePortInfo({ fromCode, toCode }: { fromCode: string; toCode: string }) {
  const codes = [fromCode, toCode].filter(Boolean);
  const saved = useLiveQuery(
    () => (codes.length > 0 ? db.portVhf.where("portCode").anyOf(codes).toArray() : Promise.resolve([])),
    [fromCode, toCode]
  );
  const byCode = new Map((saved ?? []).map((s) => [s.portCode, s]));
  const ports = codes
    .map((c) => PORTS.find((p) => p.code === c))
    .filter((p): p is Port => !!p);
  if (ports.length === 0) return null;
  const rows = (port: Port) => {
    const s = byCode.get(port.code);
    const d = VHF_DEFAULTS[port.code] ?? {};
    return [
      { label: "VTS", value: s?.vts || d.vts || "—" },
      { label: "Pilot", value: s?.pilot || d.pilot || "—" },
      { label: "Harbour", value: s?.harbour || d.harbour || "—" },
      { label: "Port ctl", value: s?.portControl || d.portControl || "—" },
    ];
  };
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">⚓ Port Info — VHF</h2>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {ports.map((p) => (
          <div key={p.code} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950">
            <p className="text-sm font-black">{p.name} <span className="font-mono text-[11px] opacity-60">{p.code}</span></p>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              {rows(p).map((r) => (
                <p key={r.label}><span className="font-bold opacity-60">{r.label}:</span> <strong>{r.value}</strong></p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] opacity-60">Presets are a starting point — verify with ALRS Vol 6. Edit values in Port Info.</p>
    </div>
  );
}

export default function RoutePage() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: import("leaflet").Map;
    L: typeof import("leaflet");
    portLayer: import("leaflet").LayerGroup;
    routeLayer: import("leaflet").LayerGroup;
    stopLayer: import("leaflet").LayerGroup;
    markers: Map<string, import("leaflet").CircleMarker>;
    seamarkLayer: import("leaflet").TileLayer;
  } | null>(null);
  const [from, setFrom] = useState("NLRTM");
  const [to, setTo] = useState("TRIST");
  const [speed, setSpeed] = useState("13");
  const [depart, setDepart] = useState("");
  const [closed, setClosed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [seamarks, setSeamarks] = useState(true);
  const [customs, setCustoms] = useState<CustomStop[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [storyOpen, setStoryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function flashNotice(msg: string) {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 5000);
  }
  const idRef = useRef(1);
  const fitKeyRef = useRef("");

  // Stable snapshot for Leaflet callbacks (registered once).
  const selRef = useRef({ from, to, editMode });
  selRef.current = { from, to, editMode };
  const planRef = useRef<RoutePlan | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as {
          from?: string; to?: string; speed?: string; closed?: string[];
          customs?: { id?: number; lat?: number; lon?: number }[]; avoid?: string[]; seamarks?: boolean;
        };
        if (s.from && PORTS.some((p) => p.code === s.from)) setFrom(s.from);
        if (s.to && PORTS.some((p) => p.code === s.to)) setTo(s.to);
        if (s.speed) setSpeed(s.speed);
        if (Array.isArray(s.closed)) setClosed(s.closed.filter((c) => CHOKEPOINTS.some((k) => k.id === c)));
        if (Array.isArray(s.customs)) {
          const cs = s.customs
            .filter((c) => isFinite(c.lat ?? NaN) && isFinite(c.lon ?? NaN))
            .map((c) => ({ id: isFinite(c.id ?? NaN) ? Number(c.id) : idRef.current++, lat: Number(c.lat), lon: Number(c.lon) }));
          if (cs.length > 0) {
            idRef.current = Math.max(...cs.map((c) => c.id)) + 1;
            setCustoms(cs);
          }
        }
        if (Array.isArray(s.avoid)) setAvoid(s.avoid.filter((a) => typeof a === "string" && a.length > 0));
        if (typeof s.seamarks === "boolean") setSeamarks(s.seamarks);
      }
    } catch {
      /* ignore */
    }
    setDepart(toLocalInput(new Date()));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ from, to, speed, closed, customs, avoid, seamarks }));
    } catch {
      /* ignore */
    }
  }, [from, to, speed, closed, customs, avoid, seamarks, ready]);

  const plan: RoutePlan | null = useMemo(() => {
    if (!from || !to || from === to) return null;
    if (customs.length > 0 || avoid.length > 0) return planRouteWithStops(from, to, customs, avoid, closed);
    return planRoute(from, to, closed);
  }, [from, to, customs, avoid, closed]);
  planRef.current = plan;

  const displayLegs = useMemo(() => (plan ? mergeLegs(plan.legs) : []), [plan]);

  const kn = Number(String(speed).replace(",", "."));
  const hours = plan && kn > 0 ? plan.totalNm / kn : NaN;
  const depMs = depart ? new Date(depart).getTime() : NaN;
  const arrMs = isFinite(hours) && isFinite(depMs) ? depMs + hours * 3600e3 : NaN;

  function toggleChoke(id: string) {
    setClosed((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Route edits belong to one port pair: changing ports clears custom
  // stops and avoided waypoints so an old edit can't hijack a new route.
  function handleFrom(code: string) {
    setFrom(code);
    setCustoms([]);
    setAvoid([]);
  }
  function handleTo(code: string) {
    setTo(code);
    setCustoms([]);
    setAvoid([]);
  }
  function handleSwap() {
    setFrom(to);
    setTo(from);
    setCustoms([]);
    setAvoid([]);
  }

  function pickPort(code: string) {
    const s = selRef.current;
    if (!s.from || (s.from && s.to)) {
      setFrom(code);
      setTo("");
      setCustoms([]);
      setAvoid([]);
    } else if (code !== s.from) {
      setTo(code);
      setCustoms([]);
      setAvoid([]);
    }
  }
  const pickPortRef = useRef(pickPort);
  pickPortRef.current = pickPort;

  function countCustomsBefore(pts: TrackPoint[], trackIdx: number): number {
    let n = 0;
    for (let i = 0; i <= trackIdx && i < pts.length; i++) if (pts[i].kind === "custom") n++;
    return n;
  }

  function insertCustomAt(lat: number, lon: number, trackIdx?: number) {
    lon = wrapLon(lon);
    if (!isWater(lat, lon)) {
      flashNotice("That point is on land — pick a water point for a stop.");
      return;
    }
    const p = planRef.current;
    const pts = p?.points ?? [];
    let at = customsRef.current.length;
    if (pts.length > 1) {
      let seg = pts.length - 2;
      if (trackIdx == null) {
        let best = Infinity;
        for (let i = 0; i < pts.length - 1; i++) {
          const d = segDist(lat, lon, pts[i].lat, pts[i].lon, pts[i + 1].lat, pts[i + 1].lon);
          if (d < best) { best = d; seg = i; }
        }
      } else {
        seg = Math.max(0, Math.min(pts.length - 2, trackIdx));
      }
      at = countCustomsBefore(pts, seg);
    }
    const id = idRef.current++;
    setCustoms((prev) => [...prev.slice(0, at), { id, lat, lon }, ...prev.slice(at)]);
  }
  const customsRef = useRef(customs);
  customsRef.current = customs;

  // Dragging an auto waypoint turns it into a custom stop at the new position.
  // The original is avoided only when dragged far (>50 nm); small nudges keep
  // it routable so tiny corrections don't blow up the whole route.
  function convertWaypoint(trackIdx: number, wayId: string, lat: number, lon: number) {
    lon = wrapLon(lon);
    if (!isWater(lat, lon)) {
      flashNotice("That point is on land — drag the stop back to water.");
      return;
    }
    const pts = planRef.current?.points ?? [];
    const orig = pts[trackIdx];
    const moved = orig ? haversineNm(orig.lat, orig.lon, lat, lon) : Infinity;
    const at = countCustomsBefore(pts, trackIdx);
    const id = idRef.current++;
    if (moved > 50) setAvoid((prev) => (prev.includes(wayId) ? prev : [...prev, wayId]));
    setCustoms((prev) => [...prev.slice(0, at), { id, lat, lon }, ...prev.slice(at)]);
  }

  function segDist(lat: number, lon: number, lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dx = lon2 - lon1, dy = lat2 - lat1;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((lon - lon1) * dx + (lat - lat1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = lon1 + t * dx - lon, py = lat1 + t * dy - lat;
    return px * px + py * py;
  }

  // ---- Leaflet map: init once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current).setView([30, 20], 2);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);
      const portLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);
      const stopLayer = L.layerGroup().addTo(map);
      const seamarkLayer = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 18,
        opacity: 0.9,
        attribution: '&copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors',
      });
      mapRef.current = { map, L, portLayer, routeLayer, stopLayer, seamarkLayer, markers: new Map() };
      // Port markers: built once, handlers stay valid forever.
      for (const p of PORTS) {
        const m = L.circleMarker([p.lat, p.lon], {
          radius: 5, color: "#2AA198", weight: 3, fillOpacity: 0.85,
        });
        m.bindTooltip(`${p.name} (${p.code})`, { sticky: true });
        m.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (selRef.current.editMode) return;
          pickPortRef.current(p.code);
        });
        m.addTo(portLayer);
        mapRef.current.markers.set(p.code, m);
      }
      // Map click: edit mode inserts a stop, otherwise picks nearest port.
      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const s = selRef.current;
        if (s.editMode) {
          insertCustomAtRef.current(e.latlng.lat, e.latlng.lng);
          return;
        }
        const ref = mapRef.current;
        if (!ref) return;
        let best: Port | null = null, bestPx = 44;
        for (const p of PORTS) {
          const pt = ref.map.latLngToContainerPoint([p.lat, p.lon]);
          const d = Math.hypot(pt.x - e.containerPoint.x, pt.y - e.containerPoint.y);
          if (d < bestPx) { bestPx = d; best = p; }
        }
        if (best) pickPortRef.current(best.code);
      });
      // Popup buttons (remove stop / avoid waypoint), wired once.
      map.on("popupopen", (e: import("leaflet").PopupEvent) => {
        const el = e.popup.getElement() as HTMLElement | undefined;
        const rm = el?.querySelector("[data-rm]");
        rm?.addEventListener("click", () => {
          const id = Number((rm as HTMLElement).dataset.rm);
          setCustoms((prev) => prev.filter((c) => c.id !== id));
          map.closePopup();
        });
        const av = el?.querySelector("[data-avoid]");
        av?.addEventListener("click", () => {
          const id = (av as HTMLElement).dataset.avoid ?? "";
          if (id) setAvoid((prev) => (prev.includes(id) ? prev : [...prev, id]));
          map.closePopup();
        });
      });
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const insertCustomAtRef = useRef(insertCustomAt);
  insertCustomAtRef.current = insertCustomAt;

  // OpenSeaMap seamark overlay (buoys/beacons, crowd-sourced).
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref || !mapReady) return;
    if (seamarks && ready) ref.seamarkLayer.addTo(ref.map);
    else ref.map.removeLayer(ref.seamarkLayer);
  }, [seamarks, mapReady, ready]);

  // Port highlight (no marker rebuild).
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref || !mapReady) return;
    for (const [code, m] of ref.markers) {
      const isFrom = code === from, isTo = code === to;
      m.setStyle({
        radius: isFrom || isTo ? 8 : 5,
        color: isFrom ? "#16a34a" : isTo ? "#dc2626" : "#2AA198",
      });
      m.setRadius(isFrom || isTo ? 8 : 5);
    }
  }, [from, to, mapReady]);

  // Route line (full track — never simplified on screen).
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref || !mapReady) return;
    ref.routeLayer.clearLayers();
    if (plan && plan.legs.length > 0) {
      const raw = [[plan.legs[0].fromLat, plan.legs[0].fromLon] as [number, number]].concat(
        plan.legs.map((l) => [l.toLat, l.toLon] as [number, number])
      );
      // Unwrap across the antimeridian so transpacific legs draw over the
      // Pacific (Leaflet wraps out-of-range longitudes when rendering).
      const pts = unwrapTrack(raw.map(([lat, lon]) => ({ lat, lon }))).map(
        (p) => [p.lat, p.lon] as [number, number]
      );
      const line = ref.L.polyline(pts, { color: "#b45309", weight: 3 });
      if (selRef.current.editMode) {
        line.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          ref.L.DomEvent.stopPropagation(e);
          insertCustomAtRef.current(e.latlng.lat, e.latlng.lng);
        });
      }
      line.addTo(ref.routeLayer);
      const key = `${from}|${to}|${closed.join(",")}`;
      if (fitKeyRef.current !== key) {
        fitKeyRef.current = key;
        ref.map.fitBounds(line.getBounds(), { padding: [24, 24] });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, mapReady, editMode, from, to, closed]);

  // Edit-mode stop markers: EVERY intermediate route point is numbered and
  // draggable. Dragging an auto waypoint converts it into a custom stop at the
  // new position (the original is avoided so the router won't loop back).
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref || !mapReady) return;
    ref.stopLayer.clearLayers();
    if (!editMode || !plan?.points) return;
    const L = ref.L;
    const byId = new Map(customs.map((c) => [c.id, c]));
    const customSeq = customs.map((c) => c.id);
    let seenCustom = 0;
    let n = 0;
    plan.points.forEach((pt, idx) => {
      if (pt.kind === "port") return;
      n++;
      if (pt.kind === "custom") {
        const cid = customSeq[seenCustom++] ?? -1;
        const c = byId.get(cid);
        const water = c ? isWater(c.lat, c.lon) : true;
        const dot = L.marker([pt.lat, pt.lon], {
          draggable: true,
          icon: L.divIcon({
            className: "",
            html: `<div title="Stop ${n} — drag to move" style="width:26px;height:26px;border-radius:50%;background:#b45309;color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;border:3px solid ${water ? "#fff" : "#dc2626"};box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:grab;">${n}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        });
        dot.on("dragend", () => {
          const ll = dot.getLatLng();
          setCustoms((prev) => prev.map((x) => (x.id === cid ? { ...x, lat: ll.lat, lon: ll.lng } : x)));
        });
        dot.bindPopup(
          `<div style="font-size:13px"><b>Stop ${n}</b> ${water ? "" : "<br/><span style='color:#dc2626;font-weight:700'>On land — drag to water</span>"}<br/>${pt.lat.toFixed(2)}, ${pt.lon.toFixed(2)}<br/><button data-rm="${cid}" style="margin-top:6px;padding:4px 10px;border-radius:8px;border:1px solid #dc2626;color:#dc2626;font-weight:700;background:#fff;cursor:pointer;">Remove stop</button></div>`
        );
        dot.addTo(ref.stopLayer);
      } else {
        const wayId = pt.id.startsWith("w:") ? pt.id.slice(2) : pt.id;
        if (avoid.includes(wayId)) return;
        const dot = L.marker([pt.lat, pt.lon], {
          draggable: true,
          icon: L.divIcon({
            className: "",
            html: `<div title="Stop ${n} (${pt.label}) — drag to move" style="width:26px;height:26px;border-radius:50%;background:#2AA198;color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:grab;">${n}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        });
        dot.on("dragend", () => {
          const ll = dot.getLatLng();
          convertWaypointRef.current(idx, wayId, ll.lat, ll.lng);
        });
        dot.bindPopup(
          `<div style="font-size:13px"><b>Stop ${n} — ${pt.label}</b><br/><button data-avoid="${wayId}" style="margin-top:6px;padding:4px 10px;border-radius:8px;border:1px solid #dc2626;color:#dc2626;font-weight:700;background:#fff;cursor:pointer;">Remove stop</button></div>`
        );
        dot.addTo(ref.stopLayer);
      }
    });
  }, [plan, editMode, customs, avoid, mapReady]);
  const convertWaypointRef = useRef(convertWaypoint);
  convertWaypointRef.current = convertWaypoint;

  const fromPort: Port | undefined = PORTS.find((p) => p.code === from);
  const toPort: Port | undefined = PORTS.find((p) => p.code === to);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">📍 Route Planner</h1>
        <p className="text-sm font-medium opacity-70">
          Pick two ports on the map or from the lists. Distance follows sea lanes (straits/canals included, simplified network) — for planning only, not navigation.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_340px]">
        <div className="contents lg:grid lg:content-start lg:gap-4">
          <div className="relative order-1">
          <div ref={mapEl} className="z-0 h-[420px] w-full overflow-hidden rounded-2xl border border-amber-200 dark:border-red-950" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-100 text-sm font-bold opacity-80 dark:bg-neutral-900">
              Loading map…
            </div>
          )}
          {mapReady && (
            <button
              onClick={() => setSeamarks((v) => !v)}
              title="Toggle seamarks (buoys/beacons via OpenSeaMap)"
              className={`absolute right-3 top-3 z-30 rounded-full border px-3 py-1.5 text-xs font-black shadow ${seamarks ? "border-teal-700 bg-teal-600 text-white" : "border-amber-200 bg-white/95 dark:border-red-950 dark:bg-black/90"}`}
            >
              ⚓ Seamarks {seamarks ? "on" : "off"}
            </button>
          )}
          </div>
          <div className="order-7"><RoutePortInfo fromCode={from} toCode={to} /></div>
          <div className="order-8"><RouteLoadZone fromCode={from} toCode={to} departMs={depMs} arriveMs={arrMs} /></div>
          <div className="order-9"><PortLogPanel fromCode={from} toCode={to} /></div>
        </div>

        <div className="contents lg:grid lg:content-start lg:gap-3">
          <div className="order-2 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-1">
            <label className="text-xs font-bold opacity-60">From</label>
            <select value={from} onChange={(e) => handleFrom(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.country})</option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSwap}
                className="rounded-full border px-3 py-1 text-xs font-bold"
                title="Swap"
              >
                ⇅ Swap
              </button>
              <button
                onClick={() => setStoryOpen(true)}
                disabled={!plan}
                className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950 disabled:opacity-40 dark:bg-red-600 dark:text-white"
                title="Story for these two ports"
              >
                📸 Story
              </button>
            </div>
            <label className="mt-2 block text-xs font-bold opacity-60">To</label>
            <select value={to} onChange={(e) => handleTo(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              <option value="">Select…</option>
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.country})</option>
              ))}
            </select>
            <p className="mt-2 text-xs opacity-60">Tip: click a port on the map — first click sets From, second sets To.</p>
          </div>

          <div className="order-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">✏️ Edit route</h2>
              <button
                onClick={() => setEditMode((v) => !v)}
                disabled={!plan}
                className={`rounded-full px-3 py-1 text-xs font-bold ${editMode ? "bg-amber-600 text-white" : "border"} disabled:opacity-40`}
              >
                {editMode ? "Done" : "Edit"}
              </button>
            </div>
            {editMode && (
              <div className="mt-2 text-xs">
                <p className="opacity-60">Drag any numbered stop to move it (orange = yours, teal = auto) • click the route line or the map to add a stop • each stop&apos;s popup removes it.</p>
                {notice && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700 dark:bg-red-950">{notice}</p>}
                {customs.length > 0 && (
                  <ul className="mt-2 grid gap-1">
                    {customs.map((c, i) => (
                      <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-1.5 dark:bg-black">
                        <span><b>Stop {i + 1}</b> · {c.lat.toFixed(2)}, {c.lon.toFixed(2)}{isWater(c.lat, c.lon) ? "" : " · on land!"}</span>
                        <button
                          onClick={() => setCustoms((prev) => prev.filter((x) => x.id !== c.id))}
                          className="shrink-0 rounded-full border border-red-400 px-2 py-0.5 font-bold text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold">{customs.length} custom stop{customs.length === 1 ? "" : "s"} • {avoid.length} avoided</span>
                  {(customs.length > 0 || avoid.length > 0) && (
                    <button
                      onClick={() => { setCustoms([]); setAvoid([]); }}
                      className="rounded-full border border-red-400 px-3 py-1 font-bold text-red-700"
                    >
                      Reset route
                    </button>
                  )}
                </div>
                {avoid.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {avoid.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvoid((prev) => prev.filter((x) => x !== a))}
                        className="rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-700 dark:bg-red-950"
                        title="Click to allow again"
                      >
                        ⊘ {a} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="order-6 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-3">
            <h2 className="font-bold">Straits &amp; Canals</h2>
            <p className="text-xs opacity-60">Switch off a passage you cannot use (no permit, closed, sanctions) — the router will go around or report no route.</p>
            <div className="mt-2 grid gap-1.5">
              {CHOKEPOINTS.map((c) => {
                const off = closed.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChoke(c.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-1.5 text-sm font-bold ${off ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950" : "bg-white dark:bg-black"}`}
                  >
                    <span>{c.name}</span>
                    <span className={`relative inline-flex h-5 w-10 items-center rounded-full ${off ? "bg-red-500" : "bg-green-600"}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all ${off ? "ml-0.5" : "ml-5"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="order-4 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-4">
            {plan ? (
              <>
                <div className="text-xs font-bold opacity-60">TOTAL DISTANCE</div>
                <div className="text-3xl font-black">{Math.round(plan.totalNm).toLocaleString("en-US")} <span className="text-base">nm</span></div>
                <div className="mt-1 text-xs opacity-70">{fromPort?.name} → {toPort?.name} • {displayLegs.length} legs</div>
                <button
                  onClick={() => setStoryOpen(true)}
                  className="mt-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white"
                >
                  📸 Story
                </button>
                {plan.via.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {plan.via.map((v) => (
                      <span key={v} className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold dark:bg-black dark:ring-1 dark:ring-red-950">{v}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm opacity-70">
                {from && to && from !== to
                  ? "No route with the current stops/straits — remove an avoided stop or switch a passage back on."
                  : "Select two different ports for a route."}
              </p>
            )}
          </div>

          <div className="order-5 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-5">
            <h2 className="font-bold">⏱️ ETA Calculator</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold opacity-60">Speed (kn)</label>
                <input value={speed} onChange={(e) => setSpeed(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60">Departure</label>
                <input type="datetime-local" value={depart} onChange={(e) => setDepart(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>Duration: <b>{plan && kn > 0 ? formatDuration(hours) : "—"}</b></div>
              <div>Arrival (ETA): <b>{plan && kn > 0 && isFinite(arrMs) ? fmtDate(arrMs) : "—"}</b></div>
            </div>
          </div>
        </div>
      </div>

      {plan && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">Legs ({displayLegs.length})</h2>
          <ul className="mt-2 grid max-h-72 gap-1 overflow-y-auto text-sm">
            {displayLegs.map((l, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                <span><b>{i + 1}.</b> {l.from} → {l.to}</span>
                <span className="shrink-0 font-bold">{Math.round(l.nm)} nm</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-60">Simplified sea-lane network — not a substitute for real voyage planning; verify against charts and current publications. Straight consecutive legs are grouped here; the map draws the full track through every waypoint.</p>
        </div>
      )}
      {storyOpen && plan && fromPort && toPort && (
        <StoryModal
          fromCode={fromPort.code}
          toCode={toPort.code}
          fromTime={depart || undefined}
          toTime={isFinite(arrMs) ? new Date(arrMs).toISOString() : undefined}
          onClose={() => setStoryOpen(false)}
        />
      )}
    </div>
  );
}
