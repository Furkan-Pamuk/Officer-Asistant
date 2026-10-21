// Master Standing Orders + Emergency Check Cards (Navigation > Documents).
// Generic good-seamanship content per ICS Bridge Procedures Guide / SOLAS / STCW.
// Adapt on board — Master's signature block makes them vessel-specific.

export interface StandingOrderGroup {
  group: string;
  orders: string[];
}

export const MASTER_STANDING_ORDERS: StandingOrderGroup[] = [
  {
    group: "Watchkeeping & Navigation",
    orders: [
      "A proper lookout by sight, hearing and all available means shall be maintained at all times, in full compliance with COLREG Rule 5. Never leave the bridge unattended.",
      "The vessel shall at all times proceed at a safe speed (COLREG Rule 6) with main engines ready for immediate manoeuvre when navigating in congested waters, reduced visibility, or near navigational hazards.",
      "The OOW shall follow the approved berth-to-berth passage plan. Any deviation shall be plotted, logged, and reported to the Master without delay.",
      "Position shall be fixed at regular intervals appropriate to the waters — at least hourly in coastal waters — using more than one method. ECDIS, radar and visual bearings shall be cross-checked; never rely on a single position source.",
      "Under-keel clearance shall be monitored continuously against the passage plan minimum. If UKC falls below the planned minimum, slow down, inform the Master, and take avoiding action.",
      "In restricted visibility, sound the prescribed fog signals, exhibit navigation lights, reduce to safe speed, have engines ready, post extra lookout, and inform the Master immediately.",
      "Traffic separation schemes, VTS instructions and local regulations shall be obeyed. Report to VTS as required and record reporting points in the Deck Log.",
      "ECDIS safety settings (safety contour, safety depth, cross-track limits, look-ahead) shall be verified at every watch handover and after any route amendment.",
    ],
  },
  {
    group: "Calling the Master",
    orders: [
      "The OOW shall call the Master immediately and take avoiding action first if: visibility drops below 3 nm, traffic density becomes heavy, any doubt about another vessel's intentions, failure of any bridge/navigation equipment, difficulty maintaining course, land or a navigational mark sighted unexpectedly, soundings differ from charted depths, or any emergency situation.",
      "Do not hesitate to call — a call made too early is always better than one made too late. The Master is available day and night and expects to be informed.",
    ],
  },
  {
    group: "Bridge Team & Communications",
    orders: [
      "Master–pilot information exchange shall be completed and logged for every pilotage. The pilot's presence never relieves the OOW of responsibility; the passage shall be monitored continuously and any doubt questioned.",
      "Closed-loop communication shall be used for all helm and engine orders. Steering and engine movements shall be recorded in the Bell Book.",
      "Watch handover shall follow the SMS checklist: position, course/speed, traffic, navigational warnings, weather, equipment status, and Master's night/day orders acknowledged by both officers.",
      "Distraction on the bridge is prohibited: no non-operational mobile phone use, no visitors without the Master's permission, and GMDSS watchkeeping per the radio log requirements.",
    ],
  },
  {
    group: "Safety, Security & Environment",
    orders: [
      "Safety rounds of deck, accommodation and mooring decks shall be carried out as per SMS and logged. Watertight doors, fire doors and fire patrols in port shall be maintained.",
      "Any oil spill, near-miss, injury or security incident shall be reported to the Master at once and recorded. SOPEP/SMPEP equipment locations must be known to every watchkeeper.",
      "Ballast, garbage, sewage and sludge operations shall comply with MARPOL and the vessel's record books. Nothing goes overboard except in full compliance with regulations.",
      "Ship security per the SSP: gangway watch, visitor log, restricted areas, and security levels as directed. Report any suspicious craft or activity immediately.",
    ],
  },
  {
    group: "Arrival, Departure & Anchorage",
    orders: [
      "Pre-arrival and pre-departure bridge and engine checklists shall be completed, tested (steering gear, telegraph, whistle, radars, ECDIS, VHF, sound signals) and logged before every movement.",
      "Anchor position, swinging circle and dragging alarms (ECDIS + radar guard rings) shall be set and monitored. Anchor watches as ordered; report dragging suspicion instantly.",
      "Draft, stability and mooring line condition shall be confirmed with the Chief Officer before departure and after arrival.",
    ],
  },
];

export interface DocSection {
  heading: string;
  icon: string;
  points: string[];
}

export const LIGHTS_BUOYS: DocSection[] = [
  {
    heading: "IALA Lateral Marks — Region A vs B",
    icon: "🔴🟢",
    points: [
      "Direction of buoyage: 'from seaward' — entering harbour, river or estuary from the open sea.",
      "REGION A (Europe, Africa, Asia, Australia): PORT hand = RED, can shape; STARBOARD hand = GREEN, conical shape.",
      "REGION B (North & South America, Japan, Korea, Philippines): colours reversed — PORT hand = GREEN, STARBOARD = RED. Shapes stay the same (port = can, starboard = cone).",
      "Memory aid A: 'Red to the left when returning' (entering). B: 'Red Right Returning' — red stays on your right when returning from sea.",
      "Preferred channel marks: when a channel splits, the preferred route uses the main lateral colour/shape; the other side carries a horizontal band of the opposite colour.",
      "Topmarks (if fitted): port = single can, starboard = single cone, always matching the hand.",
      "Light rhythm (if lit): port = Fl.R (any rhythm except 2+1), starboard = Fl.G; preferred-channel 'modified lateral' shows Fl(2+1).",
    ],
  },
  {
    heading: "Cardinal Marks — the clock rule",
    icon: "🧭",
    points: [
      "Cardinal marks tell you where the SAFE water is: pass to the named side (N/E/S/W) of the mark.",
      "Colour bands (yellow over black): NORTH = black on top; SOUTH = black at bottom; EAST = black top and bottom (egg); WEST = black in the middle (wasp waist).",
      "Topmarks are two cones: NORTH = both up; SOUTH = both down; EAST = base to base; WEST = point to point.",
      "Light is always WHITE with Q or VQ rhythm — the clock face rule: EAST = 3 flashes (3 o'clock), SOUTH = 6 + one long flash (6 o'clock), WEST = 9 flashes (9 o'clock), NORTH = continuous quick/very-quick (12 o'clock, no break).",
      "Count flashes in the period (10s or 15s): 3 = go East of it, 6+1 = go South, 9 = go West, unbroken = go North.",
      "Very quick (VQ, 120–100/min) is used when the mark must stand out; quick (Q, 60–50/min) otherwise.",
    ],
  },
  {
    heading: "Isolated Danger, Safe Water & Special Marks",
    icon: "⚪🟡",
    points: [
      "ISOLATED DANGER (on top of the danger itself): black with red horizontal bands, two black spheres topmark, white light Fl(2) — 'two balls, two flashes, stay clear'.",
      "SAFE WATER / fairway (mid-channel, landfall): red and white VERTICAL stripes, single red sphere topmark, white light Iso, Oc, LFl(10s) or Morse 'A'. Pass on either side.",
      "SPECIAL MARKS (not navigation aid — cables, spoil ground, racing, ODAS): YELLOW, 'X' topmark, yellow light with any rhythm EXCEPT those reserved for white lights (no Q/VQ group patterns of cardinal/isolated danger).",
      "EMERGENCY WRECK MARKING BUOY (new danger, first response): BLUE + YELLOW vertical stripes, '+' (cross) topmark, alternating blue/yellow light Fl.Al BuY — 'blue-yellow cross, see it, give room'.",
      "New dangers are also announced by NAVAREA/NAVTEX warnings — never rely on the buoy alone.",
    ],
  },
  {
    heading: "Light Characteristics Decoder",
    icon: "💡",
    points: [
      "F = Fixed (steady). Fl = Flashing (single flash, light shorter than dark). LFl = Long flash (≥ 2s). Oc = Occulting (light longer than dark — opposite of flashing). Iso = Isophase (equal light and dark).",
      "Q = Quick (50–79 flashes/min). IQ = Interrupted quick. VQ = Very quick (80–159/min). IVQ = Interrupted VQ. UQ = Ultra quick (≥ 160/min, rare).",
      "Mo = Morse code letter (e.g. Mo(A), Mo(U), Mo(D) for harbour entrances and leading lines).",
      "Groups: Fl(2) = two flashes per period; Fl(2+1) = composite group (preferred channel); VQ(6)+LFl = south cardinal signature.",
      "Period (s) = one full cycle including dark time. Example 'Fl(3) W 15s' = group of 3 white flashes every 15 seconds.",
      "Colour letter: W white, R red, G green, Y yellow, Bu blue, Or orange, Vi violet — no letter means white.",
    ],
  },
  {
    heading: "Ranges: Nominal, Geographical, Luminous",
    icon: "🔭",
    points: [
      "NOMINAL RANGE: the luminous range in 10 nm meteorological visibility (printed on the chart, e.g. 'Fl 15s 22m 18M').",
      "GEOGRAPHICAL RANGE: how far the light can be seen given Earth's curvature — depends on height of light + height of eye (use the range table / 2.08 × (√h_light + √h_eye)).",
      "LUMINOUS RANGE: how far the light carries in the CURRENT visibility (use the luminous-range diagram with nominal range).",
      "The range you can actually use = the SMALLER of geographical and luminous range.",
      "First sighting expected at the computed range — if the light appears late, suspect reduced visibility or a casualty; report it.",
      "Rising/dipping distances: note dipping bearing of a disappearing light as a position line.",
    ],
  },
  {
    heading: "Sectors, Leading Lines & Working Notes",
    icon: "📝",
    points: [
      "SECTOR LIGHTS: white = safe sector, RED = danger/port side of channel, GREEN = danger/starboard side. On the exact boundary the colour changes — treat doubtful colours as danger.",
      "LEADING LINES (range lights): keep front and rear lights in transit (one above the other). High sensitivity lines detect small cross-track errors — steer on the transit, not the compass alone.",
      "If a light is extinguished, out of character, or a buoy is off station/missing: log it, warn nearby traffic (sécurité if needed), report to the coastal authority/VTS and company, and navigate with extra clearance.",
      "Buoy positions are approximate and buoys go adrift — especially after gales or ice. 'Buoyed channel' is an aid, never a guarantee; confirm by soundings and transits.",
      "Temporary (T) and preliminary (P) chart corrections + NAVTEX warnings may add or move lights/buoys — check before entering unfamiliar ports. Correct charts weekly.",
      "Night orders: dim bridge lighting, test Aldis lamp and sound signals, confirm lookout understands light-reporting vocabulary (bearing, colour, character, period).",
    ],
  },
];

export interface ChartSymbol {
  id: string;
  name: string;
  meaning: string;
}

export interface ChartSymbolGroup {
  heading: string;
  icon: string;
  symbols: ChartSymbol[];
}

export const CHART_SYMBOLS: ChartSymbolGroup[] = [
  {
    heading: "Lights & Buoys on Charts",
    icon: "💡",
    symbols: [
      { id: "light-star", name: "★ Fl.10s15M", meaning: "Light: magenta star with character, period and range. Legend format: character + period + height + range (e.g. Fl.10s15M = flashing every 10s, 15m high)." },
      { id: "major-light", name: "Major light flare", meaning: "Large magenta flare = major (all-weather) light. Yellow lens flare on multicoloured charts marks the light's position dot." },
      { id: "lateral-buoy", name: "Lateral buoy (diamond)", meaning: "Small diamond = floating mark; dot is the exact position. Letter beside it: R/G colour, shape (can/cone) and topmark. 'Fl.R.4s' = red light every 4s." },
      { id: "light-vessel", name: "Light vessel / LANBY", meaning: "Ship-shaped symbol with light star = light vessel or large automatic navigational buoy (LANBY)." },
    ],
  },
  {
    heading: "Depths & Coastline",
    icon: "🌊",
    symbols: [
      { id: "sounding", name: "Sounding 14.6", meaning: "Slanted (italic) figures = depths below chart datum. Upright figures = drying heights above datum; underlined = dries at low water." },
      { id: "contour", name: "Depth contour", meaning: "Blue lines join equal depths (2m, 5m, 10m…). Blue tint: shallow water inside the 5m/10m line. Know your safety contour value here." },
      { id: "drying", name: "Drying edge (green)", meaning: "Green tint = intertidal zone that covers and uncovers. Green edge line is the low-water line." },
      { id: "seabed", name: "S, M, Sh, Cy…", meaning: "Seabed quality abbreviations: S sand, M mud, Sh shells, Cy clay, R rock, Co coral, Wd weed. Dots around = approximate." },
    ],
  },
  {
    heading: "Dangers: Wrecks, Rocks, Obstructions",
    icon: "⚠️",
    symbols: [
      { id: "wreck-danger", name: "Dangerous wreck", meaning: "Wreck with dotted danger circle and depth (e.g. '21 Wk') = dangerous to surface navigation. Dots = swept/cleared limit." },
      { id: "wreck-safe", name: "Non-dangerous wreck", meaning: "Hull-shaped outline without danger ring = wreck NOT dangerous to surface navigation (deep enough)." },
      { id: "rock-awash", name: "*  +  #", meaning: "Asterisk = rock awash (at chart datum level). Plus = rock covering/uncovering. Hash = pinnacle/foul with unknown exact depth — keep clear." },
      { id: "obstruction", name: "Obstn / Foul", meaning: "'Obstn' = obstruction, 'Foul' = foul ground (snags anchors and trawls). Small circles = dolphins, piles, fish stakes." },
    ],
  },
  {
    heading: "Routes, Areas & Services",
    icon: "🗺️",
    symbols: [
      { id: "tss", name: "TSS arrows", meaning: "Purple/magenta long arrows + separation zone = Traffic Separation Scheme. Follow Rule 10: join at small angle, cross at right angles." },
      { id: "leading", name: "Leading line", meaning: "Solid magenta line with bearing (e.g. '058°') = transit/leading line. Dashed = recommended track; dotted = ferry/cable area edge." },
      { id: "anchorage", name: "Anchor symbol", meaning: "Anchor = anchorage (numbered berths). 'DW' = deep water, swinging circle may be shown dashed." },
      { id: "pilot", name: "Pilot boarding", meaning: "Circled 'P' or pilot-board mark = pilot boarding place. Report point 'RP' and VTS call-in points shown similarly." },
      { id: "restricted", name: "Restricted area (T-dashes)", meaning: "T-shaped dashed boundary = restricted/prohibited area (firing, naval, environmental). Legend gives entry rules." },
      { id: "cable", name: "Cable / pipeline", meaning: "Wavy magenta line = submarine cable; dashed with 'P' = pipeline. Never anchor or trawl near them." },
    ],
  },
  {
    heading: "ECDIS Essentials (S-52)",
    icon: "🖥️",
    symbols: [
      { id: "safety-contour", name: "Safety contour (blue)", meaning: "Your set safety depth: ECDIS greys out deeper water and highlights the contour in blue. Shallower = blue tint, deeper = grey/white." },
      { id: "isolated-danger", name: "Isolated danger (!)", meaning: "Magenta '!' on a danger inside safe water = auto-detected isolated danger. Check and give room." },
      { id: "catoz", name: "CATZOC stars", meaning: "Seabed-accuracy stars (A1 best … D worst, U unassessed). Few stars = trust soundings less, add UKC margin." },
      { id: "update", name: "ENC update / T&P", meaning: "Orange/pink update markers and T (temporary) / P (preliminary) notices. Weekly updates + manual check before entering a new port." },
      { id: "overscale", name: "Overscale hatch", meaning: "Diagonal hatch = display zoomed beyond ENC compilation scale. Detail is NOT more accurate — zoom back or load larger-scale cell." },
      { id: "caution-box", name: "Caution area", meaning: "Dashed magenta box with '!' = caution/navigationally significant area. Always open the pick report (cursor enquiry) for details." },
    ],
  },
  {
    heading: "Tides & Currents",
    icon: "🌊",
    symbols: [
      { id: "tidal-stream", name: "Tidal stream arrow", meaning: "Feathered arrow + table letter (e.g. 'A'): set and rate at HW ± hours from the tidal-stream table. Add rate to your CTS/SOG maths." },
      { id: "current", name: "Ocean current", meaning: "Plain (unfeathered) arrow = non-tidal current with mean rate in knots. Dashed = approximate or seasonal." },
      { id: "overfalls", name: "Overfalls / tide rips", meaning: "Wavy lines = overfalls, races and breakers. Dangerous for small craft, uncomfortable for all — avoid or transit at slack." },
      { id: "eddies", name: "Eddies", meaning: "Circular arrows = eddies. Useful for ride planning, but positions shift — confirm with latest observations." },
    ],
  },
  {
    heading: "Coastline & Landmarks",
    icon: "⛪",
    symbols: [
      { id: "landmark", name: "Conspicuous landmark", meaning: "Upright pictogram (church, chimney, tower) with position dot = visually conspicuous object. Good for visual bearings and transits." },
      { id: "beacon-tower", name: "Beacon / tower", meaning: "Striped tower = major beacon (often lit, described in List of Lights). Plain post = minor beacon; check colour/topmark for lateral or special meaning." },
      { id: "reported", name: "PA / PD / ED / SD", meaning: "Position Approximate / Doubtful, Existence Doubtful, Sounding Doubtful = reported but not fully surveyed. Give extra clearance." },
      { id: "swept", name: "Swept area (sw)", meaning: "Dashed area with 'sw 12m' = swept by wire to stated depth. Safe where your draft + UKC fit inside the swept depth." },
    ],
  },
  {
    heading: "Lights in Detail",
    icon: "🔦",
    symbols: [
      { id: "leading-pair", name: "Leading lights (pair)", meaning: "Two light stars labelled 'Front'/'Rear' joined by transit line = range/leading lights. Keep them in line; sensitivity note tells how fast errors show." },
      { id: "sectors", name: "Light sectors", meaning: "Coloured arcs around a light: white = safe, red/green = danger each side. Faint white between = obscured. Doubtful colour = danger." },
      { id: "fogsignal", name: "Fog signal", meaning: "Entries like 'Horn', 'Siren', 'Dia' (diaphone), 'Bell', 'Whis' (whistle) with character (e.g. Mo(K) 30s). Test periods in List of Lights." },
      { id: "unlit-beacon", name: "Unlit beacon / daymark", meaning: "Post or board topmark (triangle, square, can) with no light star = daymark only. Useless at night unless lit by searchlight — plan accordingly." },
    ],
  },
  {
    heading: "More Routes & Areas",
    icon: "🧭",
    symbols: [
      { id: "dw-route", name: "Deep-water route", meaning: "Bold dashed magenta centreline labelled 'DW' = surveyed deep-water route. Best water, but still verify UKC for your draft." },
      { id: "ferry", name: "Ferry route", meaning: "Dotted magenta line = ferry/cable-ferry route. Expect crossing traffic on schedule — keep sharp lookout and give way per COLREGs." },
      { id: "ais-aton", name: "AIS AtoN", meaning: "Diamond with 'AIS' = physical aid broadcasting AIS. Compare AIS position with radar/visual — spoofing and outages happen." },
      { id: "v-ais", name: "Virtual AtoN", meaning: "Dashed diamond with 'V-AIS' = no physical buoy exists; mark appears on ECDIS/AIS only. Do NOT look for it visually." },
      { id: "dumping", name: "Dumping ground", meaning: "Dashed area 'Dumping gd' = spoil/dumping ground. Foul holding, possible obstructions — avoid anchoring." },
      { id: "farm", name: "Marine farm", meaning: "Dashed area with grid/float symbols = fish farm or mussel beds. Obstructions and lines at/near surface — keep out." },
      { id: "seaplane", name: "Seaplane landing area", meaning: "Dashed circle/area = seaplane operations. Keep clear during activity; masts and rigging are a hazard to aircraft." },
      { id: "dredged", name: "Dredged channel", meaning: "Pecked lines with 'Dredged to 14m' = maintained channel. Edges silt — stay centred, and expect less than charted near the toes." },
    ],
  },
];

export interface BeaufortRow {
  f: number;
  name: string;
  kn: string;
  sea: string;
  action: string;
}

export const BEAUFORT: BeaufortRow[] = [
  { f: 0, name: "Calm", kn: "<1", sea: "Mirror-like", action: "Glassy — radar picks up everything; fog likely at dawn." },
  { f: 1, name: "Light air", kn: "1–3", sea: "Ripples", action: "Smoke drifts. Good boat-work weather." },
  { f: 2, name: "Light breeze", kn: "4–6", sea: "Small wavelets", action: "Wind felt; flags stir." },
  { f: 3, name: "Gentle breeze", kn: "7–10", sea: "Scattered whitecaps", action: "First whitecaps — note log, check lashings." },
  { f: 4, name: "Moderate breeze", kn: "11–16", sea: "Frequent whitecaps", action: "Spray on deck; secure loose gear, close deadlights." },
  { f: 5, name: "Fresh breeze", kn: "17–21", sea: "Many whitecaps, some spray", action: "Small craft warning level; reduce speed if pounding." },
  { f: 6, name: "Strong breeze", kn: "22–27", sea: "Large waves, foam crests", action: "Near-gale precautions: deck secured, no exposed-deck work." },
  { f: 7, name: "Near gale", kn: "28–33", sea: "Foam blown in streaks", action: "Heavy-weather checklist; consider routeing change." },
  { f: 8, name: "Gale", kn: "34–40", sea: "Long streaks of foam", action: "GALE: heave-to or run off per Master's call; log hourly." },
  { f: 9, name: "Strong gale", kn: "41–47", sea: "High waves, dense foam", action: "Survival conditions for small craft; damage inspection after." },
  { f: 10, name: "Storm", kn: "48–55", sea: "Very high, overhanging", action: "STORM: preserve life — Master's heavy-weather orders only." },
  { f: 11, name: "Violent storm", kn: "56–63", sea: "Exceptional, foam-covered", action: "Rare; survival mode, continuous position reporting." },
  { f: 12, name: "Hurricane", kn: "64+", sea: "Air full of foam", action: "Avoid by routeing (see cyclone 1-2-3 rule). Never intentionally enter." },
];

export interface CloudInfo {
  id: string;
  name: string;
  level: string;
  looks: string;
  means: string;
}

export const CLOUDS: CloudInfo[] = [
  { id: "ci", name: "Cirrus (Ci)", level: "High >6 km", looks: "Thin white feathers, mare's tails", means: "Fair now; thickening Ci + falling pressure = front within 24–36h." },
  { id: "cc", name: "Cirrocumulus (Cc)", level: "High >6 km", looks: "Rippled 'mackerel sky', no shading", means: "Mackerel sky = unsettled turn within ~12h." },
  { id: "cs", name: "Cirrostratus (Cs)", level: "High >6 km", looks: "Milky veil, halo around sun/moon", means: "Halo = warm front approaching; rain in 12–24h." },
  { id: "ac", name: "Altocumulus (Ac)", level: "Mid 2–6 km", looks: "Grey-white rolls/patches, lens shapes", means: "Towering Ac (castellanus) = instability; thunderstorms possible." },
  { id: "as", name: "Altostratus (As)", level: "Mid 2–6 km", looks: "Featureless grey sheet, sun dimly visible", means: "Thickening ahead of a warm front; steady rain follows." },
  { id: "ns", name: "Nimbostratus (Ns)", level: "Low <2 km", looks: "Dark wet sheet, ragged shreds below", means: "Continuous rain/snow. Poor visibility for hours." },
  { id: "cu", name: "Cumulus (Cu)", level: "Low <2 km", looks: "Isolated cotton puffs, flat bases", means: "Fair-weather puffs; growing towers (TCu) = showers/squalls." },
  { id: "cb", name: "Cumulonimbus (Cb)", level: "Low → top", looks: "Huge tower with anvil top", means: "THUNDERSTORM: squalls, hail, lightning, waterspouts. Give 5+ nm berth, alter course." },
  { id: "sc", name: "Stratocumulus (Sc)", level: "Low <2 km", looks: "Lumpy grey rolls in sheets", means: "Generally dry; evening Sc after a front = improving." },
  { id: "st", name: "Stratus (St)", level: "Low <2 km", looks: "Flat grey blanket, hill fog at sea", means: "Drizzle, poor visibility; advection fog over cold water." },
];

export const WEATHER_NOTES: DocSection[] = [
  {
    heading: "Pressure, Fronts & Wind Rules",
    icon: "🌀",
    points: [
      "LOW (cyclone, 'L'): winds spiral IN, anticlockwise in N hemisphere (clockwise in S). Rising air = cloud + rain. Tightly packed isobars = strong wind.",
      "HIGH (anticyclone, 'H'): winds spiral OUT, clockwise N (anticlockwise S). Sinking air = settled, light winds; winter highs can trap fog.",
      "BUYS BALLOT'S LAW (N hemisphere): face the wind — low pressure is on your RIGHT (reverse in S hemisphere). Quick check on any synoptic chart.",
      "COLD FRONT (triangles): steep, fast; line squalls, heavy showers, sharp wind veer (SW→NW in N hemisphere), pressure jumps up after.",
      "WARM FRONT (semicircles): gentle slope; high cloud → thickening → steady rain; wind backs (S→SE in N hemisphere), visibility poor in the rain band.",
      "OCCLUDED FRONT (triangles + semicircles): cold front caught the warm front — mixed heavy weather. STATIONARY (alternating) = prolonged rain.",
      "BACKING vs VEERING (N hemisphere): backing = wind turning anticlockwise (e.g. W→S, often worsening); veering = clockwise (e.g. S→W, often improving after a front). Opposite in S hemisphere.",
      "Pressure tendency matters more than the number: falling >3 hPa/3h = gale developing; rising fast after a low = strong but improving winds.",
    ],
  },
  {
    heading: "Tides: Springs, Neaps & Rule of Twelfths",
    icon: "🌙",
    points: [
      "SPRINGS (new/full moon): sun + moon pull together — biggest range, strongest streams. NEAPS (quarters): smallest range, weakest streams.",
      "HW/LW times advance ~50 min per day. Always use the local tide tables/ATLAS for the port — almanac means are not enough for UKC-critical berths.",
      "RULE OF TWELFTHS (rise/fall per hour of a 6h tide): 1/12, 2/12, 3/12, 3/12, 2/12, 1/12 of the range. Mid-tide hours move fastest — plan UKC and stream allowance there.",
      "Tidal diamonds (letters on chart) link to stream tables: direction + rate at HW ± hours. Wind against spring tide = steep, dangerous seas at headlands.",
      "Drying heights (upright figures) and chart datum (usually lowest astronomical tide): a '3.1' upright rock needs 3.1m of tide before it even covers.",
    ],
  },
  {
    heading: "Sea State, Swell & Dangerous Phenomena",
    icon: "🌊",
    points: [
      "WIND SEA vs SWELL: wind sea = steep, short, aligned with current wind; swell = long, regular, from a distant storm. Cross swell + wind sea = confused, violent motion.",
      "DOUGLAS SEA SCALE (use with Beaufort): 3 = slight (0.5–1.25m), 4 = moderate (1.25–2.5m), 5 = rough (2.5–4m), 6 = very rough (4–6m), 7 = high (6–9m), 9 = phenomenal (14m+).",
      "ROGUE/freak waves: 2× the significant height, often where strong current opposes swell (Agulhas, Gulf Stream, Kuroshio). Slow down and take seas on the bow.",
      "FOG AT SEA: advection fog (warm air over cold water — Grand Banks, N. Pacific) can last days; radiation fog forms on calm clear nights near coasts; sea smoke ('steam fog') in Arctic cold snaps.",
      "THUNDERSTORM SIGNS: towering Cu, anvil Cb, sudden temperature drop, lightning, radar clutter ring. Close hatches, stop deck work/fuelling, secure for squall (wind can jump 40+ kn).",
      "TROPICAL CYCLONES: avoid by the 1-2-3 rule (add 100/200/300 nm error circles at 24/48/72h). N hemisphere: dangerous semicircle is RIGHT of track (stronger wind + pushes you onto track). Heave-to with wind on the safe bow per SMS.",
      "ICE & ICING: freezing spray ices up rigging and raises KG (stability!). Head for warmer water, reduce speed, de-ice with steam/hot water, report ice (sécurité) and check IIP/ice charts.",
      "WATERSOUTS & TORNADOES over water: avoid by 5+ nm; they collapse into violent downdrafts. Report position to VTS/nearby traffic.",
    ],
  },
];

export interface EmergencyCard {
  id: string;
  icon: string;
  title: string;
  alarm: string;
  steps: string[];
  after: string[];
  reference: string;
}

export const EMERGENCY_CARDS: EmergencyCard[] = [
  {
    id: "fire",
    icon: "🔥",
    title: "Fire / Explosion",
    alarm: "Fire alarm — muster fire parties",
    steps: [
      "Raise the alarm: sound fire alarm, announce location of fire on PA.",
      "Inform Master; muster fire teams at stations, headcount.",
      "Close fire doors, skylights, ventilators; stop fans serving the area.",
      "Shut off fuel, cargo and ventilation to the affected space (quick-closing valves).",
      "Attack fire with first-aid appliances (portable extinguishers); boundary cooling of adjacent spaces.",
      "Start fire pumps (including emergency fire pump if needed); charge the main.",
      "If machinery space fire: consider fixed CO₂/foam release per SMS — evacuate and seal space first.",
      "Maintain communications log; prepare GMDSS distress if situation escalates.",
    ],
    after: ["Ventilate and inspect before re-entry (BA sets)", "Preserve evidence, photograph", "Enter in Deck Log + SMS non-conformity"],
    reference: "SOLAS II-2 • Muster List • SMS Fire procedures",
  },
  {
    id: "collision",
    icon: "💥",
    title: "Collision",
    alarm: "General alarm",
    steps: [
      "Sound general alarm; muster crew, headcount.",
      "Stop engines / manoeuvre to minimise further damage; exhibit NUC lights/shapes if unable to manoeuvre.",
      "Close watertight doors; sound all tanks and bilges; inspect damage, check for ingress and injuries.",
      "Inform Master; exchange ship details with other vessel (name, port, next port); offer assistance.",
      "Broadcast urgency/securité message; notify nearest coastal station, company DPA, and P&I correspondent.",
      "Record positions, courses, speeds, visibility, actions taken; save VDR data immediately.",
      "Prepare life-saving appliances; assess stability and oil-spill risk (SOPEP).",
      "Do not admit liability; take photographs.",
    ],
    after: ["Damage survey with class surveyor", "Log + incident report to flag/company"],
    reference: "COLREG • SOLAS V/33 • SMS Collision checklist",
  },
  {
    id: "grounding",
    icon: "🪨",
    title: "Grounding / Stranding",
    alarm: "General alarm",
    steps: [
      "Sound general alarm; muster crew, headcount.",
      "Stop engines; exhibit NUC / aground signals (3 balls / anchor lights as appropriate).",
      "Close watertight doors; sound all tanks, bilges and void spaces; check for ingress and pollution.",
      "Fix position precisely (GPS + bearings + depths); record tide, weather, draft fore/aft.",
      "Inform Master, company DPA, coastal state; broadcast navigational warning if hazard to others.",
      "Assess stability and hull stress before any refloating attempt — sound around the vessel.",
      "Do NOT attempt to refloat under power without assessment; await salvage/class advice if hard aground.",
      "Save VDR data; start engine-room and deck log of all events.",
    ],
    after: ["Underwater survey before sailing", "Charts/ECDIS data and passage plan review"],
    reference: "SOLAS V • SMS Grounding checklist",
  },
  {
    id: "mob",
    icon: "🛟",
    title: "Man Overboard",
    alarm: "MOB alarm — three long blasts + announce side",
    steps: [
      "Shout 'MAN OVERBOARD', throw lifebuoy with light/smoke; note side and time.",
      "Release bridge-wing smoke/lifebuoy; mark MOB on ECDIS/GPS immediately.",
      "Sound three long blasts; post dedicated lookout pointing at the person — never lose sight.",
      "Execute Williamson turn / Anderson turn as appropriate; slow down.",
      "Muster crew, headcount; prepare rescue boat crew in immersion suits.",
      "Broadcast urgency (PAN-PAN) with position; request assistance from nearby vessels.",
      "Recover casualty with boat or crane; treat hypothermia; prepare for medevac if needed.",
      "Log all times, positions and actions.",
    ],
    after: ["Drill review: time to recovery", "Check lifebuoy lights/smoke expiry"],
    reference: "SOLAS III • IAMSAR Vol III • SMS MOB checklist",
  },
  {
    id: "abandon",
    icon: "🚨",
    title: "Abandon Ship",
    alarm: "General alarm + verbal order 'ABANDON SHIP'",
    steps: [
      "Master's order only: broadcast MAYDAY with position, persons on board and nature of distress.",
      "Muster at embarkation stations with lifejackets + immersion suits; headcount against crew list.",
      "Launch lifeboats/liferafts per muster list; EPIRB and SART activated and taken.",
      "Take GMDSS portables, pyrotechnics, first-aid kit, water and Master's document bag if time permits.",
      "Board, keep painter secured until ordered to let go; clear the ship's side.",
      "Stream sea anchor, activate SARTs, keep together; treat injured, guard against hypothermia.",
    ],
    after: ["Account for all souls", "Maintain 406 MHz EPIRB registration current"],
    reference: "SOLAS III • LSA Code • Muster List",
  },
  {
    id: "flooding",
    icon: "🌊",
    title: "Flooding / Hull Damage",
    alarm: "General alarm",
    steps: [
      "Sound general alarm; muster damage-control party, headcount.",
      "Locate ingress: sound tanks, inspect compartments; close watertight doors and valves.",
      "Start bilge/ballast pumps; rig portable pumps and collision mats/shoring as needed.",
      "Reduce speed / alter course to ease stress and sea pressure on damaged area.",
      "Assess stability (GM, list, free surface); consider ballast shift per damage-stability guidance.",
      "Inform Master, company, nearest coastal station; prepare distress if list worsens.",
      "Log soundings at fixed intervals to track ingress rate.",
    ],
    after: ["Shoring and dewatering gear restowed", "Class notification + repair plan"],
    reference: "SOLAS II-1 • SMS Damage control",
  },
  {
    id: "oilspill",
    icon: "🛢️",
    title: "Oil Spill / Pollution",
    alarm: "Spill alarm — stop all transfer operations",
    steps: [
      "STOP the operation: close manifold/sounding valves, stop pumps and bunker transfer.",
      "Raise alarm; muster spill team; deploy scuppers plugs already in place — verify.",
      "Contain on deck: sawdust/sorbents, prevent deck drains reaching sea; boom if alongside.",
      "Estimate quantity and source; stop the source before cleanup.",
      "Inform Master; notify coastal state/port and company per SOPEP/SMPEP contact list.",
      "Record in Oil Record Book / Cargo Record Book; photograph; retain samples.",
      "Commence cleanup with SOPEP equipment; dispose of residues through reception facilities.",
    ],
    after: ["SOPEP stores replenished", "Root-cause report to company"],
    reference: "MARPOL I • SOPEP/SMPEP • SMS Spill procedures",
  },
  {
    id: "steering",
    icon: "🎡",
    title: "Steering Gear Failure",
    alarm: "Steering failure alarm — inform Master + engine room",
    steps: [
      "Engage follow-up/non-follow-up or change over to second power unit; try alternate steering position.",
      "Reduce speed; exhibit NUC signals if unable to steer; sound fog signal if restricted visibility.",
      "Inform Master and Chief Engineer; switch to emergency/hand steering per posted instructions.",
      "Broadcast sécurité message; show NUC lights/shapes; post extra lookouts.",
      "Fix position; assess drift, traffic and proximity to danger; consider anchoring.",
      "Log failure time, actions, positions; test after repair with full rudder movements.",
    ],
    after: ["Steering gear drill within required intervals", "Defect reported to class if major"],
    reference: "SOLAS II-1/29 • SMS Steering failure",
  },
  {
    id: "blackout",
    icon: "💡",
    title: "Main Engine Failure / Blackout",
    alarm: "Engine alarm — inform bridge/engine room",
    steps: [
      "Bridge: exhibit NUC signals; start sound signals if restricted visibility; fix position and monitor drift.",
      "Reduce sail / stop way; prepare anchors for emergency letting go.",
      "Engine room: start emergency generator (auto/manual), restore steering and essential services first.",
      "Broadcast sécurité message with position and status; inform Master and company.",
      "Do not attempt restart until cause is known; follow SMS restart precautions (air, fuel, LO).",
      "Keep traffic plot updated; request tug assistance early if near danger.",
    ],
    after: ["Dead-ship restart drill logged", "Fuel/LO quality checked if contributory"],
    reference: "SOLAS II-1 • SMS Blackout recovery",
  },
  {
    id: "heavyweather",
    icon: "🌪️",
    title: "Heavy Weather",
    alarm: "Heavy weather precautions — Master's briefing",
    steps: [
      "Obtain latest forecast; consider routeing advice; reduce speed and adjust course to ease motions.",
      "Secure all deck cargo, lashings, hatch covers, ventilators and openings; check freeing ports clear.",
      "Ballast to good seagoing condition; check stability/GM for the voyage leg.",
      "Close and dog all watertight doors, ports and skylights; rig lifelines on exposed decks.",
      "Stop deck work; crew briefed — no one on exposed decks without permission and lifejacket.",
      "Increase pitching/rolling log entries; monitor machinery (LO levels, air) and lashings hourly.",
      "Report position and condition to company per heavy-weather policy.",
    ],
    after: ["Damage and lashing inspection after weather", "Note sea protest if cargo affected"],
    reference: "SOLAS V • CSS Code • SMS Heavy weather",
  },
  {
    id: "piracy",
    icon: "🏴‍☠️",
    title: "Piracy / Armed Attack",
    alarm: "Piracy alarm — all crew to citadel/muster point",
    steps: [
      "Raise alarm; all crew withdraw to citadel/safe muster point; headcount.",
      "Activate SSAS; report to UKMTO/MSCHOA/company CSO with position, course, speed, description of threat.",
      "Increase speed, commence evasive manoeuvres; keep skiffs in the wash; do NOT stop.",
      "Muster fire hoses / water spray; switch on deck lighting; secure accommodation (BMP measures).",
      "Maintain VHF watch; broadcast urgency if attacked; log all events with times.",
      "Do not resist armed boarding — life first; comply, observe, remember details.",
      "After: preserve evidence, photograph, report to coastal state and flag.",
    ],
    after: ["BMP voyage registration (UKMTO) before HRA transit", "SSAS test per schedule"],
    reference: "BMP (Best Management Practices) • ISPS • SSAS procedures",
  },
  {
    id: "dragging",
    icon: "⚓",
    title: "Anchor Dragging",
    alarm: "Anchor drag alarm — call Master",
    steps: [
      "Confirm dragging: ECDIS anchor alarm, radar ranges/bearings, visual transits, D/GPS track.",
      "Inform Master immediately; engines to standby, crew to anchor stations.",
      "Veer more cable if swinging room permits; otherwise heave up and re-anchor or get underway.",
      "Broadcast sécurité if drifting toward traffic or shallows; exhibit NUC if not under command.",
      "Monitor continuously with parallel indexing until situation resolved and anchor holding.",
      "Log positions at short intervals; inspect windlass/brake after recovery.",
    ],
    after: ["Review scope and holding ground choice", "Check charted cables/wrecks in new berth"],
    reference: "SMS Anchoring • Bridge Procedures Guide",
  },
];

// ---------- Phonetic alphabet + signal flags + Morse ----------

export interface PhoneticEntry {
  letter: string;
  word: string;
  say: string;
  morse: string;
  flag: string;
}

export const PHONETIC: PhoneticEntry[] = [
  { letter: "A", word: "Alfa", say: "AL-fah", morse: ".−", flag: "Diver down — keep well clear at slow speed." },
  { letter: "B", word: "Bravo", say: "BRAH-voh", morse: "−...", flag: "Taking in, discharging or carrying dangerous goods." },
  { letter: "C", word: "Charlie", say: "CHAR-lee", morse: "−.−.", flag: "Yes / affirmative." },
  { letter: "D", word: "Delta", say: "DEL-tah", morse: "−..", flag: "Keep clear — manoeuvring with difficulty." },
  { letter: "E", word: "Echo", say: "ECK-oh", morse: ".", flag: "Altering course to starboard." },
  { letter: "F", word: "Foxtrot", say: "FOKS-trot", morse: "..−.", flag: "Disabled — communicate with me." },
  { letter: "G", word: "Golf", say: "golf", morse: "−−.", flag: "Require a pilot (fishing: hauling nets)." },
  { letter: "H", word: "Hotel", say: "hoh-TELL", morse: "....", flag: "Pilot on board." },
  { letter: "I", word: "India", say: "IN-dee-ah", morse: "..", flag: "Altering course to port." },
  { letter: "J", word: "Juliett", say: "JEW-lee-ETT", morse: ".−−−", flag: "On fire with dangerous cargo / leaking — keep clear." },
  { letter: "K", word: "Kilo", say: "KEY-loh", morse: "−.−", flag: "Wish to communicate with you." },
  { letter: "L", word: "Lima", say: "LEE-mah", morse: ".−..", flag: "Stop immediately." },
  { letter: "M", word: "Mike", say: "mike", morse: "−−", flag: "Stopped, making no way through the water." },
  { letter: "N", word: "November", say: "no-VEM-ber", morse: "−.", flag: "No / negative." },
  { letter: "O", word: "Oscar", say: "OSS-cah", morse: "−−−", flag: "Man overboard." },
  { letter: "P", word: "Papa", say: "pah-PAH", morse: ".−−.", flag: "About to proceed to sea — all report on board (Blue Peter)." },
  { letter: "Q", word: "Quebec", say: "keh-BECK", morse: "−−.−", flag: "Healthy — request free pratique." },
  { letter: "R", word: "Romeo", say: "ROW-me-oh", morse: ".−.", flag: "No single-flag meaning (with numerals: range in miles)." },
  { letter: "S", word: "Sierra", say: "see-AIR-ah", morse: "...", flag: "Operating astern propulsion." },
  { letter: "T", word: "Tango", say: "TANG-go", morse: "−", flag: "Keep clear (fishing: pair trawling)." },
  { letter: "U", word: "Uniform", say: "YOU-nee-form", morse: "..−", flag: "You are running into danger." },
  { letter: "V", word: "Victor", say: "VIK-tah", morse: "...−", flag: "Require assistance." },
  { letter: "W", word: "Whiskey", say: "WISS-key", morse: ".−−", flag: "Require medical assistance." },
  { letter: "X", word: "X-ray", say: "ECKS-ray", morse: "−..−", flag: "Stop your intentions, watch my signals." },
  { letter: "Y", word: "Yankee", say: "YANG-key", morse: "−.−−", flag: "Dragging anchor." },
  { letter: "Z", word: "Zulu", say: "ZOO-loo", morse: "−−..", flag: "Require a tug (fishing: shooting nets)." },
];

export const PHONETIC_NUMERALS: { digit: string; word: string; say: string; morse: string }[] = [
  { digit: "1", word: "Wun", say: "wun", morse: ".−−−−" },
  { digit: "2", word: "Too", say: "too", morse: "..−−−" },
  { digit: "3", word: "Tree", say: "tree", morse: "...−−" },
  { digit: "4", word: "Fower", say: "FOW-er", morse: "....−" },
  { digit: "5", word: "Fife", say: "fife", morse: "....." },
  { digit: "6", word: "Six", say: "six", morse: "−...." },
  { digit: "7", word: "Seven", say: "SEV-en", morse: "−−..." },
  { digit: "8", word: "Ait", say: "ait", morse: "−−−.." },
  { digit: "9", word: "Niner", say: "NIN-er", morse: "−−−−." },
  { digit: "0", word: "Zero", say: "ZE-RO", morse: "−−−−−" },
];

export const SIGNAL_NOTES: DocSection[] = [
  {
    heading: "How to use signal flags",
    icon: "🚩",
    points: [
      "Single flags carry the fixed ICS meanings shown on each card — hoist where best seen, dip (lower and re-hoist) at the completion of a signal.",
      "Letter + numeral combos code positions: G = longitude, L = latitude, A = bearing, R = range, T = local time, Z = UTC time.",
      "NC together (November + Charlie) is a DISTRESS signal.",
      "Letters C, D, E, F, H, I, M, O, S, T may also be sounded on the whistle in Morse — same meanings.",
      "Substitute (repeater) pennants repeat an earlier flag without a second set: 1st repeats the 1st flag of the group, 2nd repeats the 2nd, and so on.",
      "Code/answer pennant (red-white vertical stripes) is hoisted as call, shown at the dip while reading, and closed up (full hoist) when a signal is understood.",
    ],
  },
  {
    heading: "Numeral pennants & special hoists",
    icon: "🔢",
    points: [
      "Numeral pennants are triangular and have no single-flag meanings — they complete letter codes (position, time, speed, range).",
      "Q (yellow, 'Quebec') is flown on arrival until free pratique is granted — never lower it early.",
      "B (red) by day warns of dangerous goods operations; A (white-blue) warns of divers down — give both a wide berth and slow down.",
      "P (Blue Peter) in harbour: sailing imminent, all crew report on board.",
      "Dress ship overall (rainbow of flags bow-to-stern) is decoration only — no signalling meaning, and never a substitute for the ensign.",
    ],
  },
];

export interface KnotInfo {
  id: string;
  name: string;
  tr?: string;
  uses: string;
  warning?: string;
  steps: string[];
}

export const KNOTS: KnotInfo[] = [
  {
    id: "bowline",
    name: "Bowline",
    tr: "İzbarço bağı",
    uses: "The king of knots — a fixed loop for sheets, mooring lines, hoisting and rescue loops.",
    warning: "Can shake loose when unloaded and flogging — back it up with a stopper knot for life-critical use.",
    steps: [
      "Form a small loop ('the hole') in the standing part, free end on top.",
      "Bring the working end ('the rabbit') UP through the hole.",
      "Pass it BEHIND the standing part ('round the tree').",
      "Tuck it back DOWN through the hole and dress by pulling loop, end and standing part tight.",
    ],
  },
  {
    id: "clove",
    name: "Clove Hitch",
    tr: "Kazık bağı",
    uses: "Fast temporary fastening to rails, posts and bollards; starting point for lashings; hanging fenders.",
    warning: "Slips and rolls under changing load — never for critical loads; back up with two half hitches.",
    steps: [
      "Pass the end around the post, crossing OVER the standing part to form an X.",
      "Wrap a second time to form a second X on top of the first.",
      "Tuck the end UNDER the last crossing (the diagonal).",
      "Pull both ends to dress — the two crossings must lie parallel, never stacked.",
    ],
  },
  {
    id: "reef",
    name: "Reef (Square) Knot",
    tr: "Camadan bağı",
    uses: "Reefing sails, tying bundles, bandages — light, NON-critical jobs with equal ropes.",
    warning: "NEVER for joining two ropes under load or for life support — it capsizes. Use a sheet bend or carrick bend instead.",
    steps: [
      "Left end OVER right, tuck under ('left over right').",
      "Then right end OVER left, tuck under ('right over left').",
      "Dress flat and symmetric — both tails must exit on the SAME side.",
      "If the tails sit on opposite sides you tied a thief/granny by mistake — redo it.",
    ],
  },
  {
    id: "eight",
    name: "Figure-Eight",
    tr: "Sekiz bağı",
    uses: "Stopper knot at a rope's end — stops sheets and halyards running through blocks.",
    warning: "Bulky but secure; for joining ropes use a figure-eight bend, not two stoppers.",
    steps: [
      "Form a loop with the working end crossing over the standing part.",
      "Pass the end BEHIND the standing part.",
      "Bring it back DOWN through the loop from the top.",
      "Dress so the '8' lies flat with parallel strands.",
    ],
  },
  {
    id: "sheet",
    name: "Sheet Bend",
    tr: "Sancak bağı",
    uses: "Joining two ropes — including different diameters and materials; net work.",
    warning: "Tails must finish on the SAME side; for slippery rope or big size difference use the DOUBLE sheet bend (two turns).",
    steps: [
      "Form a bight (U-turn) in the thicker rope.",
      "Pass the thinner end UP through the bight.",
      "Take it BEHIND both legs of the bight, right round.",
      "Tuck it under ITSELF (not under the bight) and dress tight.",
    ],
  },
  {
    id: "rolling",
    name: "Rolling Hitch",
    uses: "Bending a line to a spar, rail or another rope under lengthwise pull; taking the strain as a stopper.",
    warning: "Direction matters — the turns must bite against the direction of pull or it slides.",
    steps: [
      "Take TWO full turns around the spar on the side the pull comes from.",
      "Take a THIRD turn above the first two, crossing over them.",
      "Lock with a half hitch around the standing part on the pull side.",
      "Test under load before trusting — re-dress if it creeps.",
    ],
  },
  {
    id: "roundturn",
    name: "Round Turn + Two Half Hitches",
    uses: "Mooring to rings, posts and bollards; hanging fenders; securing alongside.",
    warning: "The round turn takes the load — the half hitches only lock it. Keep the turn complete (360°+).",
    steps: [
      "Take a FULL round turn (360°+) around the post or ring.",
      "Pass the end around the standing part and through — first half hitch.",
      "Repeat in the SAME direction — second half hitch.",
      "Pull the standing part to take the strain, slide hitches snug.",
    ],
  },
  {
    id: "timber",
    name: "Timber Hitch",
    tr: "Tomruk bağı",
    uses: "Dragging/hauling spars and logs; starting diagonal lashings.",
    warning: "Holds ONLY under steady tension in the pulling direction — slacks off the moment load releases.",
    steps: [
      "Take a turn around the log, end crossing over the standing part.",
      "Wrap the end back around the standing part.",
      "Tuck it 3+ times around ITSELF inside the loop (each tuck inside the previous).",
      "Haul the standing part — the tucks jam against the log.",
    ],
  },
];

export interface MorseEntry {
  ch: string;
  code: string;
}

export const MORSE_LETTERS: MorseEntry[] = [
  { ch: "A", code: ".−" }, { ch: "B", code: "−..." }, { ch: "C", code: "−.−." },
  { ch: "D", code: "−.." }, { ch: "E", code: "." }, { ch: "F", code: "..−." },
  { ch: "G", code: "−−." }, { ch: "H", code: "...." }, { ch: "I", code: ".." },
  { ch: "J", code: ".−−−" }, { ch: "K", code: "−.−" }, { ch: "L", code: ".−.." },
  { ch: "M", code: "−−" }, { ch: "N", code: "−." }, { ch: "O", code: "−−−" },
  { ch: "P", code: ".−−." }, { ch: "Q", code: "−−.−" }, { ch: "R", code: ".−." },
  { ch: "S", code: "..." }, { ch: "T", code: "−" }, { ch: "U", code: "..−" },
  { ch: "V", code: "...−" }, { ch: "W", code: ".−−" }, { ch: "X", code: "−..−" },
  { ch: "Y", code: "−.−−" }, { ch: "Z", code: "−−.." },
];

export const MORSE_PROSIGNS: { sign: string; code: string; meaning: string }[] = [
  { sign: "SOS", code: "...−−−...", meaning: "Distress — sent as one continuous group." },
  { sign: "AR", code: ".−.−.", meaning: "End of message." },
  { sign: "K", code: "−.−", meaning: "Go ahead — invitation to transmit." },
  { sign: "AS", code: ".−...", meaning: "Wait / stand by." },
  { sign: "SK", code: "...−.−", meaning: "End of contact." },
  { sign: "BT", code: "−...−", meaning: "Break — separator between message parts." },
  { sign: "R", code: ".−.", meaning: "Received (roger)." },
  { sign: "Error", code: "........", meaning: "8+ dits — erase last word, resend." },
];

export const MORSE_NOTES: DocSection[] = [
  {
    heading: "Timing — the 1-3-7 rule",
    icon: "⏱️",
    points: [
      "Dit = 1 unit, dah = 3 units. Gap inside a letter = 1 unit, between letters = 3 units, between words = 7 units.",
      "Keep dahs full length — rushed dahs turn into dits and corrupt the letter (A .− becomes ET .. if squeezed).",
      "Standard speed for signalling lamps is judged by the receiving station — if asked to slow down, halve your rate.",
      "Aldis lamp: aim at the receiving bridge, shade daylight spill, keep spare battery/lamp ready before starting.",
    ],
  },
  {
    heading: "Making and answering a light signal",
    icon: "🔦",
    points: [
      "Call: flash the called station's identity or general call until answered; the receiving station answers with T (−) or its own call sign.",
      "Send text in short groups where possible; end with AR (.−.−.), then wait for R (.−.) as receipt.",
      "Missed a letter: send the error sign (string of dits) and repeat from the last correct word.",
      "SOS (...−−−...) by lamp, whistle, radio or horn is a distress signal — never test it; drills use plain-language 'drill' framing instead.",
      "At night, dim the lamp between groups to avoid dazzling the receiving lookout.",
    ],
  },
  {
    heading: "Sound-signal letters (whistle/horn)",
    icon: "📯",
    points: [
      "Short blast ≈ 1 s (a dit), prolonged blast 4–6 s (a dah) — the same timing as light Morse.",
      "Flag letters C, D, E, F, H, I, M, O, S, T carry the same meaning when sounded in Morse on the whistle.",
      "Manoeuvring signals are NOT Morse: 1 short = to starboard, 2 = to port, 3 = astern, 5+ rapid = doubt/danger.",
      "In restricted visibility the prescribed fog patterns (not Morse) apply — see COLREG sound signals.",
    ],
  },
];

