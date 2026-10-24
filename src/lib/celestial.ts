// Compact solar math (NOAA-style, good to ~0.01°) — fully offline.
// Used for sunrise/sunset cross-check, azimuth and amplitude compass error.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function dayOfYear(d: Date) {
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);
}

function solarDeclination(day: number) {
  // Cooper's equation
  return 23.45 * Math.sin(RAD * ((360 / 365) * (284 + day)));
}

export function eqOfTime(day: number) {  const b = RAD * ((360 / 365) * (day - 81));
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
}

export interface SunTimes {
  sunriseUTC: string; // HH:MM
  sunsetUTC: string; // HH:MM
  solarNoonUTC: string;
}

/** Sunrise/sunset in UTC for a position and date. */
export function sunTimesUTC(lat: number, lon: number, date = new Date()): SunTimes {
  const day = dayOfYear(date);
  const decl = solarDeclination(day);
  const eot = eqOfTime(day);
  const cosH = (Math.sin(RAD * -0.833) - Math.sin(RAD * lat) * Math.sin(RAD * decl)) / (Math.cos(RAD * lat) * Math.cos(RAD * decl));
  const H = Math.acos(Math.min(1, Math.max(-1, cosH))) * DEG; // hour angle degrees
  const noonMin = 720 - 4 * lon - eot; // UTC minutes
  const fmt = (m: number) => {
    const t = ((Math.round(m) % 1440) + 1440) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };
  return { sunriseUTC: fmt(noonMin - H * 4), sunsetUTC: fmt(noonMin + H * 4), solarNoonUTC: fmt(noonMin) };
}

/** True azimuth of the sun (0=N, clockwise) for position + UTC time. */
export function sunAzimuth(lat: number, lon: number, utc = new Date()): { azimuth: number; altitude: number } {
  const day = dayOfYear(utc);
  const decl = solarDeclination(day) * RAD;
  const utcMin = utc.getUTCHours() * 60 + utc.getUTCMinutes() + utc.getUTCSeconds() / 60;
  const noonMin = 720 - 4 * lon - eqOfTime(day);
  const H = ((utcMin - noonMin) / 4) * RAD;
  const la = lat * RAD;
  const alt = Math.asin(Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(H));
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(decl) * Math.cos(la));
  az = (az * DEG + 180 + 360) % 360;
  return { azimuth: Math.round(az * 10) / 10, altitude: Math.round(alt * DEG * 10) / 10 };
}

/** Amplitude at rising/setting: true bearing of the sun on the horizon. */
export function amplitude(lat: number, when: "rising" | "setting", date = new Date()): number {
  const decl = solarDeclination(dayOfYear(date)) * RAD;
  const sinAmp = Math.sin(decl) / Math.cos(lat * RAD);
  const amp = Math.asin(Math.min(1, Math.max(-1, sinAmp))) * DEG; // deg from E/W towards N/S
  const base = when === "rising" ? 90 : 270;
  // Rising: N decl bears N of E (90 - Amp), S decl bears S of E (90 + Amp).
  // Setting: N decl bears N of W (270 + Amp), S decl bears S of W (270 - Amp).
  const sign = when === "rising" ? (decl >= 0 ? -1 : 1) : (decl >= 0 ? 1 : -1);
  return Math.round(((base + sign * Math.abs(amp)) % 360 + 360) % 360 * 10) / 10;
}

/** Compass error from observed amplitude: error = observed − computed (E negative/W positive per Nautical Almanac sign). */
export function compassError(observed: number, computed: number) {
  const e = ((observed - computed + 540) % 360) - 180;
  return Math.round(e * 10) / 10;
}
