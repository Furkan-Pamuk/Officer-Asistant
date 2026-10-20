export type Department = "deck" | "engine" | "both";
export type InspectionTypeId = "flag" | "psc" | "uscg" | "class" | "sire" | "cdi" | "sanitation" | "ism-isps";

export interface InspectionType {
  id: InspectionTypeId;
  name: string;
  short: string;
  description: string;
  source: string;
  sourceUrl: string;
}

export interface CheckCard {
  id: string;
  inspection: InspectionTypeId;
  department: Department;
  category: string;
  title: string;
  checkPoint: string;
  howToPrepare: string;
  evidence: string;
  reference: string;
  flags?: string[];
}

export type ChecklistGroup = "bridge" | "cargo" | "engine" | "deck";

export interface JobChecklistTemplate {
  id: string;
  title: string;
  description: string;
  department: Department;
  group: ChecklistGroup;
  items: string[];
}

export interface JobChecklist extends JobChecklistTemplate {
  done: boolean[];
  custom: boolean;
  updatedAt: string;
  contractId?: string;
  port?: string;
  logDate?: string;
  logTime?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  abbr: string;
  description: string;
  link: string;
  inspections: InspectionTypeId[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  audioDataUrl?: string;
  transcript?: string;
  remindAt?: string;
  reminded?: boolean;
  updatedAt: string;
  contractId?: string;
}

export type RequestTab = "galley" | "stationery" | "spare-deck" | "spare-engine" | "other";

export interface Contract {
  id: string;
  shipName: string;
  shipType: string;
  joinPort: string;
  signOnDate: string;
  signOffDate: string;
  estimatedEndDate?: string;
  imo?: string;
  flag?: string;
  depPort?: string;
  destPort?: string;
  eta?: string;
  navStatus?: string;
  rank: string;
  company: string;
  status: "active" | "archived";
  gibsDone?: boolean;
  gibsDoneAt?: string;
  gibsOffDone?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRequest {
  id: string;
  tab: RequestTab;
  item: string;
  code?: string;
  quantity: string;
  unit: string;
  status: "draft" | "requested" | "approved" | "delivered";
  note: string;
  updatedAt: string;
  contractId?: string;
}

export interface EditorQuestion {
  id: string;
  question: string;
  inspection: InspectionTypeId;
  vesselType: string;
  answer: string | null;
  createdAt: string;
  contractId?: string;
}

export type TodoInterval = "daily" | "weekly" | "monthly" | "once";

export const RANKS = ["Master", "Chief Officer", "2nd Officer", "3rd Officer", "Deck Cadet", "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "ETO", "Bosun", "AB", "Oiler", "Fitter", "Engine Cadet", "Cook"];

const ENGINE_RANKS = ["Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer", "ETO", "Oiler", "Fitter", "Engine Cadet"];

export function departmentForRank(rank: string): Department | "" {
  if (!rank) return "";
  return ENGINE_RANKS.includes(rank) ? "engine" : "deck";
}

export interface TodoTask {
  id: string;
  contractId: string;
  listId?: string;
  title: string;
  interval: TodoInterval;
  ranks: string[]; // empty = all ranks
  active: boolean;
  custom: boolean;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  contractId: string;
  name: string;
  interval: TodoInterval;
  ranks: string[]; // empty = all ranks
  note: string;
  archived: boolean;
  custom: boolean;
  updatedAt: string;
}

export interface TodoLog {
  id: string; // taskId__periodKey
  taskId: string;
  contractId: string;
  periodKey: string;
  completedAt: string;
}

export interface Profile {
  id: string; // always "me"
  displayName: string;
  rank: string;
  department: Department | "";
  photoDataUrl: string;
  updatedAt: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  kg: number;
  createdAt: string;
}

export interface Med {
  id: string;
  contractId?: string;
  name: string;
  quantity: string;
  note: string;
  packed: boolean;
  updatedAt: string;
}

export interface CatalogueItem {
  code: string; // IMPA code, primary key
  name: string;
  unit: string;
  category: string;
}

export interface WaterDay {
  id: string; // YYYY-MM-DD
  ml: number;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  channel: string;
  text: string;
  contractId?: string;
  createdAt: string;
}

export interface CrewRow {
  id: string;
  contractId: string;
  month: string; // YYYY-MM
  rank: string;
  name: string;
  order: number;
  advUSD: number;
  advEUR: number;
  advGBP: number;
  cigCartons: number;
  cigUnit: number; // USD per carton
  updatedAt: string;
}

export interface SavedListItem {
  item: string;
  code: string;
  quantity: string;
  unit: string;
}

export interface SavedList {
  id: string;
  contractId: string;
  name: string;
  scope: string;
  items: SavedListItem[];
  createdAt: string;
}

export interface CrewSnap {
  id: string;
  contractId: string;
  name: string;
  month: string;
  rows: CrewRow[];
  createdAt: string;
}

export interface VesselCache {
  imo: string;
  data: string; // normalized VesselResult JSON
  updatedAt: string;
}

export interface ProviderUsage {
  id: string; // YYYY-MM
  count: number;
}

export interface CvRef {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  workplace: string;
}

export interface CvLang {
  lang: string;
  level: string;
}

export interface CvData {
  id: string; // "me"
  template: string;
  contact: { email: string; phone: string; nationality: string; dob: string };
  certs: Record<string, { on: boolean; expiry: string }>;
  motivation: string;
  refs: CvRef[];
  langs: CvLang[];
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  contractId: string;
  time: string; // ISO
  lat: number | null;
  lon: number | null;
  tz: string;
  compass: string; // course steered
  windKn: string;
  windDir: string;
  waveM: string;
  visKm: string;
  dryT: string;
  wetT: string;
  variation: string;
  note: string;
  auto: boolean;
}

export interface PortVhf {
  portCode: string;
  vts: string;
  pilot: string;
  harbour: string;
  portControl: string;
  tideNote: string;
  updatedAt: string;
}

export interface Voyage {
  id: string;
  contractId: string;
  no: number;
  fromPort: string;
  fromCode: string;
  fromTime: string;
  toPort: string;
  toCode: string;
  toTime: string;
  status: "open" | "closed";
}

export type BellSide = "engine" | "thruster" | "event";

export interface BellEntry {
  id: string;
  contractId: string;
  side: BellSide;
  command: string;
  at: string; // ISO timestamp of the order
  lat?: number | null;
  lon?: number | null;
  fix?: "gps" | "cached" | "none";
}

export interface BellArchive {
  id: string;
  contractId: string;
  title: string;
  savedAt: string; // ISO timestamp of the snapshot
  count: number;
  entries: BellEntry[];
}

// Crew wall post (Sizden Gelenler). Photos live on-device (Dexie) until the
// shared backend lands; `status` is forward-compatible with server moderation.
export interface CrewPost {
  id: string;
  author: string;
  title: string;
  text: string;
  port?: string;
  photo?: string | null; // compressed JPEG data URL
  date: string; // yyyy-mm-dd
  status: "approved" | "pending";
  createdAt: string; // ISO
}

export interface PortDocRow {
  id: string; // `${contractId}_pd_${module}`
  contractId: string;
  module: string;
  data: string; // JSON PortDocData { fields, rows }
  updatedAt: string;
}

export interface PortDocData {
  fields: Record<string, string>;
  rows: Record<string, string>[];
}

export type InventoryListId = "flag" | "stationery" | "publications" | "medicine";

export interface InventoryItem {
  id: string;
  contractId: string;
  list: InventoryListId;
  name: string;
  qty: string;
  unit: string;
  expiry?: string; // YYYY-MM-DD, medicine chest only
  edition?: string; // e.g. "2024 Ed.", publications only
  custom: boolean;
  updatedAt: string;
}

export type MenuMeal = "breakfast" | "lunch" | "dinner";

export interface Dish {
  id: string;
  name: string;
  kcal: number; // approx per portion
  meal: MenuMeal;
  cuisine: string; // turkish | indian | filipino | russian | world
  tags: string[];
  custom: boolean;
}

export const CUISINES = [
  { id: "all", label: "All cuisines" },
  { id: "turkish", label: "🇹🇷 Turkish" },
  { id: "indian", label: "🇮🇳 Indian" },
  { id: "filipino", label: "🇵🇭 Filipino" },
  { id: "russian", label: "🇷🇺 Russian" },
  { id: "world", label: "🌍 World" },
];

export interface WeekPlan {
  id: string; // contractId__weekStart
  contractId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  slots: Record<string, { text: string; kcal: number }>; // key: `${dayIndex}-${meal}`
  updatedAt: string;
}

export interface MenuSnap {
  id: string;
  contractId: string;
  name: string;
  slots: Record<string, { text: string; kcal: number }>;
  createdAt: string;
}
