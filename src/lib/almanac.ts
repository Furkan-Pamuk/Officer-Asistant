// Celestial math (offline): Sun, Moon (truncated Schlyter, ~0.3°) and
// selected navigational stars (J2000, fine for compass checks).
// Always cross-check critical sights against the official Nautical Almanac.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const norm = (d: number) => ((d % 360) + 360) % 360;

export function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function obliquity(d: number) {
  return 23.4393 - 3.563e-7 * d;
}

/** Greenwich Mean Sidereal Time, degrees. */
export function gmst(date: Date) {
  const d = julianDay(date) - 2451543.5;
  return norm(280.46061837 + 360.98564736629 * d);
}

export interface RaDec {
  ra: number; // degrees 0..360
  dec: number; // degrees
}

export function sunRADec(date: Date): RaDec {
  const d = julianDay(date) - 2451543.5;
  const L0 = norm(280.46646 + 0.98564736 * d);
  const M = norm(357.52911 + 0.98560028 * d);
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lam = (L0 + C) * RAD;
  const eps = obliquity(d) * RAD;
  const ra = norm(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * DEG);
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) * DEG;
  return { ra, dec };
}

export function moonRADec(date: Date): RaDec {
  const d = julianDay(date) - 2451543.5;
  const N = norm(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = norm(318.0634 + 0.1643573223 * d);
  const a = 60.2666;
  const e = 0.0549;
  const M = norm(115.3654 + 13.0649929509 * d);
  // eccentric anomaly, two iterations
  let E = M + (e * DEG * Math.sin(M * RAD) * (1 + e * Math.cos(M * RAD)));
  for (let k = 0; k < 2; k++) {
    E = E - (E - (e * DEG * Math.sin(E * RAD)) - M) / (1 - e * Math.cos(E * RAD));
  }
  const x = a * (Math.cos(E * RAD) - e);
  const y = a * Math.sqrt(1 - e * e) * Math.sin(E * RAD);
  const v = norm(Math.atan2(y, x) * DEG);
  const r = Math.sqrt(x * x + y * y);
  const xh = r * (Math.cos(N * RAD) * Math.cos((v + w) * RAD) - Math.sin(N * RAD) * Math.sin((v + w) * RAD) * Math.cos(i * RAD));
  const yh = r * (Math.sin(N * RAD) * Math.cos((v + w) * RAD) + Math.cos(N * RAD) * Math.sin((v + w) * RAD) * Math.cos(i * RAD));
  const zh = r * Math.sin((v + w) * RAD) * Math.sin(i * RAD);
  let lon = norm(Math.atan2(yh, xh) * DEG);
  let lat = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) * DEG;
  // major perturbations
  const Ms = norm(356.047 + 0.9856002585 * d);
  const Lm = norm(N + w + M);
  const ws = norm(282.9404 + 4.70935e-5 * d);
  const Ls = norm(Ms + ws);
  const D = norm(Lm - Ls);
  const F = norm(Lm - N);
  lon += -1.274 * Math.sin((M - 2 * D) * RAD) + 0.658 * Math.sin(2 * D * RAD) - 0.186 * Math.sin(Ms * RAD) - 0.059 * Math.sin((2 * M - 2 * D) * RAD) - 0.057 * Math.sin((M - 2 * D + Ms) * RAD);
  lat += -0.173 * Math.sin((F - 2 * D) * RAD) - 0.055 * Math.sin((M - F - 2 * D) * RAD) - 0.046 * Math.sin((M + F - 2 * D) * RAD) + 0.033 * Math.sin((F + 2 * D) * RAD);
  const eps = obliquity(d) * RAD;
  const xe = Math.cos(lon * RAD) * Math.cos(lat * RAD);
  const ye = Math.sin(lon * RAD) * Math.cos(lat * RAD);
  const ze = Math.sin(lat * RAD);
  const ra = norm(Math.atan2(ye * Math.cos(eps) - ze * Math.sin(eps), xe) * DEG);
  const dec = Math.asin(ye * Math.sin(eps) + ze * Math.cos(eps)) * DEG;
  return { ra, dec };
}

export interface Star {
  name: string;
  raH: number; // J2000 hours
  dec: number; // J2000 degrees
}

export const STARS: Star[] = [
  { name: "Sirius", raH: 6.7525, dec: -16.716 },
  { name: "Canopus", raH: 6.3992, dec: -52.696 },
  { name: "Arcturus", raH: 14.261, dec: 19.182 },
  { name: "Vega", raH: 18.6156, dec: 38.784 },
  { name: "Capella", raH: 5.2782, dec: 45.998 },
  { name: "Rigel", raH: 5.2423, dec: -8.202 },
  { name: "Procyon", raH: 7.655, dec: 5.225 },
  { name: "Betelgeuse", raH: 5.9194, dec: 7.407 },
  { name: "Altair", raH: 19.8464, dec: 8.868 },
  { name: "Antares", raH: 16.4901, dec: -26.432 },
  { name: "Spica", raH: 13.4199, dec: -11.161 },
  { name: "Pollux", raH: 7.7553, dec: 28.026 },
  { name: "Regulus", raH: 10.1395, dec: 11.967 },
  { name: "Deneb", raH: 20.6905, dec: 45.28 },
  { name: "Polaris", raH: 2.5303, dec: 89.264 },
];

/** Altitude/azimuth for an RA/Dec at position + time. */
export function altAz(raDeg: number, decDeg: number, lat: number, lon: number, date: Date) {
  const lst = norm(gmst(date) + lon);
  const H = (lst - raDeg) * RAD;
  const la = lat * RAD;
  const de = decDeg * RAD;
  const alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H));
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(de) * Math.cos(la));
  az = (az * DEG + 180 + 360) % 360;
  return { altitude: Math.round(alt * DEG * 10) / 10, azimuth: Math.round(az * 10) / 10 };
}

export function fmtHM(deg: number) {
  const h = Math.floor(deg / 15);
  const m = Math.round(((deg / 15 - h) * 60) * 10) / 10;
  return `${h}h ${m}m`;
}
