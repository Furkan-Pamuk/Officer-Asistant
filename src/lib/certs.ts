export interface Cert {
  id: string;
  name: string;
  cat: string;
}

export const CERT_CATS = ["STCW", "Tanker & Gas", "Safety & Security", "Medical", "Travel Documents", "Other"];

export const CERTS: Cert[] = [
  { id: "coc", name: "Certificate of Competency (CoC)", cat: "STCW" },
  { id: "coc-end", name: "Flag Endorsement (CoC)", cat: "STCW" },
  { id: "gmdss", name: "GMDSS General Operator's Certificate", cat: "STCW" },
  { id: "ecdis-gen", name: "ECDIS Generic Training", cat: "STCW" },
  { id: "ecdis-type", name: "ECDIS Type-Specific", cat: "STCW" },
  { id: "arpa", name: "ARPA / Radar Observer", cat: "STCW" },
  { id: "btm", name: "Bridge Team / Resource Management", cat: "STCW" },
  { id: "shiphandling", name: "Ship Handling", cat: "STCW" },
  { id: "erm", name: "Engine Room Resource Management (ERM)", cat: "STCW" },
  { id: "ers", name: "Engine Room Simulator", cat: "STCW" },
  { id: "hv", name: "High Voltage (Operational/Management)", cat: "STCW" },
  { id: "dp-basic", name: "DP Induction (Basic)", cat: "STCW" },
  { id: "dp-adv", name: "DP Simulator (Advanced)", cat: "STCW" },
  { id: "crowd", name: "Crowd Management", cat: "STCW" },
  { id: "crisis", name: "Crisis Management & Human Behaviour", cat: "STCW" },
  { id: "oil-basic", name: "Basic Oil & Chemical Tanker Cargo Ops", cat: "Tanker & Gas" },
  { id: "oil-adv", name: "Advanced Oil Tanker Cargo Ops", cat: "Tanker & Gas" },
  { id: "chem-adv", name: "Advanced Chemical Tanker Cargo Ops", cat: "Tanker & Gas" },
  { id: "gas-basic", name: "Basic Liquefied Gas Tanker Cargo Ops", cat: "Tanker & Gas" },
  { id: "gas-adv", name: "Advanced Liquefied Gas Tanker Cargo Ops", cat: "Tanker & Gas" },
  { id: "igf-basic", name: "Basic IGF Code (low-flashpoint fuels)", cat: "Tanker & Gas" },
  { id: "igf-adv", name: "Advanced IGF Code", cat: "Tanker & Gas" },
  { id: "polar-basic", name: "Polar Code Basic", cat: "Tanker & Gas" },
  { id: "basic", name: "Basic Safety Training (4 modules)", cat: "Safety & Security" },
  { id: "pscrb", name: "Survival Craft & Rescue Boats", cat: "Safety & Security" },
  { id: "frb", name: "Fast Rescue Boats", cat: "Safety & Security" },
  { id: "aff", name: "Advanced Fire Fighting", cat: "Safety & Security" },
  { id: "ssa", name: "Security Awareness", cat: "Safety & Security" },
  { id: "dsd", name: "Designated Security Duties", cat: "Safety & Security" },
  { id: "sso", name: "Ship Security Officer", cat: "Safety & Security" },
  { id: "mfa", name: "Medical First Aid", cat: "Medical" },
  { id: "mc", name: "Medical Care", cat: "Medical" },
  { id: "eng1", name: "MLC Medical Fitness Certificate", cat: "Medical" },
  { id: "yellow-fever", name: "Yellow Fever Vaccination", cat: "Medical" },
  { id: "food-hygiene", name: "Food Hygiene / Safe Handling", cat: "Medical" },
  { id: "passport", name: "Passport", cat: "Travel Documents" },
  { id: "seaman", name: "Seaman's Book", cat: "Travel Documents" },
  { id: "schengen", name: "Schengen Visa", cat: "Travel Documents" },
  { id: "usa", name: "USA C1/D Visa", cat: "Travel Documents" },
  { id: "panama", name: "Panama Transit / Seaman Visa", cat: "Travel Documents" },
];

export const LANGS = [
  "English", "Turkish", "Spanish", "Russian", "French", "German", "Italian", "Portuguese",
  "Greek", "Ukrainian", "Romanian", "Bulgarian", "Polish", "Filipino (Tagalog)", "Hindi",
  "Urdu", "Bengali", "Arabic", "Chinese (Mandarin)", "Japanese", "Korean", "Indonesian",
  "Malay", "Dutch",
];

export const LEVELS = ["Native", "C2", "C1", "B2", "B1", "A2", "A1"];

export const CV_TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Serif, navy header" },
  { id: "modern", name: "Modern", desc: "Two-column, cognac sidebar" },
  { id: "compact", name: "Compact", desc: "Dense single column" },
  { id: "maritime", name: "Maritime", desc: "Full navy header, gold accents" },
  { id: "minimal", name: "Minimal", desc: "Plain, printer-friendly" },
];

export const MOTIVATION_DRAFT = `Dear Sir / Madam,

I am writing to apply for the position of [RANK]. With sea service across bulk carriers and tankers, hands-on inspection readiness (PSC, SIRE 2.0, Flag State) and a strong safety record, I keep vessels compliant, on schedule and audit-ready.

I hold all certificates required for the role, valid and ready for verification, and I am available to join at short notice. I would welcome the chance to discuss how I can contribute to your fleet.

Yours faithfully,
[NAME]`;
