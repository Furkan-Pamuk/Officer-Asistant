// Solid bulk cargo booklet (IMSBC-based study reference).
// Group letters + UN numbers verified against the IMSBC Code schedules;
// all guidance is paraphrased in own words (never verbatim schedule text).
// The IMSBC Code, shipper's certificates (TML, FMP) and the Grain Code govern.

export type BulkGroup = "A" | "B" | "C" | "A and B" | "Grain Code";

export interface BulkCargo {
  slug: string;
  name: string;
  synonyms: string[];
  schedule: string;
  group: BulkGroup;
  un: string;
  tags: string[];
  ventilation: string;
  moisture: string;
  precautions: string[];
  note?: string;
}

export const BULK_GROUPS: { id: string; label: string; desc: string }[] = [
  { id: "A", label: "Group A", desc: "May liquefy (flow moisture). Carry only below TML, trimmed level." },
  { id: "B", label: "Group B", desc: "Chemical hazard: fire, gases, self-heating, corrosion, toxicity." },
  { id: "C", label: "Group C", desc: "Neither liquefaction nor chemical hazard — routine care still applies." },
];

export const BULKS: BulkCargo[] = [
  {
    slug: "iron-ore-fines", name: "Iron ore fines", synonyms: ["Iron ore (fines, <6.3 mm)", "Sinter feed (fine)"],
    schedule: "IRON ORE FINES", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "can test"],
    ventilation: "No special ventilation requirement.",
    moisture: "Load only below Transportable Moisture Limit per shipper certificate; can test as a supplementary check; rain-season vigilance at load port.",
    precautions: [
      "Trim level to the boundaries — fines must not shift; verify stability with the actual moisture content.",
      "Refuse cargo rained on or visibly wetter than certified; re-test if in doubt.",
      "Bilges sound and pumped; hatch covers weathertight; close hatches during precipitation.",
      "Indonesian/Guinea/West African loadings in the wet season need extra moisture scrutiny.",
    ],
  },
  {
    slug: "nickel-ore", name: "Nickel ore (laterite)", synonyms: ["Garnierite", "Lateritic nickel ore"],
    schedule: "NICKEL ORE", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "can test", "wet-season ban"],
    ventilation: "No special ventilation requirement.",
    moisture: "Notorious for moisture above TML from Indonesia/Philippines in the rainy season. Independent survey + can test; do not sail on doubt.",
    precautions: [
      "Multiple stockpile samples, not one grab — moisture varies across the pile.",
      "Shippers' certificates from the region have caused losses; verify independently.",
      "Trim level; monitor for free water/slurry on tank tops during loading.",
      "Several bulk carriers lost to nickel-ore liquefaction — when in doubt, refuse and call P&I/class.",
    ],
  },
  {
    slug: "metal-sulphide-concentrates", name: "Metal sulphide concentrates (Cu/Pb/Zn)", synonyms: ["Copper concentrate", "Lead concentrate", "Zinc concentrate"],
    schedule: "METAL SULPHIDE CONCENTRATES", group: "A and B", un: "— (corrosive/self-heating grades: UN 1759 / UN 3190)",
    tags: ["liquefaction", "self-heating", "oxygen depletion", "toxic gas", "trimming required", "keep dry"],
    ventilation: "Ventilate as required by schedule; monitor holds for oxygen depletion and sulphur gases.",
    moisture: "Group A rules apply: below TML, trimmed level. Corrosive/self-heating grades carry UN numbers and need competent-authority approval.",
    precautions: [
      "Oxygen-depleting + self-heating: enclosed-space procedure for every hold entry, gas readings logged.",
      "Sulphide dust can generate SO₂/H₂S; washdown and PPE per schedule.",
      "Corrosive grades attack steel and aluminium — protect structure and equipment.",
      "Keep dry and_hot spots under watch; temperature monitoring where required.",
    ],
  },
  {
    slug: "bauxite-fines", name: "Bauxite fines", synonyms: ["Bauxite (fine fraction)"],
    schedule: "BAUXITE FINES", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry"],
    ventilation: "No special ventilation requirement.",
    moisture: "Since the 2023 IMSBC amendments, bauxite fines are Group A: same TML discipline as iron ore fines.",
    precautions: [
      "Do not treat like classic bauxite (Group C) — fines behave differently when wet.",
      "Certificate + can test + trim level, as for any Group A cargo.",
    ],
  },
  {
    slug: "manganese-fines", name: "Manganese ore fines", synonyms: ["Mn fines"],
    schedule: "MANGANESE ORE FINES", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "dust PPE"],
    ventilation: "No special ventilation requirement.",
    moisture: "Below TML only; fines + rain = classic liquefaction setup.",
    precautions: [
      "Trim level; manganese dust is harmful — respiratory protection during handling.",
      "Lumpy manganese ore (Group C) is a different schedule — confirm which one the cargo matches.",
    ],
  },
  {
    slug: "ilmenite-sand", name: "Ilmenite sand", synonyms: ["Ilmenite (upgraded)", "Titanium sand"],
    schedule: "ILMENITE SAND", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "very dense"],
    ventilation: "No special ventilation requirement.",
    moisture: "Very dense cargo — small moisture excess means large free-water weight. Strict TML discipline.",
    precautions: [
      "Density means stability and strength margins, not moisture tolerance — trim level regardless.",
      "Rock/ilmenite upgraded grades differ — match the exact schedule (rock can be Group C).",
    ],
  },
  {
    slug: "coke-breeze", name: "Coke breeze", synonyms: ["Coke fines"],
    schedule: "COKE BREEZE", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "dusty"],
    ventilation: "No special ventilation requirement.",
    moisture: "Fine coke behaves as Group A when wet — certificate + trim as usual.",
    precautions: [
      "Lump coke (Group C) is different — fines go under this schedule.",
      "Dust control and eye/respiratory protection during loading.",
    ],
  },
  {
    slug: "copper-slag", name: "Copper slag (granulated)", synonyms: ["Copper dross (granulated)"],
    schedule: "COPPER SLAG", group: "A", un: "—",
    tags: ["liquefaction", "trimming required", "keep dry", "very dense", "abrasive"],
    ventilation: "No special ventilation requirement.",
    moisture: "Dense abrasive fines — TML applies despite the 'rock-like' look.",
    precautions: [
      "Abrasive to tank tops and grabs — inspect after discharge.",
      "Trim level; high density affects stability calculations, not moisture rules.",
    ],
  },
  {
    slug: "fluorspar", name: "Fluorspar (fluorite)", synonyms: ["Fluorite", "Calcium fluoride"],
    schedule: "FLUORSPAR", group: "A and B", un: "—",
    tags: ["liquefaction", "toxic dust", "trimming required", "keep dry"],
    ventilation: "Ventilate to clear dust; respiratory protection mandatory in dust.",
    moisture: "Group A moisture discipline plus fluoride-dust precautions.",
    precautions: [
      "Fluoride dust is toxic — sealed cabins, masks, no eating/drinking in dusty areas.",
      "Trim level; wash down thoroughly — residues attack paint and fittings over time.",
    ],
  },
  {
    slug: "alumina-hydrate", name: "Alumina hydrate", synonyms: ["Aluminium hydroxide", "Hydrated alumina"],
    schedule: "ALUMINA HYDRATE", group: "A and B", un: "—",
    tags: ["liquefaction", "corrosive (MHB)", "trimming required"],
    ventilation: "No special ventilation requirement.",
    moisture: "Liquefaction discipline plus corrosive (MHB) handling.",
    precautions: [
      "Corrosive to skin/eyes and to aluminium fittings — PPE and washdown.",
      "Calcined alumina is a different (Group C) schedule — confirm the cargo's exact form.",
    ],
  },
  {
    slug: "coal", name: "Coal (bituminous/anthracite)", synonyms: ["Steam coal", "Coking coal", "Thermal coal"],
    schedule: "COAL", group: "A and B", un: "—",
    tags: ["self-heating", "methane", "carbon monoxide", "oxygen depletion", "dust explosion", "trimming required"],
    ventilation: "Surface ventilation as required; never ventilate sealed hot spots with fresh air blindly.",
    moisture: "Group A+B: TML discipline for fines plus full gas precautions regardless of size.",
    precautions: [
      "Monitor CH₄, CO and O₂ twice daily minimum; log trends, not just spot values — rising CO means heating.",
      "No smoking, no naked lights, no hot work near holds; explosion-proof electrics where fitted.",
      "Trim reasonably — cracks let oxygen in and feed self-heating.",
      "Bilge pH can drop (acidic) — check and protect; dewater without spreading dust.",
      "Emission of methane needs gas freeing before enclosed-space entry, every time.",
    ],
  },
  {
    slug: "petcoke", name: "Petroleum coke (calcined/uncalcined)", synonyms: ["Petcoke", "Pet coke"],
    schedule: "PETROLEUM COKE (calcined or uncalcined)", group: "B", un: "—",
    tags: ["self-heating", "gas monitoring", "dust explosion"],
    ventilation: "Ventilate as required by schedule.",
    moisture: "Keep dry; wet petcoke handling needs care like coal fines.",
    precautions: [
      "Treat gas monitoring like coal: CH₄/CO/O₂ readings on schedule.",
      "Dusty and abrasive — protect machinery intakes and accommodation.",
      "Uncalcined grades hold more volatiles — know which one is aboard.",
    ],
  },
  {
    slug: "sulphur", name: "Sulphur lumps (UN 1350)", synonyms: ["Brimstone (crushed lump, coarse)"],
    schedule: "SULPHUR UN 1350", group: "B", un: "1350",
    tags: ["dust explosion", "toxic gas (SO₂)", "acidic bilges", "no welding"],
    ventilation: "Ventilate as required; dust control during handling.",
    moisture: "Keep dry; wet sulphur + steel = acidic corrosion and hydrogen risk awareness.",
    precautions: [
      "Sulphur dust explodes — no smoking, no hot work, earthed equipment.",
      "SO₂ and dust irritate lungs — respiratory protection in dust.",
      "Bilges turn acidic — pump, neutralise washings per rules, protect coatings.",
      "Fine/flower sulphur is far more hazardous than lumps — confirm the form.",
    ],
  },
  {
    slug: "ferrosilicon", name: "Ferrosilicon (UN 1408)", synonyms: ["FeSi (30–90% Si, incl. briquettes)"],
    schedule: "FERROSILICON UN 1408", group: "B", un: "1408",
    tags: ["hydrogen gas", "toxic gas (phosphine/arsine)", "keep dry", "no water"],
    ventilation: "Surface ventilation as required — never seal a hold that may be gassing.",
    moisture: "Must be dry; any wetting (rain, bilge, condensation) generates hydrogen plus highly toxic phosphine/arsine.",
    precautions: [
      "Monitor H₂ continuously where fitted, plus phosphine/arsine tubes — both can kill without warning.",
      "No water on the cargo, ever; cover bilges, keep hatches closed in rain.",
      "Phosphine poisoning mimics food poisoning at first — any sickness in the area means gas check first.",
      "Aluminium ferrosilicon (UN 1395) is the stricter cousin — confirm the UN number.",
    ],
  },
  {
    slug: "seed-cake", name: "Seed cake (solvent-extracted, UN 2217)", synonyms: ["Soybean meal", "Rapeseed meal", "Sunflower meal (solvent)"],
    schedule: "SEED CAKE UN 2217", group: "B", un: "2217",
    tags: ["self-heating", "temperature monitoring", "keep dry"],
    ventilation: "Ventilate as required by schedule.",
    moisture: "Oil + moisture drive self-heating; mechanically expelled grades fall under different (B or C) entries — confirm oil/moisture figures.",
    precautions: [
      "Daily temperature readings; rising trend = stop ventilation changes and seek advice, cool boundaries.",
      "Keep dry — wetting accelerates heating dramatically.",
      "No hot work on adjacent bulkheads without checks.",
    ],
  },
  {
    slug: "copra", name: "Copra, dry (UN 1363)", synonyms: ["Dried coconut kernels"],
    schedule: "COPRA (dry) UN 1363", group: "B", un: "1363",
    tags: ["self-heating", "spontaneous combustion", "keep dry"],
    ventilation: "Ventilate as required by schedule.",
    moisture: "Expelled grades may be B or C by oil/moisture — dry UN 1363 copra is the hazardous one.",
    precautions: [
      "Classic self-heater: temperature rounds, look for sweat, rainbow stains, sweet/rancid smell changes.",
      "Keep dry and cool; isolate from bunkers/steam lines heating the hold.",
    ],
  },
  {
    slug: "fishmeal", name: "Fishmeal, stabilized (UN 2216)", synonyms: ["Fish scrap (stabilized)"],
    schedule: "FISH MEAL (FISH SCRAP), STABILIZED UN 2216", group: "B", un: "2216",
    tags: ["self-heating", "temperature monitoring", "antioxidant certificate"],
    ventilation: "Ventilate as required by schedule.",
    moisture: "Carry ONLY with a valid antioxidant certificate (moisture 5–12% + ethoxyquin or equivalent); unstabilized fishmeal is effectively prohibited.",
    precautions: [
      "Check the antioxidant certificate date and dosage before a single tonne loads.",
      "Temperature monitoring from day one; fat oxidation runs away fast once started.",
      "Fish oil smell is normal; sharp acrid change is not — investigate.",
    ],
  },
  {
    slug: "wood-pellets", name: "Wood pellets (+binders)", synonyms: ["Biomass pellets", "Wood pellets with additives"],
    schedule: "WOOD PELLETS CONTAINING ADDITIVES AND/OR BINDERS", group: "B", un: "—",
    tags: ["oxygen depletion", "carbon monoxide", "self-heating", "dust explosion"],
    ventilation: "Ventilate only per schedule — holds can become oxygen-deficient within hours.",
    moisture: "Over ~15% moisture invites fermentation and heating; keep dry.",
    precautions: [
      "O₂ depletion + CO have killed seafarers: test O₂/CO before EVERY hold entry, ventilate first.",
      "Temperature watch; fines and dust explode — no ignition sources.",
      "Sugarcane biomass pellets share similar behaviour — same discipline.",
    ],
  },
  {
    slug: "ammonium-nitrate", name: "Ammonium nitrate (UN 1942)", synonyms: ["AN (technical grade)"],
    schedule: "AMMONIUM NITRATE UN 1942", group: "B", un: "1942",
    tags: ["oxidizer", "explosion risk", "no organics", "no smoking", "flood-not-fight"],
    ventilation: "Ventilate as required; keep holds cool and dry.",
    moisture: "Caking with moisture is the least of it — contamination with organics/fuel turns it detonable.",
    precautions: [
      "Absolute segregation from fuels, oils, organics, chlorides, copper/zinc fittings.",
      "No smoking, no hot work anywhere near; firefighting = massive water flooding, never smother.",
      "Fertilizer grades (UN 2067/2071) have their own schedules — confirm the exact UN number.",
    ],
  },
  {
    slug: "dri", name: "Direct reduced iron (A/B/C)", synonyms: ["DRI", "Sponge iron", "HBI (hot briquetted)"],
    schedule: "DIRECT REDUCED IRON (A)/(B)/(C)", group: "B", un: "—",
    tags: ["hydrogen gas", "self-heating", "keep dry", "temperature monitoring"],
    ventilation: "Surface ventilation as required — hydrogen must not accumulate.",
    moisture: "React with water = hydrogen + heat. Three types (A/B/C) by reactivity — hot-briquetted (HBI/C) is the calmest, fines-heavy DRI the liveliest.",
    precautions: [
      "Continuous H₂ monitoring where fitted plus regular manual readings; ventilate to keep well below LEL.",
      "Keep absolutely dry — rain, bilge, condensation all count.",
      "Hot spots: cool boundaries, expert advice, never open up blindly.",
      "Know which type (A/B/C) is aboard — precautions scale with reactivity.",
    ],
  },
  {
    slug: "cement", name: "Cement", synonyms: ["Portland cement", "Cement powder"],
    schedule: "CEMENT", group: "C", un: "—",
    tags: ["dust PPE", "fluid when aerated", "no ventilation", "keep dry"],
    ventilation: "Do NOT ventilate holds during the voyage.",
    moisture: "Keep as dry as practicable; no handling during precipitation; close non-working hatches.",
    precautions: [
      "Aerated cement flows almost like liquid — never enter before full settlement; ship stays upright at loading.",
      "Trim so surface angle stays within schedule limits after settlement.",
      "Dust protection for crew and machinery: masks, goggles, cover bilges, protect intakes.",
    ],
  },
  {
    slug: "cement-clinker", name: "Cement clinker", synonyms: ["Clinker (cement)"],
    schedule: "CEMENT CLINKERS", group: "C", un: "—",
    tags: ["dust PPE", "abrasive"],
    ventilation: "No special ventilation requirement.",
    moisture: "Keep dry as practicable.",
    precautions: [
      "Heavy, abrasive, dusty — tank-top strength, grab damage checks, dust masks.",
      "Alkaline dust irritates skin/eyes — wash facilities ready.",
    ],
  },
  {
    slug: "iron-ore", name: "Iron ore (lumps)", synonyms: ["Iron ore (coarse)"],
    schedule: "IRON ORE", group: "C", un: "—",
    tags: ["very dense", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care; fines fraction decides whether the FINES schedule (Group A) applies instead.",
    precautions: [
      "Check the fines content on the certificate — above the fines threshold it ships as Group A.",
      "High density: stability and tank-top loading limits dominate planning.",
    ],
  },
  {
    slug: "iron-ore-pellets", name: "Iron ore pellets", synonyms: ["Taconite pellets", "Pellet feed (pelletized)"],
    schedule: "IRON ORE PELLETS", group: "C", un: "—",
    tags: ["very dense", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care for pellets; dusty fines in the parcel still need watching.",
    precautions: [
      "Free-rolling pellets shift if untrimmed — trim and secure per schedule.",
      "High density + high stowage factor awareness for stability.",
    ],
  },
  {
    slug: "alumina", name: "Alumina (calcined)", synonyms: ["Aluminium oxide", "Calcined alumina"],
    schedule: "ALUMINA", group: "C", un: "—",
    tags: ["dust PPE", "keep dry"],
    ventilation: "No special ventilation requirement.",
    moisture: "Keep dry; hydrate form is a different (A and B) schedule — confirm calcined vs hydrate.",
    precautions: [
      "Fine abrasive dust — machinery protection and respiratory PPE.",
      "Slippery when wet on deck — housekeeping during handling.",
    ],
  },
  {
    slug: "bauxite", name: "Bauxite (lumpy)", synonyms: ["Aluminium ore (lumpy)"],
    schedule: "BAUXITE", group: "C", un: "—",
    tags: ["dust PPE", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care — but FINES ship as Group A since 2023; confirm the particle size on the certificate.",
    precautions: [
      "Reddish abrasive dust stains everything — protect deck machinery and mooring lines.",
      "Wet-season stockpiles can hide excess moisture — still verify.",
    ],
  },
  {
    slug: "urea-bulk", name: "Urea (granular/prilled)", synonyms: ["Carbamide (bulk)", "Fertilizer urea"],
    schedule: "UREA", group: "C", un: "—",
    tags: ["hygroscopic", "keep dry", "slippery when wet"],
    ventilation: "Ventilate to prevent sweat where required.",
    moisture: "Strongly hygroscopic — caking and ammonia traces when damp.",
    precautions: [
      "Keep dry; close hatches in rain; sweat/condensation control matters more than for most Group C cargoes.",
      "Slippery decks when spilt wet — clean as you go.",
    ],
  },
  {
    slug: "salt", name: "Salt (sodium chloride)", synonyms: ["Common salt (bulk)", "Rock salt", "Vacuum salt"],
    schedule: "SALT", group: "C", un: "—",
    tags: ["corrosive to steel", "keep dry"],
    ventilation: "No special ventilation requirement.",
    moisture: "Keep dry; brine runoff corrodes everything it touches.",
    precautions: [
      "Wash down and protect deck fittings — salt accelerates corrosion.",
      "Rock salt vs evaporated grades share the schedule; caking is the main nuisance.",
    ],
  },
  {
    slug: "sand", name: "Sand (silica)", synonyms: ["Building sand", "River sand"],
    schedule: "SAND", group: "C", un: "—",
    tags: ["dust PPE (silica)", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care — heavy mineral/rutile/ilmenite sands are separate (often Group A) schedules.",
    precautions: [
      "Silica dust: respiratory protection, especially in enclosed handling spaces.",
      "Confirm ordinary sand vs heavy-mineral sand — different schedules and groups.",
    ],
  },
  {
    slug: "limestone", name: "Limestone", synonyms: ["Calcium carbonate (bulk)", "Limestone chips"],
    schedule: "LIMESTONE", group: "C", un: "—",
    tags: ["dust PPE", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care.",
    precautions: [
      "Alkaline dust — eye/skin protection during dusty handling.",
      "High stowage weight; check tank-top limits.",
    ],
  },
  {
    slug: "manganese-ore", name: "Manganese ore (lumpy)", synonyms: ["Mn ore (lumpy)"],
    schedule: "MANGANESE ORE", group: "C", un: "—",
    tags: ["dust PPE", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care — fines ship as Group A; confirm the size fraction.",
    precautions: [
      "Manganese dust is harmful breathed — masks in dust.",
      "Dense cargo: stability and strength planning as usual.",
    ],
  },
  {
    slug: "chromite", name: "Chromite ore", synonyms: ["Chrome ore"],
    schedule: "CHROMITE ORE", group: "C", un: "—",
    tags: ["very dense", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care.",
    precautions: [
      "Very high density — deadweight fills fast; verify stability and shear forces.",
      "Ferrochrome (smelted) is a separate Group C schedule with similar handling.",
    ],
  },
  {
    slug: "soda-ash", name: "Soda ash (dense/light)", synonyms: ["Sodium carbonate (bulk)"],
    schedule: "SODA ASH", group: "C", un: "—",
    tags: ["hygroscopic", "keep dry", "dust PPE"],
    ventilation: "No special ventilation requirement.",
    moisture: "Cakes with moisture — keep dry, close hatches in precipitation.",
    precautions: [
      "Alkaline dust irritates eyes/airways — PPE in dust.",
      "Sweep and wash thoroughly — residues set hard when damp.",
    ],
  },
  {
    slug: "dap", name: "DAP/MAP fertilizers", synonyms: ["Diammonium phosphate", "Monoammonium phosphate", "NPK (non-hazardous grades)"],
    schedule: "DIAMMONIUM PHOSPHATE (D.A.P.)", group: "C", un: "—",
    tags: ["keep dry", "check exact grade"],
    ventilation: "Ventilate as required by schedule.",
    moisture: "Keep dry; caking and ammonia traces when damp.",
    precautions: [
      "Confirm the grade: coated/enriched or high-nitrate grades fall under different (Group B) schedules with UN numbers.",
      "Superphosphate and potassium sulphate behave similarly — same routine care.",
    ],
  },
  {
    slug: "gypsum", name: "Gypsum", synonyms: ["Calcium sulphate (natural)", "Gypsum rock/granulated"],
    schedule: "GYPSUM", group: "C", un: "—",
    tags: ["dust PPE", "no special"],
    ventilation: "No special ventilation requirement.",
    moisture: "Routine care — chemical (by-product) gypsum is the Group A variant; confirm the source.",
    precautions: [
      "Dust masks in handling; soft cargo — grabs and bulldozers damage tank tops less than ores.",
    ],
  },
  {
    slug: "grain", name: "Grain (wheat, corn, barley…)", synonyms: ["Cereals", "Wheat", "Maize/corn", "Barley", "Soybeans (as grain)"],
    schedule: "No IMSBC schedule — International Grain Code (SOLAS VI)", group: "Grain Code", un: "—",
    tags: ["stability-critical", "fumigation (phosphine)", "heating", "ventilation for sweat"],
    ventilation: "Ventilate to prevent ship sweat/cargo sweat per Grain Code practice; sealed during fumigation.",
    moisture: "Shipper moisture certificate; heating/insect infestation can condemn a parcel — inspect before loading.",
    precautions: [
      "Stability per the Grain Code and approved loading manual — shifting grain capsizes ships; overstow and lash as required.",
      "Fumigation (phosphine) means sealed holds, warning signs, gas checks before entry — phosphine kills at low ppm.",
      "Watch for heating/hot spots and insect activity during the voyage.",
      "Ventilate against sweat damage, but never during fumigation exposure periods.",
    ],
    note: "Grain behaves like Group C (no liquefaction/chemical hazard of its own) but is governed by its own Code, not an IMSBC schedule.",
  },
];

export function findBulk(slug: string): BulkCargo | undefined {
  return BULKS.find((b) => b.slug === slug);
}

export function searchBulks(q: string): BulkCargo[] {
  const needle = q.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return BULKS;
  return BULKS.filter((b) => {
    if (b.name.toLowerCase().includes(needle)) return true;
    if (b.schedule.toLowerCase().includes(needle)) return true;
    if (b.un.replace(/[^0-9]/g, "").includes(needle.replace(/[^0-9]/g, "")) && needle.replace(/[^0-9]/g, "").length >= 2) return true;
    if (b.synonyms.some((s) => s.toLowerCase().includes(needle))) return true;
    if (b.tags.some((t) => t.toLowerCase().includes(needle))) return true;
    return false;
  });
}
