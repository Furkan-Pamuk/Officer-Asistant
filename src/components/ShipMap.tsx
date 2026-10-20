"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ShipMap({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!mapRef.current) {
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lon], 6);
      // Single keyless source (OpenStreetMap); night look comes from a CSS
      // filter in globals.css so no second provider or key is ever needed.
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 300);
    } else {
      mapRef.current.setView([lat, lon], 6);
    }
    const map = mapRef.current;
    const icon = L.divIcon({
      html: `<div style="font-size:30px;line-height:1;transform:translate(-4px,-14px)">🚢</div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    const marker = L.marker([lat, lon], { icon, title: label }).addTo(map);
    return () => { marker.remove(); };
  }, [lat, lon, label]);

  useEffect(() => {
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return <div ref={ref} className="h-64 w-full rounded-2xl border border-white/20" />;
}
