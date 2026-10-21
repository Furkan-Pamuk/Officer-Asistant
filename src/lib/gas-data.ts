// Liquefied gas cargo booklet (LPG / LNG / chemical gases, IGC Code).
// Physical constants are standard reference values (indicative only).
// IGC ship types vary by design — confirm in the current IGC Code Ch.19;
// the SDS and terminal/ship compatibility always govern.

export interface GasCargo {
  slug: string;
  name: string;
  synonyms: string[];
  un: string;
  formula: string;
  boiling: string;
  density: string;
  flammability: string;
  toxic: boolean;
  tlv: string;
  health: string;
  segregation: string;
  detection: string;
  carriage: string;
  notes?: string;
}

export const GASES: GasCargo[] = [
  {
    slug: "propane", name: "Propane", synonyms: ["LPG (propane-rich)", "R290 (refrigerant)"],
    un: "1978", formula: "C₃H₈", boiling: "−42.1 °C", density: "0.58 (liquid)",
    flammability: "LEL 2.1% · range 2.1–9.5%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "Non-toxic but displaces oxygen; cold burns from liquid; narcotic at very high levels.",
    segregation: "Oxidizers, ignition sources of every kind.",
    detection: "IR/LEL (propane-calibrated) + O₂ meter.",
    carriage: "Fully refrigerated, semi-pressurized or pressurized.",
  },
  {
    slug: "n-butane", name: "n-Butane", synonyms: ["Butane", "R600"],
    un: "1011", formula: "C₄H₁₀", boiling: "−0.5 °C", density: "0.60 (liquid)",
    flammability: "LEL 1.8% · range 1.8–8.4%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "Non-toxic but asphyxiant; cold burns; narcotic at high levels.",
    segregation: "Oxidizers, ignition sources.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Semi-pressurized or pressurized (boils near ambient).",
  },
  {
    slug: "isobutane", name: "Isobutane", synonyms: ["2-Methylpropane", "R600a"],
    un: "1969", formula: "C₄H₁₀", boiling: "−11.7 °C", density: "0.56 (liquid)",
    flammability: "LEL 1.8% · range 1.8–8.4%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "As n-butane; refrigerant-grade purity matters for odorisation (often odorless).",
    segregation: "Oxidizers, ignition sources.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Semi-pressurized or pressurized.",
  },
  {
    slug: "lpg-mix", name: "LPG (commercial propane/butane mix)", synonyms: ["Liquefied petroleum gas", "Bottled gas (bulk)"],
    un: "1965", formula: "C3–C4 mixture", boiling: "≈−25 to −42 °C (mix-dependent)", density: "0.55–0.58 (liquid)",
    flammability: "LEL ≈2% · range ≈2–10% (mix-dependent)", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "As propane/butane; commercial grades usually odorised (ethyl mercaptan) — lack of smell does NOT mean safe.",
    segregation: "Oxidizers, ignition sources.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Fully refrigerated, semi-pressurized or pressurized.",
    notes: "Composition varies by source/season — confirm propane/butane ratio and boiling point with the shipper.",
  },
  {
    slug: "propylene", name: "Propylene", synonyms: ["Propene", "Polymer-grade / chemical-grade / refinery-grade"],
    un: "1077", formula: "C₃H₆", boiling: "−47.6 °C", density: "0.61 (liquid)",
    flammability: "LEL 2.0% · range 2.0–11.1%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs (anaesthetic at high levels)",
    health: "Flammable asphyxiant; anaesthetic above ~10,000 ppm. Polymer grade must stay inhibitor-free — confirm shipper requirements.",
    segregation: "Oxidizers, acids, ignition sources; confirm polymerisation precautions with shipper.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Fully refrigerated or semi-pressurized.",
  },
  {
    slug: "ethylene", name: "Ethylene", synonyms: ["Ethene", "R1150"],
    un: "1962", formula: "C₂H₄", boiling: "−103.7 °C", density: "0.57 (liquid)",
    flammability: "LEL 2.7% · range 2.7–36% (very wide)", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs (anaesthetic at high levels)",
    health: "Flammable asphyxiant with a very wide explosive range; sweet faint odour only at dangerous levels.",
    segregation: "Oxidizers, ignition sources; keep from air ingress in cargo system.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Fully refrigerated (ethylene carriers; semi-pressurized in some designs).",
  },
  {
    slug: "lng", name: "LNG (liquefied natural gas)", synonyms: ["Liquefied methane", "Natural gas, refrigerated liquid"],
    un: "1972", formula: "CH₄ (+ethane/propane)", boiling: "−162 °C", density: "0.45 (liquid)",
    flammability: "LEL 5% · range 5–15%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "Cryogenic burns; asphyxiant; burns only in its flammable window — rich clouds above deck can drift and flash back.",
    segregation: "Ignition sources; air ingress (rollover management per ship procedures).",
    detection: "IR/LEL (methane-calibrated) + O₂ meter.",
    carriage: "Fully refrigerated at atmospheric pressure (Moss / membrane).",
    notes: "Rollover: stratified layers can mix suddenly with large boil-off — follow the ship's rollover procedures and custody-transfer manual.",
  },
  {
    slug: "ethane", name: "Ethane", synonyms: ["R170"],
    un: "1035", formula: "C₂H₆", boiling: "−88.6 °C", density: "0.55 (liquid)",
    flammability: "LEL 3.0% · range 3.0–12.4%", toxic: false,
    tlv: "Simple asphyxiant — O₂ monitoring governs",
    health: "Flammable asphyxiant; Shale-gas trade (VLEC) cargo.",
    segregation: "Oxidizers, ignition sources.",
    detection: "IR/LEL + O₂ meter.",
    carriage: "Fully refrigerated (VLEC) or semi-pressurized.",
  },
  {
    slug: "ammonia-gas", name: "Ammonia, anhydrous", synonyms: ["Anhydrous ammonia", "R717 (refrigerant)"],
    un: "1005", formula: "NH₃", boiling: "−33.3 °C", density: "0.61 (liquid)",
    flammability: "LEL 15% · range 15–28% (hard to ignite, burns in confined vapour)", toxic: true,
    tlv: "25 ppm TWA · STEL 35 (TLV)",
    health: "Toxic + corrosive vapours — eyes and airways; liquid causes freeze/corrosive burns. No antidote: fresh air, oxygen, hospital.",
    segregation: "Acids, halogens, mercury, copper alloys. Notorious for stress-corrosion cracking of steels — certified materials and procedures only.",
    detection: "Ammonia tube / electrochemical NH₃ sensor (ppm range).",
    carriage: "Fully refrigerated or semi-pressurized.",
    notes: "Fertilizer and future-fuel trade; human nose fatigues — never trust smell, trust instruments.",
  },
  {
    slug: "butadiene-gas", name: "Butadiene, inhibited (1,3-Butadiene)", synonyms: ["Divinyl", "Bivinyl"],
    un: "1010", formula: "C₄H₆", boiling: "−4.4 °C", density: "0.62 (liquid)",
    flammability: "LEL 2.0% · range 2.0–11.5%", toxic: true,
    tlv: "2 ppm TWA (TLV)",
    health: "Carcinogen; forms explosive popcorn polymer with rust/air — inhibitor (TBC) and oxygen control essential.",
    segregation: "Air/oxygen ingress, rust, oxidizers, acids.",
    detection: "Butadiene tube (low range); LEL meter.",
    carriage: "Semi-pressurized or pressurized.",
    notes: "Gas-carrier procedures (IGC): inerting, popcorn-polymer watch.",
  },
  {
    slug: "vcm", name: "Vinyl chloride (VCM)", synonyms: ["Chloroethylene", "Vinyl chloride monomer"],
    un: "1086", formula: "C₂H₃Cl", boiling: "−13.4 °C", density: "0.91 (liquid)",
    flammability: "LEL 3.6% · range 3.6–33%", toxic: true,
    tlv: "1 ppm TWA (TLV)",
    health: "Carcinogen (liver); narcotic at high levels. Polymerizable — inhibitor certificate and temperature control.",
    segregation: "Oxidizers, peroxides, UV/light, aluminium alloys.",
    detection: "VCM tube (ppb–ppm range).",
    carriage: "Semi-pressurized or pressurized.",
  },
  {
    slug: "chlorine", name: "Chlorine", synonyms: ["Cl₂ (packages/bulk specialist)"],
    un: "1017", formula: "Cl₂", boiling: "−34.0 °C", density: "1.56 (liquid — sinker)",
    flammability: "Not flammable — strong oxidizer", toxic: true,
    tlv: "0.5 ppm TWA · STEL 1 (TLV)",
    health: "Severely toxic + corrosive; lung injury can be delayed hours. Escape sets only — no entry without BA and orders.",
    segregation: "ALL organics and flammables, ammonia, hydrogen, hydrocarbons, moisture (forms acids).",
    detection: "Chlorine tube / electrochemical Cl₂ sensor (ppb range).",
    carriage: "Pressurized packages; bulk only in specialist trades — confirm IGC/terminal compatibility.",
  },
];

export function findGas(slug: string): GasCargo | undefined {
  return GASES.find((g) => g.slug === slug);
}

export function searchGases(q: string): GasCargo[] {
  const needle = q.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return GASES;
  const digits = needle.replace(/[^0-9]/g, "");
  return GASES.filter((g) => {
    if (digits.length >= 2 && g.un.replace(/[^0-9]/g, "").includes(digits)) return true;
    if (g.name.toLowerCase().includes(needle)) return true;
    if (g.synonyms.some((s) => s.toLowerCase().includes(needle))) return true;
    if (g.formula.toLowerCase().includes(needle)) return true;
    return false;
  });
}
