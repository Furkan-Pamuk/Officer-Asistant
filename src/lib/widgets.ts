export interface WidgetDef {
  id: string;
  label: string;
}

export const WIDGETS: WidgetDef[] = [
  { id: "counter", label: "Vessel day counter" },
  { id: "gibs", label: "GIBS + sign-off reminders" },
  { id: "markets", label: "Markets board" },
  { id: "weather", label: "Weather board" },
  { id: "tracker", label: "Vessel tracker map" },
  { id: "health", label: "Water + weight" },
  { id: "notes", label: "Notes board" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "sunmoon", label: "Sun & moon" },
  { id: "qibla", label: "Qibla & prayer" },
  { id: "frequent", label: "Frequent shortcuts" },
  { id: "firstaid", label: "🆘 First Aid" },
];

const KEY = "oa-widgets";

export function loadWidgetPrefs(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const w of WIDGETS) defaults[w.id] = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveWidgetPrefs(p: Record<string, boolean>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}
