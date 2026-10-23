import { PORTS } from "./ports";
import { planRoute, unwrapTrack } from "./route";
import { LAND_RINGS } from "./world-land";

export interface StoryStats {
  fromName: string;
  toName: string;
  distanceNm: number;
  hours: number | null; // null = standalone (no dates)
  avgKn: number | null;
  dateLabel: string;
}

export function voyageStats(fromCode: string, toCode: string, fromTime?: string, toTime?: string): StoryStats | null {
  const plan = planRoute(fromCode, toCode);
  const from = PORTS.find((p) => p.code === fromCode);
  const to = PORTS.find((p) => p.code === toCode);
  if (!from || !to) return null;
  const distanceNm = plan ? plan.totalNm : 0;
  let hours: number | null = null;
  if (fromTime && toTime) {
    const ms = new Date(toTime).getTime() - new Date(fromTime).getTime();
    if (isFinite(ms) && ms > 0) hours = ms / 3600000;
  }
  const avgKn = hours && hours > 0 ? distanceNm / hours : null;
  const dateLabel = fromTime ? fromTime.slice(0, 10) + (toTime ? " → " + toTime.slice(0, 10) : "") : new Date().toISOString().slice(0, 10);
  return { fromName: from.name, toName: to.name, distanceNm, hours, avgKn, dateLabel };
}

export interface RoutePoint { lat: number; lon: number }

export function routePoints(fromCode: string, toCode: string): RoutePoint[] {
  const plan = planRoute(fromCode, toCode);
  if (plan && plan.legs.length) {
    const pts: RoutePoint[] = plan.legs.map((l) => ({ lat: l.fromLat, lon: l.fromLon }));
    const last = plan.legs[plan.legs.length - 1];
    pts.push({ lat: last.toLat, lon: last.toLon });
    return pts;
  }
  const from = PORTS.find((p) => p.code === fromCode);
  const to = PORTS.find((p) => p.code === toCode);
  if (from && to) return [{ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }];
  return [];
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function projFactory(pts: RoutePoint[], mx: number, my: number, mw: number, mh: number) {
  // Unwrap across the antimeridian so transpacific tracks span the Pacific,
  // not the whole world backwards.
  const up = unwrapTrack(pts);
  const lats = up.map((p) => p.lat), lons = up.map((p) => p.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  let minLon = Math.min(...lons), maxLon = Math.max(...lons);
  if (maxLon - minLon < 4) { minLon -= 2; maxLon += 2; }
  if (maxLat - minLat < 2) { /* keep */ }
  const midLat = (minLat + maxLat) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);
  const spanX = Math.max(0.001, (maxLon - minLon) * kx);
  const spanY = Math.max(0.001, maxLat - minLat);
  const scale = Math.min(mw / spanX, mh / spanY);
  const ox = mx + (mw - spanX * scale) / 2, oy = my + (mh - spanY * scale) / 2;
  return {
    // mean longitude of the (unwrapped) track — land rings are shifted by
    // multiples of 360° to sit nearest to it (antimeridian-safe backdrop).
    refLon: (minLon + maxLon) / 2,
    proj: (lon: number, lat: number): [number, number] => [ox + (lon - minLon) * kx * scale, oy + (maxLat - lat) * scale],
  };
}

// Shift a land ring by ±360° so it sits nearest the track's longitudes.
function shiftRing(ring: number[][], refLon: number): number[][] {
  let sx = 0;
  for (const [x] of ring) sx += x;
  sx /= Math.max(1, ring.length);
  let best = 0, bd = Infinity;
  for (const k of [-1, 0, 1]) {
    const d = Math.abs(sx + k * 360 - refLon);
    if (d < bd) { bd = d; best = k; }
  }
  if (best === 0) return ring;
  return ring.map(([x, y]) => [x + best * 360, y]);
}

// Sutherland–Hodgman clip of a lon/lat ring against a bbox
function clipRing(ring: number[][], minX: number, minY: number, maxX: number, maxY: number): number[][] {
  let out = ring;
  const edges: Array<[(p: number[]) => boolean, (a: number[], b: number[]) => number[]]> = [
    [(p) => p[0] >= minX, (a, b) => { const t = (minX - a[0]) / (b[0] - a[0]); return [minX, a[1] + (b[1] - a[1]) * t]; }],
    [(p) => p[0] <= maxX, (a, b) => { const t = (maxX - a[0]) / (b[0] - a[0]); return [maxX, a[1] + (b[1] - a[1]) * t]; }],
    [(p) => p[1] >= minY, (a, b) => { const t = (minY - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * t, minY]; }],
    [(p) => p[1] <= maxY, (a, b) => { const t = (maxY - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * t, maxY]; }],
  ];
  for (const [inside, intersect] of edges) {
    const inp = out;
    out = [];
    if (!inp.length) break;
    let prev = inp[inp.length - 1];
    for (const cur of inp) {
      const ci = inside(cur), pi = inside(prev);
      if (ci && pi) out.push(cur);
      else if (ci && !pi) { out.push(intersect(prev, cur), cur); }
      else if (!ci && pi) { out.push(intersect(prev, cur)); }
      prev = cur;
    }
  }
  return out;
}

function fmtDur(hours: number | null): string {
  if (hours == null) return "—";
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

export function buildStorySVG(s: StoryStats, pts: RoutePoint[]): string {
  const W = 1080, H = 1920;
  // project route into map box
  const mx = 90, my = 470, mw = W - 180, mh = 860;
  let path = "";
  let startX = 0, startY = 0, endX = 0, endY = 0;
  let land = "";
  if (pts.length >= 2) {
    // land backdrop: project, then clip to the map frame in screen space.
    // The route is projected into a padded inner box so track, endpoints
    // and frame never touch.
    const PAD = 80;
    const pr = projFactory(pts, mx + PAD, my + PAD, mw - PAD * 2, mh - PAD * 2);
    const up = unwrapTrack(pts);
    const P = up.map((p) => pr.proj(p.lon, p.lat));
    path = "M" + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
    [startX, startY] = P[0];
    [endX, endY] = P[P.length - 1];
    const fx0 = mx, fy0 = my, fx1 = mx + mw, fy1 = my + mh;
    for (const ring of LAND_RINGS) {
      const sp = shiftRing(ring, pr.refLon).map(([x, y]) => pr.proj(x, y));
      let rMinX = 1e9, rMaxX = -1e9, rMinY = 1e9, rMaxY = -1e9;
      for (const [x, y] of sp) {
        if (x < rMinX) rMinX = x; if (x > rMaxX) rMaxX = x;
        if (y < rMinY) rMinY = y; if (y > rMaxY) rMaxY = y;
      }
      if (rMaxX < fx0 || rMinX > fx1 || rMaxY < fy0 || rMinY > fy1) continue;
      const cl = clipRing(sp, fx0, fy0, fx1, fy1);
      if (cl.length < 3) continue;
      land += `<path d="M${cl.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} Z" fill="#1d3a52"/>`;
    }
  }
  // graticule
  let grid = "";
  for (let i = 0; i <= 8; i++) {
    const x = mx + (mw / 8) * i;
    grid += `<line x1="${x}" y1="${my}" x2="${x}" y2="${my + mh}" stroke="#1b2a4a" stroke-width="2"/>`;
  }
  for (let i = 0; i <= 8; i++) {
    const y = my + (mh / 8) * i;
    grid += `<line x1="${mx}" y1="${y}" x2="${mx + mw}" y2="${y}" stroke="#1b2a4a" stroke-width="2"/>`;
  }
  const stat = (x: number, v: string, l: string) => `
    <text x="${x}" y="1450" text-anchor="middle" font-family="Arial,sans-serif" font-size="54" font-weight="900" fill="#FFFFFF">${esc(v)}</text>
    <text x="${x}" y="1495" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="bold" fill="#2AA198">${esc(l)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#081120"/>
  <rect y="300" width="${W}" height="1180" fill="#0E1E33"/>
  <text x="80" y="150" font-family="Arial,sans-serif" font-size="40" font-weight="900" fill="#2AA198" letter-spacing="6">SHARK</text>
  <text x="80" y="205" font-family="Arial,sans-serif" font-size="26" fill="#8B98A5">DON'T BE THE PREY. BE THE SHARK.</text>
  <text x="80" y="330" font-family="Arial,sans-serif" font-size="64" font-weight="900" fill="#FFFFFF">${esc(s.fromName.toUpperCase())}</text>
  <text x="80" y="400" font-family="Arial,sans-serif" font-size="44" font-weight="bold" fill="#2AA198">↓  ${esc(s.toName.toUpperCase())}</text>
  <!-- Static rendering of the current SharkMascot artwork; no external assets. -->
  <svg x="830" y="20" width="210" height="230" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet" fill="none">
    <ellipse cx="160" cy="290" rx="91" ry="9" fill="#0000002e" />
      <g>
        <path d="M104 230C60 232 34 211 21 180L58 186 45 155C83 161 101 184 111 205Z" fill="#718b9a" stroke="#081120" stroke-width="3" stroke-linejoin="round" />
        <path d="M133 101C126 67 145 48 179 40L182 110Z" fill="#718b9a" stroke="#081120" stroke-width="3" />
        <path d="M102 196C81 192 68 208 60 231 84 232 99 225 112 215" fill="#718b9a" stroke="#081120" stroke-width="3" stroke-linejoin="round" />
        <path d="M94 164C94 117 118 92 163 91 213 89 238 121 239 172 248 221 226 270 172 276 118 281 87 246 94 164Z" fill="#718b9a" stroke="#081120" stroke-width="3" />
        <path d="M110 187C120 174 139 171 164 173 194 172 221 179 228 199 237 234 211 263 173 266 129 269 106 241 110 187Z" fill="#dce9ec" />
        <g>
          <path d="M227 180C247 173 267 156 283 136 292 165 278 203 238 215Z" fill="#718b9a" stroke="#081120" stroke-width="3" stroke-linejoin="round" />
          <path d="M244 190 267 169" stroke="#2aa198" stroke-width="3" stroke-linecap="round" />
        </g>
        <path d="M123 124 144 119M185 119 207 125" stroke="#081120" stroke-width="5" stroke-linecap="round" />
        <g>
        <ellipse cx="138" cy="151" rx="18" ry="23" fill="#fff8e9" />
        <g><ellipse cx="140" cy="153" rx="7" ry="11" fill="#081120" /><circle cx="142" cy="149" r="2.5" fill="#fff8e9" /></g>

        </g>
        <g>
        <ellipse cx="195" cy="151" rx="18" ry="23" fill="#fff8e9" />
        <g><ellipse cx="193" cy="153" rx="7" ry="11" fill="#081120" /><circle cx="195" cy="149" r="2.5" fill="#fff8e9" /></g>

        </g>
        <path d="M129 192Q167 209 211 188C205 218 149 233 129 192Z" fill="#081120" stroke="#081120" stroke-width="4" stroke-linejoin="round" />
        <path d="M134 196 144 207 151 201 162 213 171 203 182 210 192 198 200 202 207 194Q169 207 134 196Z" fill="#fff8e9" />
        <path d="M220 162 226 168M218 173 225 178" stroke="#2aa198" stroke-width="3" stroke-linecap="round" />
        <path d="M114 110 111 75Q164 48 219 75L213 111Z" fill="#f4f7fa" stroke="#081120" stroke-width="3" stroke-linejoin="round" />
        <path d="M109 99Q163 84 217 100L213 113Q162 101 115 116Z" fill="#081120" />
        <path d="M114 99Q164 85 216 99" stroke="#c8ab68" stroke-width="4" />
        <path d="M118 114Q166 101 214 113C200 130 146 133 118 114Z" fill="#081120" stroke="#c8ab68" stroke-width="2" />
        <circle cx="164" cy="79" r="11" fill="#081120" />
        <path d="M158 86Q160 76 172 72L168 86Z" fill="#c8ab68" />
        <path d="M125 249Q169 270 210 244" stroke="#2aa198" stroke-width="7" stroke-linecap="round" />
      </g>
  </svg>
  ${grid}
  ${land}
  <rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="none" stroke="#2AA198" stroke-width="3" opacity="0.6"/>
  ${path ? `<path d="${path}" fill="none" stroke="#2AA198" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
  ${path ? `<circle cx="${startX}" cy="${startY}" r="16" fill="#2AA198" stroke="#FFFFFF" stroke-width="5"/><circle cx="${endX}" cy="${endY}" r="16" fill="#E63946" stroke="#FFFFFF" stroke-width="5"/>` : ""}
  ${stat(240, Math.round(s.distanceNm).toLocaleString("en-US"), "TOTAL NM")}
  ${stat(540, fmtDur(s.hours), "DURATION")}
  ${stat(840, s.avgKn != null ? s.avgKn.toFixed(1) : "—", "AVG KN")}
  <line x1="80" y1="1560" x2="1000" y2="1560" stroke="#1b2a4a" stroke-width="3"/>
  <g>
    <rect x="400" y="1620" width="280" height="140" rx="40" fill="#081120" stroke="#2AA198" stroke-width="4"/>
    <!-- Keep the SharkMark's original square viewBox to preserve fin proportions. -->
    <svg x="470" y="1620" width="140" height="140" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid meet">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#081120" />
      <path d="M23 41 C27 28 34 20 48 13 C44 24 42 32 42 41 Z" fill="#8B98A5" />
      <rect x="12" y="44" width="40" height="3" rx="1.5" fill="#2AA198" />
      <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#2AA198" opacity="0.45" />
    </svg>
  </g>
  <text x="540" y="1800" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">SHARK</text>
  <text x="540" y="1845" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" fill="#8B98A5">${esc(s.dateLabel)} • shark at sea</text>
</svg>`;
}

export async function downloadStoryPNG(svg: string, filename: string): Promise<void> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("render"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#081120";
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.drawImage(img, 0, 0, 1080, 1920);
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function shareStoryPNG(svg: string, filename: string, title: string): Promise<boolean> {
  try {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("render"));
      img.src = url;
    });
    URL.revokeObjectURL(url);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.fillStyle = "#081120";
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.drawImage(img, 0, 0, 1080, 1920);
    const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!out) return false;
    const file = new File([out], filename, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[]; title: string }) => Promise<void> };
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
