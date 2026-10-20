import { db, uid } from "./db";
import type { InventoryItem, InventoryListId } from "./types";

export const INVENTORY_LISTS: { id: InventoryListId; label: string; hint: string }[] = [
  { id: "flag", label: "🚩 Flag", hint: "Ensigns, signal flags & day shapes" },
  { id: "stationery", label: "📎 Stationery", hint: "Bridge & office consumables" },
  { id: "publications", label: "📚 Publications", hint: "Charts, books & conventions" },
  { id: "medicine", label: "💊 Medicine", hint: "Medicine chest with expiry dates" },
];

interface Tpl {
  name: string;
  unit: string;
}

const LIB_KEY = "oa-inv-lib-v";
// Bump this every time INVENTORY_TEMPLATES changes.
const LIB_VERSION = 3;

let invSeedLock: Promise<void> | null = null;

// Serialize seeds: concurrent mounts used to read the same rows and insert
// the same presets twice.
export function seedInventoryForContract(contractId: string): Promise<void> {
  invSeedLock = (invSeedLock ?? Promise.resolve())
    .then(() => seedInventoryInner(contractId))
    .catch(() => {});
  return invSeedLock;
}

// Quantities ship as "0" — the crew counts and fills them aboard.
export const INVENTORY_TEMPLATES: Record<InventoryListId, Tpl[]> = {
  flag: [
    { name: "National Ensign (stern)", unit: "pcs" },
    { name: "Spare National Ensign", unit: "pcs" },
    { name: "House / Company Flag", unit: "pcs" },
    { name: "Courtesy Flags (assorted ports)", unit: "pcs" },
    { name: "Flag – Alfa (A)", unit: "pcs" },
    { name: "Flag – Bravo (B)", unit: "pcs" },
    { name: "Flag – Charlie (C)", unit: "pcs" },
    { name: "Flag – Delta (D)", unit: "pcs" },
    { name: "Flag – Echo (E)", unit: "pcs" },
    { name: "Flag – Foxtrot (F)", unit: "pcs" },
    { name: "Flag – Golf (G)", unit: "pcs" },
    { name: "Flag – Hotel (H)", unit: "pcs" },
    { name: "Flag – India (I)", unit: "pcs" },
    { name: "Flag – Juliett (J)", unit: "pcs" },
    { name: "Flag – Kilo (K)", unit: "pcs" },
    { name: "Flag – Lima (L)", unit: "pcs" },
    { name: "Flag – Mike (M)", unit: "pcs" },
    { name: "Flag – November (N)", unit: "pcs" },
    { name: "Flag – Oscar (O)", unit: "pcs" },
    { name: "Flag – Papa (P)", unit: "pcs" },
    { name: "Flag – Quebec (Q)", unit: "pcs" },
    { name: "Flag – Romeo (R)", unit: "pcs" },
    { name: "Flag – Sierra (S)", unit: "pcs" },
    { name: "Flag – Tango (T)", unit: "pcs" },
    { name: "Flag – Uniform (U)", unit: "pcs" },
    { name: "Flag – Victor (V)", unit: "pcs" },
    { name: "Flag – Whiskey (W)", unit: "pcs" },
    { name: "Flag – X-ray (X)", unit: "pcs" },
    { name: "Flag – Yankee (Y)", unit: "pcs" },
    { name: "Flag – Zulu (Z)", unit: "pcs" },
    { name: "Numeral Pennant 0 (Zero)", unit: "pcs" },
    { name: "Numeral Pennant 1 (Wun)", unit: "pcs" },
    { name: "Numeral Pennant 2 (Too)", unit: "pcs" },
    { name: "Numeral Pennant 3 (Tree)", unit: "pcs" },
    { name: "Numeral Pennant 4 (Fower)", unit: "pcs" },
    { name: "Numeral Pennant 5 (Fife)", unit: "pcs" },
    { name: "Numeral Pennant 6 (Six)", unit: "pcs" },
    { name: "Numeral Pennant 7 (Seven)", unit: "pcs" },
    { name: "Numeral Pennant 8 (Ait)", unit: "pcs" },
    { name: "Numeral Pennant 9 (Niner)", unit: "pcs" },
    { name: "1st Substitute Pennant", unit: "pcs" },
    { name: "2nd Substitute Pennant", unit: "pcs" },
    { name: "3rd Substitute Pennant", unit: "pcs" },
    { name: "Code / Answering Pennant", unit: "pcs" },
    { name: "Pilot Flag (Hotel)", unit: "pcs" },
    { name: "Quarantine Flag (Quebec)", unit: "pcs" },
    { name: "Day Shapes Set (ball, diamond, cone)", unit: "set" },
    { name: "Ensign Staff / Flag Halyards", unit: "pcs" },
    { name: "Flag – Panama", unit: "pcs" },
    { name: "Flag – Liberia", unit: "pcs" },
    { name: "Flag – Marshall Islands", unit: "pcs" },
    { name: "Flag – Malta", unit: "pcs" },
    { name: "Flag – Bahamas", unit: "pcs" },
    { name: "Flag – Cyprus", unit: "pcs" },
    { name: "Flag – Singapore", unit: "pcs" },
    { name: "Flag – Hong Kong", unit: "pcs" },
    { name: "Flag – Greece", unit: "pcs" },
    { name: "Flag – Türkiye", unit: "pcs" },
    { name: "Flag – Norway", unit: "pcs" },
    { name: "Flag – Portugal (Madeira)", unit: "pcs" },
    { name: "Flag – Isle of Man", unit: "pcs" },
    { name: "Flag – Gibraltar", unit: "pcs" },
    { name: "Flag – Bermuda", unit: "pcs" },
    { name: "Flag – Cayman Islands", unit: "pcs" },
    { name: "Flag – Antigua and Barbuda", unit: "pcs" },
    { name: "Flag – St. Vincent & Grenadines", unit: "pcs" },
    { name: "Flag – Belize", unit: "pcs" },
    { name: "Flag – Palau", unit: "pcs" },
    { name: "Flag – Cook Islands", unit: "pcs" },
    { name: "Flag – Vanuatu", unit: "pcs" },
    { name: "Flag – Sierra Leone", unit: "pcs" },
    { name: "Flag – Togo", unit: "pcs" },
    { name: "Flag – Comoros", unit: "pcs" },
    { name: "Flag – Tanzania", unit: "pcs" },
    { name: "Flag – Philippines", unit: "pcs" },
    { name: "Flag – China", unit: "pcs" },
    { name: "Flag – Japan", unit: "pcs" },
    { name: "Flag – South Korea", unit: "pcs" },
    { name: "Flag – Vietnam", unit: "pcs" },
    { name: "Flag – Thailand", unit: "pcs" },
    { name: "Flag – Malaysia", unit: "pcs" },
    { name: "Flag – Indonesia", unit: "pcs" },
    { name: "Flag – India", unit: "pcs" },
    { name: "Flag – Bangladesh", unit: "pcs" },
    { name: "Flag – Russia", unit: "pcs" },
    { name: "Flag – Ukraine", unit: "pcs" },
    { name: "Flag – Georgia", unit: "pcs" },
    { name: "Flag – Croatia", unit: "pcs" },
    { name: "Flag – Egypt", unit: "pcs" },
    { name: "Flag – Morocco", unit: "pcs" },
    { name: "Flag – Nigeria", unit: "pcs" },
    { name: "Flag – South Africa", unit: "pcs" },
    { name: "Flag – USA", unit: "pcs" },
    { name: "Flag – Canada", unit: "pcs" },
    { name: "Flag – Brazil", unit: "pcs" },
    { name: "Flag – Chile", unit: "pcs" },
    { name: "Flag – United Kingdom", unit: "pcs" },
    { name: "Flag – Netherlands", unit: "pcs" },
    { name: "Flag – Germany", unit: "pcs" },
    { name: "Flag – France", unit: "pcs" },
    { name: "Flag – Spain", unit: "pcs" },
    { name: "Flag – Italy", unit: "pcs" },
    { name: "Flag – Denmark", unit: "pcs" },
    { name: "Flag – Sweden", unit: "pcs" },
    { name: "Flag – Finland", unit: "pcs" },
    { name: "Flag – Poland", unit: "pcs" },
    { name: "Flag – Australia", unit: "pcs" },
    { name: "Flag – New Zealand", unit: "pcs" },
  ],
  stationery: [
    { name: "A4 Copy Paper (reams)", unit: "reams" },
    { name: "Ballpoint Pens (blue/black)", unit: "pcs" },
    { name: "Notebooks (A4/A5)", unit: "pcs" },
    { name: "Ring Binders / Files", unit: "pcs" },
    { name: "Envelopes (DL/C4)", unit: "pcs" },
    { name: "Printer Toner / Ink Cartridges", unit: "pcs" },
    { name: "Stapler", unit: "pcs" },
    { name: "Staples (boxes)", unit: "box" },
    { name: "Paper Clips (boxes)", unit: "box" },
    { name: "Whiteboard / Flipchart Markers", unit: "pcs" },
    { name: "Highlighters", unit: "pcs" },
    { name: "Scissors", unit: "pcs" },
    { name: "Packing / Scotch Tape Rolls", unit: "pcs" },
    { name: "Batteries AA / AAA (packs)", unit: "pack" },
  ],
  publications: [
    { name: "ENC Permits / AVCS Folios", unit: "folios" },
    { name: "Paper Charts (portfolio)", unit: "charts" },
    { name: "Admiralty Sailing Directions", unit: "vols" },
    { name: "ALRS NP 281–282 (Radio Signals)", unit: "vols" },
    { name: "Tide Tables NP 201 / 202", unit: "vols" },
    { name: "Nautical Almanac (current year)", unit: "pcs" },
    { name: "Admiralty List of Lights", unit: "vols" },
    { name: "IAMSAR Manual Vol III", unit: "pcs" },
    { name: "SOLAS Consolidated Edition", unit: "pcs" },
    { name: "MARPOL Consolidated Edition", unit: "pcs" },
    { name: "STCW Convention & Code", unit: "pcs" },
    { name: "COLREGs (Rules of the Road)", unit: "pcs" },
    { name: "IMDG Code + Supplement", unit: "sets" },
    { name: "ISM Code & Guidelines", unit: "pcs" },
    { name: "ISPS Code", unit: "pcs" },
    { name: "MLC 2006 Convention Text", unit: "pcs" },
  ],
  medicine: [
    { name: "Paracetamol 500mg (tabs)", unit: "tabs" },
    { name: "Ibuprofen 400mg (tabs)", unit: "tabs" },
    { name: "Amoxicillin 500mg (caps)", unit: "caps" },
    { name: "Ciprofloxacin 500mg (tabs)", unit: "tabs" },
    { name: "Oral Rehydration Salts (sachets)", unit: "pcs" },
    { name: "Cetirizine 10mg (antihistamine)", unit: "tabs" },
    { name: "Dimenhydrinate 50mg (seasickness)", unit: "tabs" },
    { name: "Antacid Tablets", unit: "tabs" },
    { name: "Hydrocortisone Cream 1%", unit: "tubes" },
    { name: "Povidone-Iodine Antiseptic", unit: "btl" },
    { name: "Sterile Gauze Rolls + Compresses", unit: "pcs" },
    { name: "Adhesive Plasters (assorted box)", unit: "box" },
    { name: "Elastic (Crepe) Bandages", unit: "pcs" },
    { name: "Digital Thermometer", unit: "pcs" },
    { name: "Disposable Gloves (boxes)", unit: "box" },
    { name: "Burn Gel Dressings", unit: "pcs" },
    { name: "Eye Wash Pods (sterile)", unit: "pcs" },
    { name: "Adrenaline Auto-Injector", unit: "pcs" },
    { name: "Controlled Medicines (per flag list)", unit: "sets" },
  ],
};

async function seedInventoryInner(contractId: string) {
  const now = new Date().toISOString();
  const existing = await db.inventory.where("contractId").equals(contractId).toArray();
  if (existing.length === 0) {
    const rows: InventoryItem[] = [];
    (Object.keys(INVENTORY_TEMPLATES) as InventoryListId[]).forEach((list) => {
      INVENTORY_TEMPLATES[list].forEach((t, i) => {
        rows.push({
          id: `${contractId}_inv_${list}_${i}`,
          contractId,
          list,
          name: t.name,
          qty: "0",
          unit: t.unit,
          custom: false,
          updatedAt: now,
        });
      });
    });
    await db.inventory.bulkPut(rows).catch(() => {});
    try {
      localStorage.setItem(LIB_KEY, String(LIB_VERSION));
    } catch {
      /* ignore */
    }
    return;
  }
  // One-time merge of newly shipped templates into existing contracts.
  // Matches by title; rows the user deleted return once — delete again after.
  let v = 1;
  try {
    v = Number(localStorage.getItem(LIB_KEY) ?? 1) || 1;
  } catch {
    /* ignore */
  }
  if (v >= LIB_VERSION) return;
  // repair: drop exact duplicates (same list+name) left by earlier concurrent
  // seeds — keep a row the crew already counted, else the first one.
  // Also drop the three set rows replaced by individual flags.
  {
    const byKey = new Map<string, typeof existing>();
    for (const r of existing) {
      const k = `${r.list}__${r.name}`;
      const arr = byKey.get(k);
      if (arr) arr.push(r);
      else byKey.set(k, [r]);
    }
    const dead: string[] = [];
    for (const [, group] of byKey) {
      if (group.length < 2) continue;
      const keep = group.find((r) => r.qty !== "0") ?? group[0];
      for (const r of group) if (r.id !== keep.id && !dead.includes(r.id)) dead.push(r.id);
    }
    const OBSOLETE = new Set([
      "flag__Signal Alphabet Flags A–Z (set of 26)",
      "flag__Numeral Pennants 0–9 (set of 10)",
      "flag__Substitute Pennants 1st–3rd",
    ]);
    for (const r of existing) {
      if (!r.custom && OBSOLETE.has(`${r.list}__${r.name}`) && !dead.includes(r.id)) dead.push(r.id);
    }
    for (const id of dead) await db.inventory.delete(id).catch(() => {});
    for (let i = existing.length - 1; i >= 0; i--) {
      if (dead.includes(existing[i].id)) existing.splice(i, 1);
    }
  }
  const have = new Set(existing.map((r) => `${r.list}__${r.name}`));
  const toAdd: InventoryItem[] = [];
  (Object.keys(INVENTORY_TEMPLATES) as InventoryListId[]).forEach((list) => {
    INVENTORY_TEMPLATES[list].forEach((t) => {
      if (!have.has(`${list}__${t.name}`)) {
        have.add(`${list}__${t.name}`);
        toAdd.push({
          id: uid("inv"),
          contractId,
          list,
          name: t.name,
          qty: "0",
          unit: t.unit,
          custom: false,
          updatedAt: now,
        });
      }
    });
  });
  if (toAdd.length) await db.inventory.bulkPut(toAdd).catch(() => {});
  try {
    localStorage.setItem(LIB_KEY, String(LIB_VERSION));
  } catch {
    /* ignore */
  }
}
