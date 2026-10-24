"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import PortLogPanel from "@/components/PortLogPanel";
import StoryModal from "@/components/StoryModal";
import { PORTS, VHF_DEFAULTS, type Port } from "@/lib/ports";
import { LOAD_MARKS, zoneAt } from "@/lib/loadlines";
import { CHOKEPOINTS } from "@/lib/route-data";
import { formatDuration, haversineNm, isWater, mergeLegs, planRoute, planRouteWithStops, unwrapTrack, wrapLon, type RoutePlan, type TrackPoint } from "@/lib/route";
import { canEditTrack, nearestTrackLeg, planEditedTrack, restoreEditedTrack } from "@/lib/route-editor";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";

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
  const { t } = useLocale();
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
      <h2 className="font-bold">{t("route.zoneTitle")}</h2>
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
                  {hit.zone.smallOnly && <p className="text-xs font-bold opacity-70">{t("route.vessels").replace("{x}", hit.zone.smallOnly)}</p>}
                  {hit.zone.note && <p className="text-xs opacity-70">{t("route.note").replace("{x}", hit.zone.note)}</p>}
                </>
              ) : (
                <p className="mt-0.5 opacity-70">{t("route.outside")}</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] opacity-60">{t("route.zoneHint")}</p>
    </div>
  );
}

function RoutePortInfo({ fromCode, toCode }: { fromCode: string; toCode: string }) {
  const { t } = useLocale();
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
      { label: t("route.vts"), value: s?.vts || d.vts || "—" },
      { label: t("route.pilot"), value: s?.pilot || d.pilot || "—" },
      { label: t("route.harbour"), value: s?.harbour || d.harbour || "—" },
      { label: t("route.portctl"), value: s?.portControl || d.portControl || "—" },
    ];
  };
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">{t("route.portinfo")}</h2>
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
      <p className="mt-2 text-[11px] opacity-60">{t("route.presetHint")}</p>
    </div>
  );
}

export default function RoutePage() {
  useDocTitle("route.title");
  const { t } = useLocale();
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
  const [editZoom, setEditZoom] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [seamarks, setSeamarks] = useState(true);
  const [customs, setCustoms] = useState<CustomStop[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [editedPoints, setEditedPoints] = useState<TrackPoint[] | null>(null);
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

  // Stable snapshots and handlers for Leaflet callbacks (registered once).
  const selRef = useRef({ from, to, editMode });
  const planRef = useRef<RoutePlan | null>(null);
  const pickPortRef = useRef<(code: string) => void>(() => {});
  const insertCustomAtRef = useRef<(lat: number, lon: number, trackIdx?: number) => boolean>(() => false);
  const moveWaypointRef = useRef<(index: number, lat: number, lon: number) => boolean>(() => false);
  const removeWaypointRef = useRef<(index: number) => boolean>(() => false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as {
          from?: string; to?: string; speed?: string; closed?: string[];
          customs?: { id?: number; lat?: number; lon?: number }[]; avoid?: string[]; seamarks?: boolean; manual?: unknown;
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        const savedFrom = PORTS.some((p) => p.code === s.from) ? s.from! : "NLRTM";
        const savedTo = PORTS.some((p) => p.code === s.to) ? s.to! : "TRIST";
        setEditedPoints(restoreEditedTrack(s.manual, savedFrom, savedTo));
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
      localStorage.setItem(LS_KEY, JSON.stringify({ from, to, speed, closed, customs, avoid, seamarks, manual: editedPoints }));
    } catch {
      /* ignore */
    }
  }, [from, to, speed, closed, customs, avoid, seamarks, editedPoints, ready]);

  const automaticPlan: RoutePlan | null = useMemo(() => {
    if (!from || !to || from === to) return null;
    if (customs.length > 0 || avoid.length > 0) return planRouteWithStops(from, to, customs, avoid, closed);
    return planRoute(from, to, closed);
  }, [from, to, customs, avoid, closed]);
  const plan = useMemo(() => editedPoints ? planEditedTrack(from, to, editedPoints) : automaticPlan, [from, to, editedPoints, automaticPlan]);

  const displayLegs = useMemo(() => (plan ? mergeLegs(plan.legs) : []), [plan]);

  const kn = Number(String(speed).replace(",", "."));
  const hours = plan && kn > 0 ? plan.totalNm / kn : NaN;
  const depMs = depart ? new Date(depart).getTime() : NaN;
  const arrMs = isFinite(hours) && isFinite(depMs) ? depMs + hours * 3600e3 : NaN;

  function toggleChoke(id: string) {
    setEditedPoints(null);
    setClosed((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Route edits belong to one port pair: changing ports clears custom
  // stops and avoided waypoints so an old edit can't hijack a new route.
  function handleFrom(code: string) {
    setEditedPoints(null);
    setFrom(code);
    setCustoms([]);
    setAvoid([]);
  }
  function handleTo(code: string) {
    setEditedPoints(null);
    setTo(code);
    setCustoms([]);
    setAvoid([]);
  }
  function handleSwap() {
    setEditedPoints(null);
    setFrom(to);
    setTo(from);
    setCustoms([]);
    setAvoid([]);
  }

  function pickPort(code: string) {
    setEditedPoints(null);
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

  const commitTrack = useCallback((points: TrackPoint[], message = t("route.onLandStop")): boolean => {
    const previous = planRef.current?.points;
    if (!previous || !canEditTrack(previous, points)) { flashNotice(message); return false; }
    setEditedPoints(points);
    setCustoms([]);
    setAvoid([]);
    setNotice("");
    return true;
  }, [t]);

  const insertCustomAt = useCallback((lat: number, lon: number, trackIdx?: number): boolean => {
    const points = planRef.current?.points;
    if (!points || points.length < 2) return false;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90) { flashNotice(t("route.onLandStop")); return false; }
    lon = wrapLon(lon);
    const leg = trackIdx ?? nearestTrackLeg(points, lat, lon);
    const at = Math.max(1, Math.min(points.length - 1, leg + 1));
    const point: TrackPoint = { id: `c:manual-${Date.now()}-${idRef.current++}`, kind: "custom", lat, lon, label: t("route.stop").replace("{n}", String(at)) };
    return commitTrack([...points.slice(0, at), point, ...points.slice(at)]);
  }, [t, commitTrack]);

  const moveWaypoint = useCallback((index: number, lat: number, lon: number): boolean => {
    const points = planRef.current?.points;
    if (!points || index <= 0 || index >= points.length - 1) return false;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90) { flashNotice(t("route.onLandDrag")); return false; }
    const moved: TrackPoint = { ...points[index], lat, lon: wrapLon(lon), kind: "custom", id: points[index].kind === "custom" ? points[index].id : `c:manual-${Date.now()}-${idRef.current++}` };
    return commitTrack(points.map((p, i) => i === index ? moved : p), t("route.onLandDrag"));
  }, [t, commitTrack]);

  const removeWaypoint = useCallback((index: number): boolean => {
    const points = planRef.current?.points;
    if (!points || index <= 0 || index >= points.length - 1) return false;
    return commitTrack(points.filter((_, i) => i !== index));
  }, [commitTrack]);

  const reorderWaypoint = useCallback((index: number, direction: number) => {
    const points = planRef.current?.points;
    const target = index + direction;
    if (!points || target <= 0 || target >= points.length - 1) return;
    const next = points.slice();
    [next[index], next[target]] = [next[target], next[index]];
    commitTrack(next);
  }, [commitTrack]);

  useEffect(() => {
    selRef.current = { from, to, editMode };
    planRef.current = plan;
    pickPortRef.current = pickPort;
    insertCustomAtRef.current = insertCustomAt;
    moveWaypointRef.current = moveWaypoint;
    removeWaypointRef.current = removeWaypoint;
  });

  // ---- Leaflet map: init once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current).setView([30, 20], 2);
      map.on("zoomend", () => setEditZoom(map.getZoom()));
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);
      map.attributionControl.addAttribution('<a href="/third-party/searoute/NOTICE.txt" target="_blank" rel="noopener">Eurostat / SeaRoute · EUPL-1.2</a>');
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
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      const line = ref.L.polyline(pts, { color: "#b45309", weight: 3, interactive: false }).addTo(ref.routeLayer);
      if (selRef.current.editMode) {
        pts.slice(1).forEach((point, index) => {
          ref.L.polyline([pts[index], point], { weight: 22, opacity: 0, className: "shark-route-insert-leg" })
            .on("click", (event: import("leaflet").LeafletMouseEvent) => {
              ref.L.DomEvent.stopPropagation(event);
              insertCustomAtRef.current(event.latlng.lat, event.latlng.lng, index);
            }).addTo(ref.routeLayer);
        });
      }
      const key = `${from}|${to}|${closed.join(",")}`;
      if (fitKeyRef.current !== key) {
        fitKeyRef.current = key;
        ref.map.fitBounds(line.getBounds(), { padding: [24, 24] });
      }
    }
  }, [plan, mapReady, editMode, from, to, closed]);

  // Edit handles modify the displayed track itself; recalculation cannot snap
  // them back to the original graph waypoint after a drag or removal.
  useEffect(() => {
    const ref = mapRef.current;
    if (!ref || !mapReady) return;
    ref.stopLayer.clearLayers();
    if (!editMode || !plan?.points) return;
    const L = ref.L;
    const points = unwrapTrack(plan.points);
    const stopLayer = ref.stopLayer;
    function marker(lat: number, lon: number, title: string, text: string, kind: string, index: number) {
      const badge = document.createElement("span");
      badge.className = "shark-route-waypoint-badge";
      badge.textContent = text;
      badge.dataset.kind = kind;
      const dot = L.marker([lat, lon], {
        draggable: true, autoPan: true, bubblingMouseEvents: false, title,
        zIndexOffset: kind === "insert" ? 500 : 1000,
        icon: L.divIcon({ className: "shark-route-waypoint", html: badge, iconSize: [44, 44], iconAnchor: [22, 22] }),
      }).addTo(stopLayer);
      const element = dot.getElement();
      element?.setAttribute("aria-label", title);
      if (element) { element.dataset.routeKind = kind; element.dataset.trackIndex = String(index); }
      return dot;
    }
    points.slice(1, -1).forEach((point, offset) => {
      const index = offset + 1;
      const title = t("route.stopLabel").replace("{n}", String(index)).replace("{label}", point.label);
      const dot = marker(point.lat, point.lon, title, String(index), point.kind, index);
      dot.on("dragend", () => {
        const position = dot.getLatLng();
        if (!moveWaypointRef.current(index, position.lat, position.lng)) dot.setLatLng([point.lat, point.lon]);
      });
      const popup = document.createElement("div");
      const heading = document.createElement("strong");
      heading.textContent = t("route.stopTitle").replace("{n}", String(index)).replace("{label}", point.label);
      const coordinates = document.createElement("p");
      coordinates.textContent = point.lat.toFixed(5) + ", " + wrapLon(point.lon).toFixed(5);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "shark-route-remove";
      remove.textContent = t("route.removeStop");
      remove.addEventListener("click", (event) => { L.DomEvent.stopPropagation(event); if (removeWaypointRef.current(index)) ref.map.closePopup(); });
      popup.append(heading, coordinates, remove);
      dot.bindPopup(popup);
    });
    points.slice(1).forEach((point, index) => {
      const previous = points[index];
      if (ref.map.latLngToLayerPoint([previous.lat, previous.lon]).distanceTo(ref.map.latLngToLayerPoint([point.lat, point.lon])) < 100) return;
      if (haversineNm(previous.lat, previous.lon, point.lat, point.lon) < 2) return;
      const midpoint = ref.map.layerPointToLatLng(ref.map.latLngToLayerPoint([previous.lat, previous.lon]).add(ref.map.latLngToLayerPoint([point.lat, point.lon])).divideBy(2));
      const lat = midpoint.lat, lon = midpoint.lng;
      if (!isWater(lat, wrapLon(lon))) return;
      const dot = marker(lat, lon, t("common.add") + " · " + t("route.stop").replace("{n}", String(index + 1)), "+", "insert", index);
      dot.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event);
        insertCustomAtRef.current(lat, lon, index);
      });
      dot.on("dragend", () => {
        const position = dot.getLatLng();
        if (!insertCustomAtRef.current(position.lat, position.lng, index)) dot.setLatLng([lat, lon]);
      });
    });
    return () => { ref.stopLayer.clearLayers(); };
  }, [plan, editMode, mapReady, editZoom, t]);

  const fromPort: Port | undefined = PORTS.find((p) => p.code === from);
  const toPort: Port | undefined = PORTS.find((p) => p.code === to);

  return (
    <div className="shark-interior-page">
      <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("route.title")}</h1>
        <p className="text-sm font-medium opacity-70">
          {t("route.sub")}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_340px]">
        <div className="contents lg:grid lg:content-start lg:gap-4">
          <div className="relative order-1">
          <div ref={mapEl} className="z-0 h-[420px] w-full overflow-hidden rounded-2xl border border-amber-200 dark:border-red-950" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-100 text-sm font-bold opacity-80 dark:bg-neutral-900">
              {t("route.loadingMap")}
            </div>
          )}
          {mapReady && (
            <button
              onClick={() => setSeamarks((v) => !v)}
              title={t("route.seamarksTitle")}
              className={`absolute right-3 top-3 z-30 rounded-full border px-3 py-1.5 text-xs font-black shadow ${seamarks ? "border-teal-700 bg-teal-600 text-white" : "border-amber-200 bg-white/95 dark:border-red-950 dark:bg-black/90"}`}
            >
              {t("route.seamarks").replace("{x}", seamarks ? t("route.on") : t("route.off"))}
            </button>
          )}
          </div>
          <div className="order-7"><RoutePortInfo fromCode={from} toCode={to} /></div>
          <div className="order-8"><RouteLoadZone fromCode={from} toCode={to} departMs={depMs} arriveMs={arrMs} /></div>
          <div className="order-9"><PortLogPanel fromCode={from} toCode={to} /></div>
        </div>

        <div className="contents lg:grid lg:content-start lg:gap-3">
          <div className="order-2 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-1">
            <label className="text-xs font-bold opacity-60">{t("route.from")}</label>
            <select value={from} onChange={(e) => handleFrom(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.country})</option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSwap}
                className="rounded-full border px-3 py-1 text-xs font-bold"
                title={t("route.swapTitle")}
              >
                {t("route.swap")}
              </button>
              <button
                onClick={() => setStoryOpen(true)}
                disabled={!plan}
                className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950 disabled:opacity-40 dark:bg-red-600 dark:text-white"
                title={t("route.storyFor")}
              >
                {t("route.story")}
              </button>
            </div>
            <label className="mt-2 block text-xs font-bold opacity-60">{t("route.to")}</label>
            <select value={to} onChange={(e) => handleTo(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              <option value="">{t("route.select")}</option>
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.country})</option>
              ))}
            </select>
            <p className="mt-2 text-xs opacity-60">{t("route.tip")}</p>
          </div>

          <div className="order-3 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{t("route.editRoute")}</h2>
              <button
                onClick={() => setEditMode((v) => !v)}
                aria-pressed={editMode}
                disabled={!plan}
                className={`rounded-full px-3 py-1 text-xs font-bold ${editMode ? "bg-amber-600 text-white" : "border"} disabled:opacity-40`}
              >
                {editMode ? t("route.done") : t("common.edit")}
              </button>
            </div>
            {editMode && (
              <div className="mt-2 text-xs">
                <p className="opacity-60">{t("route.editHint")}</p>
                {notice && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700 dark:bg-red-950">{notice}</p>}
                <ol className="mt-3 grid max-h-96 gap-2 overflow-y-auto pr-1">
                  {plan?.points.slice(1, -1).map((point, offset) => {
                    const index = offset + 1;
                    const label = t("route.stop").replace("{n}", String(index));
                    return (
                      <li key={point.id + "-" + index} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-red-950 dark:bg-black">
                        <div className="flex items-start justify-between gap-2">
                          <button className="min-h-11 text-left font-bold" onClick={() => {
                            const displayed = unwrapTrack(plan.points)[index];
                            const map = mapRef.current?.map;
                            map?.setView([displayed.lat, displayed.lon], Math.max(9, map.getZoom()), { animate: false });
                          }}>{label}<span className="block text-[11px] font-normal opacity-60">{point.label}</span></button>
                          <div className="flex shrink-0 gap-1">
                            <button title={label + " ↑"} aria-label={label + " ↑"} disabled={index === 1} onClick={() => reorderWaypoint(index, -1)} className="min-h-11 min-w-9 rounded-lg border disabled:opacity-30">↑</button>
                            <button title={label + " ↓"} aria-label={label + " ↓"} disabled={index === plan.points.length - 2} onClick={() => reorderWaypoint(index, 1)} className="min-h-11 min-w-9 rounded-lg border disabled:opacity-30">↓</button>
                            <button title={t("route.removeStop")} aria-label={t("route.removeStop") + " · " + label} onClick={() => removeWaypoint(index)} className="min-h-11 min-w-9 rounded-lg border border-red-400 font-bold text-red-700 dark:text-red-400">×</button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {(["lat", "lon"] as const).map((axis) => (
                            <label key={axis} className="min-w-0"><span className="mb-1 block opacity-60">{axis === "lat" ? "φ" : "λ"}</span><input
                              key={String(point[axis])} aria-label={label + (axis === "lat" ? " φ" : " λ")} type="number" step="0.00001" min={axis === "lat" ? -90 : -180} max={axis === "lat" ? 90 : 180}
                              defaultValue={point[axis].toFixed(5)} className="min-h-11 w-full min-w-0 rounded-lg border px-2 py-2 font-mono text-xs"
                              onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                              onBlur={(event) => {
                                const value = Number.parseFloat(event.currentTarget.value);
                                if (value === point[axis]) return;
                                const accepted = moveWaypoint(index, axis === "lat" ? value : point.lat, axis === "lon" ? value : point.lon);
                                if (!accepted) event.currentTarget.value = point[axis].toFixed(5);
                              }}
                            /></label>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold">{t("route.customSummary").replace("{a}", String(editedPoints ? editedPoints.filter((p) => p.kind === "custom").length : customs.length)).replace("{b}", String(avoid.length))}</span>
                  {(editedPoints || customs.length > 0 || avoid.length > 0) && (
                    <button
                      onClick={() => { setEditedPoints(null); setCustoms([]); setAvoid([]); setNotice(""); }}
                      className="rounded-full border border-red-400 px-3 py-1 font-bold text-red-700"
                    >
                      {t("route.reset")}
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
                        title={t("route.allowAgain")}
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
            <h2 className="font-bold">{t("route.straits")}</h2>
            <p className="text-xs opacity-60">{t("route.straitsHint")}</p>
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
                <div className="text-xs font-bold opacity-60">{t("route.total")}</div>
                <div className="text-3xl font-black">{Math.round(plan.totalNm).toLocaleString("en-US")} <span className="text-base">nm</span></div>
                <div className="mt-1 text-xs opacity-70">{t("route.summary").replace("{from}", fromPort?.name ?? "").replace("{to}", toPort?.name ?? "").replace("{n}", String(displayLegs.length))}</div>
                <button
                  onClick={() => setStoryOpen(true)}
                  className="mt-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white"
                >
                  {t("route.story")}
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
                  ? t("route.noRoute")
                  : t("route.pickTwo")}
              </p>
            )}
          </div>

          <div className="order-5 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 lg:order-5">
            <h2 className="font-bold">{t("route.eta")}</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold opacity-60">{t("route.speed")}</label>
                <input value={speed} onChange={(e) => setSpeed(e.target.value)} inputMode="decimal" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold opacity-60">{t("route.departure")}</label>
                <input type="datetime-local" value={depart} onChange={(e) => setDepart(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>{t("route.duration")} <b>{plan && kn > 0 ? formatDuration(hours) : "—"}</b></div>
              <div>{t("route.arrival")} <b>{plan && kn > 0 && isFinite(arrMs) ? fmtDate(arrMs) : "—"}</b></div>
            </div>
          </div>
        </div>
      </div>

      {plan && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("route.legs").replace("{n}", String(displayLegs.length))}</h2>
          <ul className="mt-2 grid max-h-72 gap-1 overflow-y-auto text-sm">
            {displayLegs.map((l, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                <span><b>{i + 1}.</b> {l.from} → {l.to}</span>
                <span className="shrink-0 font-bold">{Math.round(l.nm)} nm</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs opacity-60">{t("route.networkNote")}</p>
        </div>
      )}
      {storyOpen && plan && fromPort && toPort && (
        <StoryModal
          routePlan={plan}
          fromCode={fromPort.code}
          toCode={toPort.code}
          fromTime={depart || undefined}
          toTime={isFinite(arrMs) ? new Date(arrMs).toISOString() : undefined}
          onClose={() => setStoryOpen(false)}
        />
      )}
    </div>
    </div>
  );
}
