// ILLC load-line zones & marks — working reference.
// Zone boxes/months below come from published ILLC Annex II summaries;
// lookup is a simplified guide, always confirm with the official chart.
export interface LoadZone {
  id: string;
  name: string;
  // Simplified coverage: lon/lat boxes [minLon, minLat, maxLon, maxLat].
  boxes: [number, number, number, number][];
  // Applicable mark per month (index 0 = January): T/S/W/WNA.
  months: string[];
  // True when the calendar applies only to small vessels (others use Summer).
  smallOnly?: string;
  // Extra caveat shown with the answer (boundary inferred, split months…).
  note?: string;
}

// Filled from verified ILLC references. Order matters: later entries win
// overlaps, so list broad zones first and specific seasonal areas after.
export const LOAD_ZONES: LoadZone[] = [
  { id: "tropical", name: "Tropical Zone", boxes: [[-60, 0, -20, 10], [-20, -23, 20, 10], [43, -10, 120, 10], [120, -11, 180, 13], [-180, -26, -70, 10]], months: ["T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T"] },
  { id: "summer", name: "Summer Zone", boxes: [[-70, 20, -10, 50], [-40, -33, 20, 30], [120, 30, 145, 50]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "winter-north-atlantic-I", name: "North Atlantic Winter Seasonal Zone I", boxes: [[-50, 45, 0, 62]], months: ["WNA", "WNA", "WNA", "WNA", "S", "S", "S", "S", "S", "WNA", "WNA", "WNA"] },
  { id: "winter-north-atlantic-II", name: "North Atlantic Winter Seasonal Zone II", boxes: [[-68, 36, -9, 50]], months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "W", "W"] },
  { id: "winter-north-atlantic-coastal", name: "North Atlantic Winter Seasonal Area (US/Canada coast)", boxes: [[-68, 36, -61, 45]], months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "W", "W"] },
  { id: "winter-north-pacific", name: "North Pacific Winter Seasonal Zone", boxes: [[140, 35, 180, 55], [-180, 35, -130, 55]], months: ["W", "W", "W", "W", "S", "S", "S", "S", "S", "W", "W", "W"] },
  { id: "winter-southern", name: "Southern Winter Seasonal Zone", boxes: [[-80, -60, 180, -33]], months: ["S", "S", "S", "W", "W", "W", "W", "W", "W", "W", "S", "S"] },
  { id: "winter-north-atlantic-wna", name: "Winter North Atlantic (WNA, ≤100 m)", boxes: [[-50, 36, -15, 60]], months: ["WNA", "WNA", "WNA", "WNA", "S", "S", "S", "S", "S", "WNA", "WNA", "WNA"] },
  { id: "seasonal-tropical-north-atlantic", name: "Seasonal Tropical — North Atlantic/Caribbean", boxes: [[-90, 10, -15, 20]], months: ["T", "T", "T", "T", "T", "T", "T", "S", "S", "S", "T", "T"] },
  { id: "seasonal-tropical-arabian", name: "Seasonal Tropical — Arabian Sea", boxes: [[43, 8, 73, 25]], months: ["T", "T", "T", "T", "T", "S", "S", "S", "T", "T", "T", "T"] },
  { id: "seasonal-tropical-bengal", name: "Seasonal Tropical — Bay of Bengal", boxes: [[80, 8, 95, 22]], months: ["T", "T", "T", "T", "S", "S", "S", "S", "S", "S", "S", "T"] },
  { id: "seasonal-tropical-madagascar", name: "Seasonal Tropical — South Indian Ocean (Madagascar)", boxes: [[30, -20, 52, -10]], months: ["S", "S", "S", "T", "T", "T", "T", "T", "T", "T", "T", "S"] },
  { id: "seasonal-tropical-australia", name: "Seasonal Tropical — South Indian Ocean (Australia west)", boxes: [[51, -15, 120, -10]], months: ["S", "S", "S", "S", "T", "T", "T", "T", "T", "T", "T", "S"] },
  { id: "seasonal-tropical-china-sea", name: "Seasonal Tropical — South China Sea", boxes: [[105, 10, 122, 22.4]], months: ["S", "T", "T", "T", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "seasonal-tropical-north-pacific-central", name: "Seasonal Tropical — North Pacific central", boxes: [[160, 13, 180, 25], [-180, 13, -130, 25]], months: ["S", "S", "S", "T", "T", "T", "T", "T", "T", "T", "S", "S"] },
  { id: "seasonal-tropical-north-pacific-mexico", name: "Seasonal Tropical — North Pacific eastern (Mexico)", boxes: [[-123, 13, -85, 34]], months: ["S", "S", "T", "T", "T", "T", "S", "S", "S", "S", "T", "S"] },
  { id: "seasonal-tropical-carpentaria", name: "Seasonal Tropical — Gulf of Carpentaria", boxes: [[136, -17, 142, -11]], months: ["S", "S", "S", "T", "T", "T", "T", "T", "T", "T", "T", "S"] },
  { id: "seasonal-tropical-coral", name: "Seasonal Tropical — South Pacific Coral Sea", boxes: [[142, -23, 180, -11], [-180, -20, -150, -11]], months: ["S", "S", "S", "T", "T", "T", "T", "T", "T", "T", "T", "S"] },
  { id: "summer-med", name: "Mediterranean, Black Sea (south of 44°N) & Turkish Straits (Summer)", boxes: [[-6, 30, 36, 46], [28, 41, 42, 44]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "tropical-redsea", name: "Red Sea, Gulfs of Suez/Aqaba & Gulf of Aden (Tropical)", boxes: [[31, 20, 44, 32], [42, 10, 52, 15]], months: ["T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T"] },
  { id: "tropical-gulf", name: "Persian Gulf, Hormuz & Gulf of Oman west of 59°E (Tropical)", boxes: [[47, 22, 59, 31]], months: ["T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T"] },
  { id: "tropical-windian", name: "Western Indian Ocean (Tropical)", boxes: [[38, -10, 52, 10]], months: ["T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T"] },
  { id: "winter-channel", name: "Channel, southern North Sea & Irish Sea (Winter Seasonal, Zone II dates)", boxes: [[-6, 48, 10, 54]], months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "W", "W"] },
  { id: "winter-iberia-west", name: "Portugal Atlantic coast (Winter Seasonal, Zone II dates, eastern closure inferred)", boxes: [[-10, 36, -8, 40]], note: "Zone II eastern closure along Iberia inferred — confirm chart", months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "W", "W"] },
  { id: "summer-iberia-south", name: "Strait of Gibraltar & Morocco Atlantic (Summer)", boxes: [[-10, 33, -5, 37]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "winter-us-east", name: "US East Coast (Winter Seasonal)", boxes: [[-76, 30, -68, 42]], note: "Large vessels Dec 16–Feb 15; small vessels Nov–Mar", months: ["W", "W", "S", "S", "S", "S", "S", "S", "S", "S", "S", "W"] },
  { id: "summer-us-southeast", name: "US Southeast coast (Summer)", boxes: [[-82, 30, -78, 35]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-japan", name: "Japan Pacific waters (Summer, large vessels)", boxes: [[127, 33, 142, 51]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-east-china", name: "East China Sea & Yellow Sea (Summer)", boxes: [[115, 22.5, 127, 38]], note: "Kaohsiung on the northern edge of the China Sea seasonal area — confirm chart", months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-mascarene", name: "Mascarene waters (Summer)", boxes: [[52, -25, 62, -15]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-leeuwin", name: "Western Australia (Summer)", boxes: [[108, -35, 120, -30]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-tasman", name: "Tasman Sea & SE Australia (Summer)", boxes: [[145, -34, 160, -22]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-agulhas", name: "Agulhas waters (Summer)", boxes: [[25, -32, 35, -25]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "tropical-brazil", name: "Brazil current (Tropical)", boxes: [[-48, -20, -35, -10]], months: ["T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T", "T"] },
  { id: "summer-brazil", name: "Brazil/Uruguay/Argentina waters (Summer)", boxes: [[-62, -35, -35, -20]], months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "summer-pnw", name: "Pacific Northwest coast (Summer)", boxes: [[-130, 40, -122, 50]], note: "Northern extent inferred — confirm chart", months: ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"] },
  { id: "enclosed-baltic-small", name: "Enclosed seas — Baltic (winter seasonal, ≤100 m)", smallOnly: "≤100 m (328 ft); larger vessels use Summer year-round", boxes: [[10, 54, 30, 60]], months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "W", "W"] },
  { id: "enclosed-blacksea-north-small", name: "Enclosed seas — Black Sea north of 44°N (winter seasonal, ≤100 m)", smallOnly: "≤100 m (328 ft); larger vessels use Summer year-round", boxes: [[28, 44, 42, 47]], months: ["W", "W", "S", "S", "S", "S", "S", "S", "S", "S", "S", "W"] },
  { id: "enclosed-med-seasonal-small", name: "Enclosed seas — Mediterranean Gulf of Lion area (winter seasonal, ≤100 m)", smallOnly: "≤100 m (328 ft); larger vessels use Summer year-round", boxes: [[-6, 38, 9, 44]], months: ["W", "W", "W", "S", "S", "S", "S", "S", "S", "S", "S", "W"] },
  { id: "enclosed-japan-small", name: "Enclosed seas — Sea of Japan (winter seasonal, ≤116 m)", smallOnly: "≤116 m (382 ft); larger vessels use Summer year-round", boxes: [[127, 38, 142, 50]], months: ["W", "W", "S", "S", "S", "S", "S", "S", "S", "S", "S", "W"] },
];

export function zoneAt(lat: number, lon: number, month1to12: number): { zone: LoadZone; mark: string } | null {
  const m = Math.max(1, Math.min(12, Math.round(month1to12))) - 1;
  let hit: LoadZone | null = null;
  for (const z of LOAD_ZONES) {
    for (const [x0, y0, x1, y1] of z.boxes) {
      if (lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1) {
        hit = z;
        break;
      }
    }
  }
  if (!hit) return null;
  return { zone: hit, mark: hit.months[m] ?? "S" };
}

export const MARK_ORDER = ["WNA", "W", "S", "T"] as const;

export const LOAD_MARKS: { mark: string; name: string; meaning: string }[] = [
  { mark: "TF", name: "Tropical fresh water", meaning: "Deepest allowed in tropical fresh water; on entering tropical seawater the ship rises to her T mark at the same displacement." },
  { mark: "F", name: "Fresh water", meaning: "Allowance Δ/(4·T) mm above S (Δ = displacement at summer draft, T = tonnes per cm). Loaded to F in fresh water, she floats at S in seawater." },
  { mark: "T", name: "Tropical seawater", meaning: "Summer draft/48 above the summer mark — the deepest sea-going mark in tropical zones." },
  { mark: "S", name: "Summer seawater", meaning: "The primary mark (design waterline); every other mark is derived from it." },
  { mark: "W", name: "Winter seawater", meaning: "Summer draft/48 below the summer mark." },
  { mark: "WNA", name: "Winter North Atlantic", meaning: "For vessels ≤ 100 m in parts of the North Atlantic in winter: 50 mm below the winter mark." },
];
