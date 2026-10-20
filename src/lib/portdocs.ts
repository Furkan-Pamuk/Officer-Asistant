import { db } from "./db";
import type { PortDocData, PortDocRow } from "./types";

export interface PortDocField {
  key: string;
  label: string;
}

export interface PortDocColumn {
  key: string;
  label: string;
}

export interface PortDocModule {
  id: string;
  label: string;
  hint: string;
  kind: "form" | "table";
  fields?: PortDocField[];
  columns?: PortDocColumn[];
  seedRows?: Record<string, string>[];
  importCrew?: boolean;
  importVoyages?: boolean;
}

const CREW_COLS: PortDocColumn[] = [
  { key: "name", label: "Family Name, Given Name" },
  { key: "rank", label: "Rank" },
  { key: "nationality", label: "Nationality" },
  { key: "birthPlace", label: "Place of Birth" },
  { key: "birthDate", label: "Date of Birth" },
  { key: "gender", label: "Gender" },
];

export const PORT_DOC_MODULES: PortDocModule[] = [
  {
    id: "ship-data",
    label: "🚢 Ship Data",
    hint: "Particulars, voyage & contacts",
    kind: "form",
    fields: [
      { key: "shipName", label: "Ship's name" },
      { key: "crewNo", label: "Number of crew" },
      { key: "flag", label: "Flag" },
      { key: "portOfRegistry", label: "Port of registry" },
      { key: "dateOfRegistry", label: "Date of registry" },
      { key: "owner", label: "Owner" },
      { key: "operator", label: "Operator" },
      { key: "callSign", label: "Call sign" },
      { key: "officialNo", label: "Official number" },
      { key: "imo", label: "IMO number" },
      { key: "shipType", label: "Type" },
      { key: "piClub", label: "P&I club" },
      { key: "hullCover", label: "Hull & machinery cover" },
      { key: "netTonnage", label: "Net tonnage" },
      { key: "grossTonnage", label: "Gross tonnage" },
      { key: "loa", label: "LOA (m)" },
      { key: "breadth", label: "Breadth (m)" },
      { key: "mainEngine", label: "Main engine" },
      { key: "depPort", label: "Departure port" },
      { key: "depDate", label: "Departure date" },
      { key: "arrPort", label: "Arrival port" },
      { key: "arrDate", label: "Arrival date" },
      { key: "voyageNo", label: "Voyage no" },
      { key: "nextPort", label: "Next port" },
      { key: "dpa", label: "DPA & contact" },
      { key: "cso", label: "CSO & contact" },
    ],
  },
  {
    id: "general-declaration",
    label: "📄 General Declaration",
    hint: "IMO FAL Form 1",
    kind: "form",
    fields: [
      { key: "shipType", label: "Name and type of ship" },
      { key: "imo", label: "IMO number" },
      { key: "callSign", label: "Call sign" },
      { key: "arrPort", label: "Port of arrival" },
      { key: "flag", label: "Flag state" },
      { key: "masterName", label: "Name of master" },
      { key: "certRegistry", label: "Certificate of registry (port:date:number)" },
      { key: "agent", label: "Agent name & contact" },
      { key: "grossTonnage", label: "Gross tonnage" },
      { key: "netTonnage", label: "Net tonnage" },
      { key: "berth", label: "Position in port (berth/station)" },
      { key: "voyageNo", label: "Voyage number" },
      { key: "lastPort", label: "Last port of call" },
    ],
  },
  {
    id: "mdh",
    label: "🏥 Health Declaration",
    hint: "Maritime Declaration of Health",
    kind: "form",
    fields: [
      { key: "port", label: "Submitted at the port of" },
      { key: "date", label: "Date" },
      { key: "shipName", label: "Name of ship" },
      { key: "imo", label: "Registration / IMO No" },
      { key: "fromPort", label: "Arriving from" },
      { key: "toPort", label: "Sailing to" },
      { key: "masterName", label: "Master's name" },
      { key: "flag", label: "Nationality / flag" },
      { key: "grossTonnage", label: "Gross tonnage" },
      { key: "netTonnage", label: "Net tonnage" },
      { key: "sanitationCert", label: "Sanitation certificate carried? (yes/no + expiry)" },
      { key: "illPersons", label: "Ill persons on board (name, age, symptoms, embarked)" },
      { key: "notes", label: "Other health notes" },
    ],
  },
  {
    id: "crew-arrival",
    label: "🛬 Crew List (Arrival)",
    hint: "IMO crew list — arrival",
    kind: "table",
    columns: [...CREW_COLS, { key: "passportNo", label: "Passport No" }, { key: "passportIssue", label: "Passport Issue State" }, { key: "passportExpiry", label: "Passport Expiry" }, { key: "seamanNo", label: "Seaman's Book No" }],
    importCrew: true,
  },
  {
    id: "crew-departure",
    label: "🛫 Crew List (Departure)",
    hint: "IMO crew list — departure (auto-fills from arrival)",
    kind: "table",
    columns: [...CREW_COLS, { key: "passportNo", label: "Passport No" }, { key: "passportIssue", label: "Passport Issue State" }, { key: "passportExpiry", label: "Passport Expiry" }, { key: "seamanNo", label: "Seaman's Book No" }],
    importCrew: true,
  },
  {
    id: "crew-effects",
    label: "🧳 Crew Effects",
    hint: "Dutiable effects declaration",
    kind: "table",
    columns: [{ key: "name", label: "Family Name, Given Name" }, { key: "rank", label: "Rank" }, { key: "dutiable", label: "Dutiable (NIL?)" }, { key: "description", label: "Effects Description" }],
    importCrew: true,
  },
  {
    id: "vaccination",
    label: "💉 Vaccination List",
    hint: "Crew vaccination dates",
    kind: "table",
    columns: [{ key: "name", label: "Family Name, Given Name" }, { key: "rank", label: "Rank" }, { key: "date", label: "Date Vaccinated" }],
    importCrew: true,
  },
  {
    id: "temperature",
    label: "🌡️ Temperature Log",
    hint: "Daily crew temperatures",
    kind: "table",
    columns: [{ key: "name", label: "Family Name, Given Name" }, { key: "rank", label: "Rank" }, { key: "temp", label: "Body Temp °C" }, { key: "date", label: "Date" }],
    importCrew: true,
  },
  {
    id: "cash-advance",
    label: "💵 Cash Advance",
    hint: "Crew advances USD/EUR + signature",
    kind: "table",
    columns: [{ key: "name", label: "Given Name, Family Name" }, { key: "rank", label: "Rank" }, { key: "usd", label: "USD" }, { key: "eur", label: "EUR" }, { key: "signed", label: "Signed ✓" }],
    importCrew: true,
  },
  {
    id: "currency",
    label: "💱 Currency Declaration",
    hint: "Personal cash per crew (USD/EUR/TL/other)",
    kind: "table",
    columns: [{ key: "name", label: "Family Name, Given Name" }, { key: "rank", label: "Rank" }, { key: "usd", label: "USD" }, { key: "eur", label: "EUR" }, { key: "tl", label: "TL" }, { key: "other", label: "Other" }],
    importCrew: true,
  },
  {
    id: "last-ports",
    label: "🕘 Last 10 Ports",
    hint: "Last ports of call",
    kind: "table",
    columns: [{ key: "port", label: "Port Name" }, { key: "country", label: "Country" }, { key: "unlocode", label: "UNLOCODE" }, { key: "gisis", label: "GISIS" }, { key: "secLevel", label: "Security Level" }, { key: "arrDate", label: "Arrival" }, { key: "depDate", label: "Departure" }],
    importVoyages: true,
  },
  {
    id: "ship-store",
    label: "📦 Ship's Stores",
    hint: "Bonded stores declaration (FAL 3)",
    kind: "table",
    columns: [{ key: "item", label: "Item" }, { key: "qty", label: "Quantity" }, { key: "unit", label: "Unit" }, { key: "stowage", label: "Place of Storage" }],
    seedRows: [
      { item: "Marine Gas Oil", qty: "", unit: "MTS", stowage: "Engine" },
      { item: "HS Fuel Oil", qty: "", unit: "MTS", stowage: "Engine" },
      { item: "Fresh Water", qty: "", unit: "MTS", stowage: "Engine" },
      { item: "Lub Oil", qty: "", unit: "LTRS", stowage: "Engine" },
      { item: "Dry Provision", qty: "", unit: "KG", stowage: "Accommodation" },
      { item: "Parachute Rocket", qty: "", unit: "Pcs", stowage: "Bridge" },
      { item: "Line Throwing Apparatus", qty: "", unit: "Pcs", stowage: "Bridge" },
      { item: "MOB Marker", qty: "", unit: "Pcs", stowage: "Bridge" },
    ],
  },
  {
    id: "nil-list",
    label: "🚫 NIL List",
    hint: "Stowaways, arms, animals, drugs, drones",
    kind: "table",
    columns: [{ key: "item", label: "List" }, { key: "qty", label: "Quantity / Availability" }],
    seedRows: [
      { item: "Stowaways", qty: "NIL" },
      { item: "Arms & Ammunitions", qty: "NIL" },
      { item: "Animals & Plants", qty: "NIL" },
      { item: "Passengers", qty: "NIL" },
      { item: "Drugs & Narcotics", qty: "NIL" },
      { item: "Drones", qty: "NIL" },
    ],
  },
  {
    id: "passengers",
    label: "🧍 Passengers",
    hint: "Passenger list (FAL 6)",
    kind: "table",
    columns: [...CREW_COLS.slice(0, 3), { key: "birthDate", label: "Date/Place of Birth" }, { key: "doc", label: "Identity Document" }],
  },
  {
    id: "expired-medicine",
    label: "💊 Expired Medicine",
    hint: "Name + qty + expiry",
    kind: "table",
    columns: [{ key: "name", label: "Medicine" }, { key: "qty", label: "Quantity" }, { key: "expiry", label: "Expiry Date" }],
  },
  {
    id: "narcotics",
    label: "🔒 Narcotics",
    hint: "Controlled medicines + storage",
    kind: "table",
    columns: [{ key: "name", label: "Medicine" }, { key: "qty", label: "Quantity" }, { key: "expiry", label: "Expiry Date" }, { key: "stowage", label: "Place of Storage" }],
  },
  {
    id: "ship-cash",
    label: "💰 Ship's Cash",
    hint: "Cash on board per currency",
    kind: "table",
    columns: [{ key: "currency", label: "Currency" }, { key: "qty", label: "Quantity" }, { key: "stowage", label: "Place of Storage" }],
    seedRows: [
      { currency: "EURO", qty: "", stowage: "Ship's safe" },
      { currency: "DOLLAR", qty: "", stowage: "Ship's safe" },
    ],
  },
  {
    id: "visitors",
    label: "📋 Visitors",
    hint: "Shore visitors log",
    kind: "table",
    columns: [{ key: "name", label: "Family Name, Given Name" }, { key: "rank", label: "Rank / Title" }, { key: "nationality", label: "Nationality" }, { key: "doc", label: "ID Document + No" }],
  },
];

export function blankData(mod: PortDocModule): PortDocData {
  const fields: Record<string, string> = {};
  for (const f of mod.fields ?? []) fields[f.key] = "";
  const rows = (mod.seedRows ?? []).map((r) => ({ ...r }));
  return { fields, rows };
}

export async function getPortDoc(contractId: string, module: string) {
  const rows = await db.portdocs.where("contractId").equals(contractId).toArray();
  return rows.find((r) => r.module === module);
}

export async function savePortDoc(contractId: string, module: string, data: PortDocData) {
  const now = new Date().toISOString();
  await db.portdocs.put({
    id: `${contractId}_pd_${module}`,
    contractId,
    module,
    data: JSON.stringify(data),
    updatedAt: now,
  });
}

// Header prefill from the active contract (vessel data only — never personal data).
export function prefillFromContract(mod: PortDocModule, c: Record<string, unknown>): Record<string, string> {
  const f: Record<string, string> = {};
  const get = (k: string) => (typeof c[k] === "string" ? (c[k] as string) : "");
  const map: Record<string, string> = {
    shipName: get("shipName"),
    imo: get("imo"),
    flag: "",
    shipType: get("shipType"),
    depPort: get("depPort"),
    arrPort: get("destPort"),
    voyageNo: "",
    masterName: "",
  };
  for (const fld of mod.fields ?? []) {
    if (map[fld.key] !== undefined) f[fld.key] = map[fld.key];
  }
  return f;
}

// Latest crew-accounts month → name/rank rows (user's own data, same device).
export async function crewRowsFor(contractId: string): Promise<{ name: string; rank: string }[]> {
  const rows = await db.crewRows.where("contractId").equals(contractId).toArray();
  if (!rows.length) return [];
  const months = Array.from(new Set(rows.map((r) => r.month))).sort().reverse();
  const latest = months[0];
  return rows
    .filter((r) => r.month === latest)
    .sort((a, b) => a.order - b.order)
    .map((r) => ({ name: r.name || "", rank: r.rank || "" }));
}

// Closed voyage legs → port rows.
export async function voyageRowsFor(contractId: string): Promise<Record<string, string>[]> {
  const voyages = await db.voyages.where("contractId").equals(contractId).toArray();
  const out: Record<string, string>[] = [];
  const seen = new Set<string>();
  for (const v of voyages.filter((x) => x.status === "closed")) {
    const dep = { port: v.fromPort || "", country: "", unlocode: v.fromCode || "", gisis: "", secLevel: "1", arrDate: "", depDate: (v.fromTime || "").slice(0, 10) };
    const arr = { port: v.toPort || "", country: "", unlocode: v.toCode || "", gisis: "", secLevel: "1", arrDate: (v.toTime || "").slice(0, 10), depDate: "" };
    for (const r of [dep, arr]) {
      const k = `${r.port}__${r.arrDate}__${r.depDate}`;
      if (r.port && !seen.has(k)) {
        seen.add(k);
        out.push(r);
      }
    }
  }
  return out;
}
