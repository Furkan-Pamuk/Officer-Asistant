"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocale } from "@/lib/i18n";

export default function ShipMap({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const seamarkRef = useRef<L.TileLayer | null>(null);
  const [seamarks, setSeamarks] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    if (!mapRef.current) {
      const map = L.map(ref.current, { scrollWheelZoom: true }).setView([lat, lon], 6);
      // Single keyless source (OpenStreetMap); night look comes from a CSS
      // filter in globals.css so no second provider or key is ever needed.
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
      seamarkRef.current = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 18,
        opacity: 0.9,
        attribution: "© OpenSeaMap contributors",
      });
    } else {
      mapRef.current.setView([lat, lon], 6);
    }
    const map = mapRef.current;
    let live = true;
    setTimeout(() => { if (live) map.invalidateSize(); }, 300);
    const icon = L.divIcon({
      html: `<div style="font-size:30px;line-height:1;transform:translate(-4px,-14px)">🚢</div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    const marker = L.marker([lat, lon], { icon, title: label }).addTo(map);
    return () => { live = false; marker.remove(); };
  }, [lat, lon, label]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = seamarkRef.current;
    if (!map || !layer) return;
    if (seamarks) layer.addTo(map);
    else map.removeLayer(layer);
  }, [seamarks, lat, lon]);

  useEffect(() => {
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="relative">
      <div ref={ref} className="h-64 w-full rounded-2xl border border-white/20" />
      <button
        onClick={() => setSeamarks((v) => !v)}
        title={t("route.seamarksTitle")}
        className={`absolute right-3 top-3 z-30 rounded-full border px-3 py-1.5 text-xs font-black shadow ${seamarks ? "border-teal-700 bg-teal-600 text-white" : "bg-white/95 dark:bg-black/90"}`}
      >
        {t("route.seamarks").replace("{x}", seamarks ? t("route.on") : t("route.off"))}
      </button>
    </div>
  );
}
