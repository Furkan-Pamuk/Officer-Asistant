import { useEffect, useState } from "react";
import type { TodoInterval, TodoList, TodoTask } from "./types";

export const DEFAULT_LISTS: { name: string; interval: TodoInterval }[] = [
  { name: "Daily Checks", interval: "daily" },
  { name: "Weekly Checks", interval: "weekly" },
  { name: "Monthly Checks", interval: "monthly" },
  { name: "🎒 Joining", interval: "once" },
];

export interface TodoPreset {
  title: string;
  interval: TodoInterval;
  ranks: string[]; // empty = all ranks
}

export const TODO_PRESETS: TodoPreset[] = [
  // ---------- DAILY ----------
  { title: "GMDSS checks (battery, printers, NAVTEX, log)", interval: "daily", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "Compass observation / azimuth", interval: "daily", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "Passage monitoring + position fixing", interval: "daily", ranks: ["2nd Officer"] },
  { title: "NAVTEX + weather information check", interval: "daily", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "Review deck + engine log remarks", interval: "daily", ranks: ["Master"] },
  { title: "Issue Master's daily orders", interval: "daily", ranks: ["Master"] },
  { title: "Deck work plan + toolbox talk", interval: "daily", ranks: ["Chief Officer", "Bosun"] },
  { title: "Cargo gear / hatch cover check", interval: "daily", ranks: ["Chief Officer"] },
  { title: "Stability + ballast status check", interval: "daily", ranks: ["Chief Officer"] },
  { title: "Work permits review (hot work, aloft, overside)", interval: "daily", ranks: ["Chief Officer", "Bosun"] },
  { title: "Deck + cargo watch handover review", interval: "daily", ranks: ["Chief Officer", "2nd Officer"] },
  { title: "Mooring stations + anchor gear readiness", interval: "daily", ranks: ["Chief Officer", "Bosun"] },
  { title: "LSA/FFE rounds + fire patrol", interval: "daily", ranks: ["3rd Officer", "AB"] },
  { title: "Bridge equipment status check", interval: "daily", ranks: ["3rd Officer"] },
  { title: "Training record book update", interval: "daily", ranks: ["Deck Cadet", "Engine Cadet"] },
  { title: "Helm + lookout duties as assigned", interval: "daily", ranks: ["Deck Cadet", "AB"] },
  { title: "Assign deck jobs, verify PPE", interval: "daily", ranks: ["Bosun"] },
  { title: "Mooring deck + gangway readiness", interval: "daily", ranks: ["Bosun", "AB"] },
  { title: "Deck maintenance as assigned (chipping / painting)", interval: "daily", ranks: ["AB"] },
  { title: "Accommodation cleaning duties", interval: "daily", ranks: ["AB"] },
  { title: "Galley hygiene + fridge/freezer temps log", interval: "daily", ranks: ["Cook"] },
  { title: "Menu of the day posted", interval: "daily", ranks: ["Cook"] },
  { title: "Provision stock check", interval: "daily", ranks: ["Cook"] },
  { title: "Engine log review + night orders", interval: "daily", ranks: ["Chief Engineer"] },
  { title: "Fuel + lube consumption check", interval: "daily", ranks: ["Chief Engineer", "2nd Engineer"] },
  { title: "Watchkeeping + machinery rounds", interval: "daily", ranks: ["2nd Engineer"] },
  { title: "Purifier operation check", interval: "daily", ranks: ["2nd Engineer", "3rd Engineer"] },
  { title: "Machinery rounds as assigned", interval: "daily", ranks: ["3rd Engineer", "4th Engineer"] },
  { title: "Bilge + sludge figures update", interval: "daily", ranks: ["3rd Engineer", "4th Engineer", "Oiler"] },
  { title: "Alarm + monitoring system check", interval: "daily", ranks: ["ETO"] },
  { title: "Soundings + engine room cleaning", interval: "daily", ranks: ["Oiler", "Fitter"] },
  { title: "Assist planned maintenance as directed", interval: "daily", ranks: ["Oiler", "Fitter", "Engine Cadet"] },
  { title: "Training tasks + rounds with watchkeeper", interval: "daily", ranks: ["Engine Cadet"] },
  { title: "Deck + engine morning rounds", interval: "daily", ranks: [] },
  { title: "Garbage log + ORB entries reconciled", interval: "daily", ranks: ["Chief Officer", "2nd Engineer"] },
  { title: "Check tomorrow's duty roster", interval: "daily", ranks: [] },
  { title: "Day's weather + navigational warnings reviewed", interval: "daily", ranks: [] },
  { title: "Navigation + deck lights check (dusk rounds)", interval: "daily", ranks: ["ETO"] },
  { title: "Escape routes + muster signage walkthrough", interval: "daily", ranks: [] },
  { title: "Emergency comms test (talkback / UHF watch)", interval: "daily", ranks: [] },
  { title: "Sign noon report + verify 24h run figures", interval: "daily", ranks: ["Master"] },
  { title: "Review cargo documents (mate's receipts, B/L drafts)", interval: "daily", ranks: ["Master"] },
  { title: "Main engine performance review (temps, pressures, power)", interval: "daily", ranks: ["2nd Engineer"] },
  { title: "Start air + control air pressures + auto functions check", interval: "daily", ranks: ["4th Engineer"] },
  { title: "Planned steel + pipe repair jobs (work list)", interval: "daily", ranks: ["Fitter"] },
  // ---------- WEEKLY ----------
  { title: "Lifeboat / rescue boat visual + test run", interval: "weekly", ranks: ["Chief Officer", "3rd Officer"] },
  { title: "Fire rounds + extinguishers spot-check", interval: "weekly", ranks: [] },
  { title: "ECDIS permits + ENCs update check", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Pre-arrival briefing with officers", interval: "weekly", ranks: ["Master", "Chief Officer"] },
  { title: "Deck maintenance inspection round", interval: "weekly", ranks: ["Chief Officer", "Bosun"] },
  { title: "Mooring lines + wires condition check", interval: "weekly", ranks: ["Chief Officer", "Bosun", "AB"] },
  { title: "Chronometer + clock check", interval: "weekly", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "Emergency lighting + signage test", interval: "weekly", ranks: ["3rd Officer", "ETO"] },
  { title: "COLREG study: rule of the week", interval: "weekly", ranks: ["Deck Cadet"] },
  { title: "Deck stores inventory", interval: "weekly", ranks: ["Bosun"] },
  { title: "Lifeboat station muster duties review", interval: "weekly", ranks: ["AB"] },
  { title: "Deep clean galley + provision inventory", interval: "weekly", ranks: ["Cook"] },
  { title: "Expiry dates check (galley + stores)", interval: "weekly", ranks: ["Cook"] },
  { title: "Standby machinery + emergency generator test", interval: "weekly", ranks: ["Chief Engineer", "2nd Engineer"] },
  { title: "OWS + 15ppm alarm test", interval: "weekly", ranks: ["2nd Engineer"] },
  { title: "Fuel/lube filter cleaning", interval: "weekly", ranks: ["3rd Engineer", "4th Engineer"] },
  { title: "Emergency batteries + lighting test", interval: "weekly", ranks: ["ETO"] },
  { title: "Bilge wells cleaning", interval: "weekly", ranks: ["Oiler"] },
  { title: "Workshop assistance: grinding, cutting, welding prep", interval: "weekly", ranks: ["Fitter"] },
  { title: "Engine training tasks + logbook update", interval: "weekly", ranks: ["Engine Cadet"] },
  // From your uploads (docs/COLLECTED.md)
  { title: "GMDSS weekly test + log entry", interval: "weekly", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "ENC permits + weekly update check", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "High-level (95%) + overfill (98%) alarm test before arrival port", interval: "weekly", ranks: ["Chief Officer"] },
  { title: "ODME record + ORB entries reconciled", interval: "weekly", ranks: ["Chief Engineer", "2nd Engineer"] },
  // From PMS work orders (docs/PMS WORK ORDERS *.docx)
  { title: "PA system test + talkback from manoeuvring areas", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Magnetic compass weekly check (light, liquid, bubble, gimbal)", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Weather fax function test + paper stock", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Sound reception system check (visible + audible)", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Walkie-talkies + chargers performance check", interval: "weekly", ranks: ["2nd Officer", "3rd Officer"] },
  { title: "ECDIS LCD + processor cleaning, air filters", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "BWMS visual inspection (filter, UV, valves, cabinets)", interval: "weekly", ranks: ["Chief Officer", "2nd Engineer"] },
  { title: "SCBA sets weekly check (pressure, mask, alarm)", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Emergency fire pump test (remote + local)", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Foam sea water pump test", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Rescue boat release hooks visual inspection", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Davits + provision crane visual, gripe lines", interval: "weekly", ranks: ["3rd Officer", "Bosun"] },
  { title: "Main fire + bilge pump test", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Fire detection panel lamp/indicator test", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "EEBD check (200 bar, spares, markings)", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Fixed CO2 panel + section valves check", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Lifeboat weekly: batteries, lights, engine run ahead/astern", interval: "weekly", ranks: ["3rd Officer"] },
  { title: "Safety + muster lists posted and up to date", interval: "weekly", ranks: [] },
  { title: "Review near-miss + incident reports of the week", interval: "weekly", ranks: [] },
  { title: "Weekly Master's inspection round (deck + accommodation)", interval: "weekly", ranks: ["Master"] },
  { title: "Lifeboat + LSA parts study (weekly topic)", interval: "weekly", ranks: ["Deck Cadet"] },
  { title: "Fresh water generator + hydrophore check", interval: "weekly", ranks: ["3rd Engineer", "4th Engineer"] },
  { title: "Welding consumables + gas bottles inventory", interval: "weekly", ranks: ["Fitter"] },
  { title: "Engine room bilges + save-alls cleaning round", interval: "weekly", ranks: ["Oiler"] },
  { title: "Engine safety devices study (weekly topic) + logbook", interval: "weekly", ranks: ["Engine Cadet"] },
  { title: "General alarm + PA audibility walkthrough", interval: "weekly", ranks: [] },
  { title: "Crew familiarisation: muster duties spot-check", interval: "weekly", ranks: [] },
  { title: "Countersign ORB + Garbage Record Book", interval: "weekly", ranks: ["Master"] },
  { title: "Security rounds + access log review (ISPS)", interval: "weekly", ranks: ["Master"] },
  { title: "Passage plan appraisal for next voyage leg", interval: "weekly", ranks: ["2nd Officer"] },
  { title: "Gangway + deck security rounds as assigned", interval: "weekly", ranks: ["AB"] },
  { title: "Crew allergy + diet board updated", interval: "weekly", ranks: ["Cook"] },
  { title: "Weekly fuel/lube ROB + consumption forecast", interval: "weekly", ranks: ["Chief Engineer"] },
  { title: "Boiler water treatment tests + log", interval: "weekly", ranks: ["3rd Engineer"] },
  { title: "Purifier + separator area deep clean", interval: "weekly", ranks: ["Oiler"] },
  { title: "One engine system study + sketch (weekly)", interval: "weekly", ranks: ["Engine Cadet"] },
  { title: "Reefer plugs + hold ventilation electrics (if applicable)", interval: "weekly", ranks: ["ETO"] },
  // ---------- MONTHLY ----------
  { title: "Safety committee meeting + minutes", interval: "monthly", ranks: ["Master", "Chief Officer", "Chief Engineer"] },
  { title: "PMS overdue review + critical spares", interval: "monthly", ranks: ["Chief Engineer", "2nd Engineer"] },
  { title: "Rest-hour violations review", interval: "monthly", ranks: ["Master", "Chief Officer"] },
  { title: "Medical chest expiry check", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Tank Washing / prewash plan reviewed against P&A Manual", interval: "monthly", ranks: ["Chief Officer"] },
  { title: "Master's review of SMS", interval: "monthly", ranks: ["Master"] },
  { title: "Deck PMS review", interval: "monthly", ranks: ["Chief Officer", "Bosun"] },
  { title: "Charts + publications correction status", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Fire extinguishers inspection record", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Pest control check + report", interval: "monthly", ranks: ["Cook"] },
  { title: "Bunker ROB reconciliation", interval: "monthly", ranks: ["Chief Engineer"] },
  { title: "Oil Record Book review", interval: "monthly", ranks: ["Chief Engineer", "2nd Engineer"] },
  { title: "Insulation resistance (megger) log", interval: "monthly", ranks: ["ETO"] },
  { title: "Safety equipment locations familiarisation", interval: "monthly", ranks: ["Deck Cadet"] },
  { title: "Auxiliary machinery PMS review (purifier, compressors)", interval: "monthly", ranks: ["3rd Engineer", "4th Engineer"] },
  { title: "Sounding pipes + save-alls condition check", interval: "monthly", ranks: ["Oiler"] },
  { title: "Workshop tools + welding gear inventory", interval: "monthly", ranks: ["Fitter"] },
  { title: "Engine cadet monthly training review", interval: "monthly", ranks: ["Engine Cadet"] },
  { title: "Medical locker check (medicines, expiry, SM form)", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Poison treatment chest content + expiry", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Sextant care, cleaning + stowage", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Fireman outfits monthly check (4 sets + BA)", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Lifeboat monthly: lube, sprinkler, inventory", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Wheeled + portable extinguishers inspection", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "TPA (thermal protective aids) check", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Fire hydrants operate + seals + marking", interval: "monthly", ranks: ["3rd Officer", "AB"] },
  { title: "Lifebuoys + lights + grabline check", interval: "monthly", ranks: ["3rd Officer", "AB"] },
  { title: "Chemical protective suits (IBC Ch.14.2) check", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "MOB lifebuoy + light-smoke signal check", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Galley heat detector test", interval: "monthly", ranks: ["3rd Officer", "Cook"] },
  { title: "Immersion suits monthly check + donning drill", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Liferafts: marking, HRU, lashings, weak link", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Pyrotechnics expiry: rockets + line-thrower", interval: "monthly", ranks: ["3rd Officer", "2nd Officer"] },
  { title: "International shore connection check", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Oil spill kit inventory (SMPEP App.8)", interval: "monthly", ranks: ["3rd Officer", "Bosun"] },
  { title: "Rescue harness + rope check", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Fire doors test (quarterly due)", interval: "monthly", ranks: ["3rd Officer"] },
  { title: "Cargo manifold valves inspection (disc, packing, bonding)", interval: "monthly", ranks: ["Chief Officer"] },
  { title: "BW pump + valves checks, drop valve timing 10–12s", interval: "monthly", ranks: ["Chief Officer"] },
  { title: "Lifeboat davit monthly inspection (grease, wires, hooks)", interval: "monthly", ranks: ["Chief Officer", "Bosun"] },
  { title: "Accommodation hygiene round (mess, toilets, stores, stairs)", interval: "monthly", ranks: ["Chief Officer"] },
  { title: "Rest hours records up to date + signed", interval: "monthly", ranks: [] },
  { title: "Drill debrief: lessons + log entries filed", interval: "monthly", ranks: [] },
  { title: "Bonded + slop chest inventory check", interval: "monthly", ranks: [] },
  { title: "Safety bulletins + company circulars read and filed", interval: "monthly", ranks: [] },
  { title: "Update ship's contact + next-of-kin lists", interval: "monthly", ranks: [] },
  { title: "MLC compliance walkthrough (accommodation, food, water)", interval: "monthly", ranks: ["Master"] },
  { title: "Cargo document file audit (B/L, manifests, tally sheets)", interval: "monthly", ranks: ["Chief Officer"] },
  { title: "Medical training drill (oxygen, stretcher) with crew", interval: "monthly", ranks: ["2nd Officer"] },
  { title: "Windlass + mooring winch greasing + brake check", interval: "monthly", ranks: ["Bosun"] },
  { title: "Abandon-ship muster + boat station duties review", interval: "monthly", ranks: ["AB"] },
  { title: "Bonded/provision rooms: FIFO + temperature mapping review", interval: "monthly", ranks: ["Cook"] },
  { title: "Auxiliary engines safety devices + crankcase inspection", interval: "monthly", ranks: ["3rd Engineer"] },
  { title: "Sewage treatment plant + incinerator rounds and log", interval: "monthly", ranks: ["4th Engineer"] },
  { title: "Bridge nav equipment health check (gyro, radar, AIS, ECDIS HW)", interval: "monthly", ranks: ["ETO"] },
  { title: "Workshop machinery upkeep (lathe, drill, grinding tools)", interval: "monthly", ranks: ["Fitter"] },
  { title: "Greasing rounds completion + lube consumption log", interval: "monthly", ranks: ["Oiler"] },
  { title: "TRB monthly review with training officer", interval: "monthly", ranks: ["Deck Cadet", "Engine Cadet"] },
  // ---------- JOINING (one-time per contract) ----------
  { title: "Passport + seaman's book packed", interval: "once", ranks: [] },
  { title: "Certificates + endorsements folder (originals + copies)", interval: "once", ranks: [] },
  { title: "Medical fitness certificate in date", interval: "once", ranks: [] },
  { title: "Work clothes + boiler suits + safety shoes", interval: "once", ranks: [] },
  { title: "Laptop + chargers + manuals backup", interval: "once", ranks: [] },
  { title: "Sextant / azimuth mirror (deck officers)", interval: "once", ranks: [] },
  { title: "Company joining documents + contract copies", interval: "once", ranks: [] },
  { title: "Command handover: cash, documents, keys", interval: "once", ranks: [] },
  { title: "Handover: cargo + stability + deck PMS", interval: "once", ranks: [] },
  { title: "Handover: engine status + spares + ORB", interval: "once", ranks: [] },
  { title: "Bridge + engine automation handover", interval: "once", ranks: [] },
  { title: "Crew allergy + diet list (galley)", interval: "once", ranks: [] },
  { title: "Report to head of department, get PPE", interval: "once", ranks: [] },
  { title: "Travel tickets + agent contact saved", interval: "once", ranks: [] },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function weekKey(d = new Date()) {
  // ISO week key: YYYY-Www
  const c = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (c.getUTCDay() + 6) % 7;
  c.setUTCDate(c.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(c.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((c.getTime() - first.getTime()) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${c.getUTCFullYear()}-W${pad(week)}`;
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function periodKeyFor(interval: TodoInterval, d = new Date()) {
  if (interval === "daily") return dayKey(d);
  if (interval === "weekly") return weekKey(d);
  if (interval === "once") return "once";
  return monthKey(d);
}

export function periodLabel(interval: TodoInterval) {
  if (interval === "daily") return `Today (${dayKey()})`;
  if (interval === "weekly") return `This week (${weekKey()})`;
  if (interval === "once") return `One-time (this contract)`;
  return `This month (${monthKey()})`;
}

export function logId(taskId: string, periodKey: string) {
  return `${taskId}__${periodKey}`;
}

export function seedTasksFor(contractId: string, now: string): TodoTask[] {
  return TODO_PRESETS.map((p, i) => ({
    id: `${contractId}_todo_${i}`,
    contractId,
    title: p.title,
    interval: p.interval,
    ranks: p.ranks,
    active: true,
    custom: false,
    updatedAt: now,
  }));
}

export function defaultListsFor(contractId: string, now: string): TodoList[] {
  return DEFAULT_LISTS.map((l) => ({
    id: `${contractId}_list_${l.interval}`,
    contractId,
    name: l.name,
    interval: l.interval,
    ranks: [],
    note: "",
    archived: false,
    custom: false,
    updatedAt: now,
  }));
}

// ---------- Personal template library (per user, not per contract) ----------
// Every new contract is seeded from this library, so each contract starts
// with the same template set the user curated. Stored in localStorage because
// it is small, user-scoped and must survive contract switches.
export interface LibTask {
  title: string;
  ranks: string[];
}
export type TodoLib = Record<TodoInterval, LibTask[]>;

const LIB_KEY = "oa-todo-lib";
// Bump this every time TODO_PRESETS changes so existing users receive new items.
const LIB_VERSION = 4;

function libFromPresets(): TodoLib {
  const lib: TodoLib = { daily: [], weekly: [], monthly: [], once: [] };
  for (const p of TODO_PRESETS) lib[p.interval].push({ title: p.title, ranks: p.ranks });
  return lib;
}

// Pre-joining is uniform: the same list for every rank.
function uniformOnceRanks(lib: TodoLib) {
  const shipped = new Set(TODO_PRESETS.filter((p) => p.interval === "once").map((p) => p.title));
  lib.once = lib.once.map((x) => (shipped.has(x.title) ? { ...x, ranks: [] } : x));
}

function normalizeLib(p: Partial<Record<TodoInterval, unknown>>): TodoLib {
  const lib: TodoLib = { daily: [], weekly: [], monthly: [], once: [] };
  (Object.keys(lib) as TodoInterval[]).forEach((k) => {
    const arr = Array.isArray(p[k]) ? (p[k] as LibTask[]) : [];
    lib[k] = arr
      .filter((x) => x && typeof x.title === "string" && x.title.trim())
      .map((x) => ({ title: x.title.trim(), ranks: Array.isArray(x.ranks) ? x.ranks : [] }));
  });
  return lib;
}

export function loadLib(): TodoLib {
  const fallback = libFromPresets();
  try {
    const raw = localStorage.getItem(LIB_KEY);
    if (!raw) {
      localStorage.setItem(LIB_KEY, JSON.stringify({ v: LIB_VERSION, lib: fallback }));
      return fallback;
    }
    const parsed = JSON.parse(raw) as
      | { v?: number; lib?: Partial<Record<TodoInterval, unknown>> }
      | Partial<Record<TodoInterval, unknown>>;
    let v = 1;
    let data: Partial<Record<TodoInterval, unknown>> = {};
    if (parsed && typeof parsed === "object" && "lib" in parsed) {
      v = Number((parsed as { v?: unknown }).v) || 1;
      data = (parsed as { lib?: Partial<Record<TodoInterval, unknown>> }).lib ?? {};
    } else if (parsed && typeof parsed === "object") {
      data = parsed as Partial<Record<TodoInterval, unknown>>;
    }
    const lib = normalizeLib(data);
    if (v < 3) {
      // pre-joining became uniform for all ranks
      uniformOnceRanks(lib);
    }
    if (v < LIB_VERSION) {
      // merge newly shipped presets so existing users receive them too
      for (const p of TODO_PRESETS) {
        if (!lib[p.interval].some((x) => x.title === p.title)) {
          lib[p.interval].push({ title: p.title, ranks: p.ranks });
        }
      }
      saveLib(lib);
    }
    return lib;
  } catch {
    return fallback;
  }
}

export function saveLib(lib: TodoLib) {
  try {
    localStorage.setItem(LIB_KEY, JSON.stringify({ v: LIB_VERSION, lib }));
  } catch {
    /* ignore */
  }
}

const libListeners = new Set<() => void>();

export function useTodoLib() {
  const [lib, setLib] = useState<TodoLib>(() => loadLib());
  useEffect(() => {
    const refresh = () => setLib(loadLib());
    libListeners.add(refresh);
    return () => {
      libListeners.delete(refresh);
    };
  }, []);
  const update = (next: TodoLib) => {
    saveLib(next);
    libListeners.forEach((l) => l());
  };
  return { lib, update };
}
