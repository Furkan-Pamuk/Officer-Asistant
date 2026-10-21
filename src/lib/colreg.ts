// COLREG study reference — complete per-rule summaries in own words
// (not the verbatim IMO text), plus light/sound data for the visual guides.
// The official COLREG text always governs; keep a current copy on board.

export interface ColregRule {
  n: number;
  t: string;
  pts: string[];
}

export const COLREG_RULES: ColregRule[] = [
  { n: 1, t: "Application", pts: [
    "Applies to ALL vessels on the high seas and all connected navigable waters.",
    "No vessel, owner, master or crew is exonerated from the consequences of neglecting any rule.",
    "Nothing in the rules exonerates anyone from the consequences of neglecting precautions required by the ordinary practice of seamen.",
  ]},
  { n: 2, t: "Responsibility", pts: [
    "Departure from the rules is allowed ONLY when necessary to avoid immediate danger — and always with due regard to good seamanship.",
    "In applying the rules, due regard must be paid to all dangers of navigation and collision and to any special circumstances (including the vessels' limitations) that may make departure necessary.",
  ]},
  { n: 3, t: "General definitions", pts: [
    "Vessel = every craft used as transportation on water — includes non-displacement craft, seaplanes and WIG craft.",
    "Power-driven = propelled by machinery. Sailing = under sail with machinery (if fitted) not in use.",
    "Fishing vessel = fishing with gear that restricts manoeuvrability (trawls, lines, nets — not trolling lines alone).",
    "NUC = exceptional circumstance, unable to manoeuvre as required. RAM = work nature restricts manoeuvring (cables, buoys, dredging, replenishment, aircraft ops, mineclearance). CBD = power-driven, draught severely restricts deviation from course.",
    "Underway = not at anchor, made fast, or aground. In sight = observed visually only. Restricted visibility = any condition restricting it (fog, rain, snow, sandstorm).",
  ]},
  { n: 4, t: "Application (conduct in any visibility)", pts: [
    "Rules 5–10 apply in ANY condition of visibility — they are the always-on foundation.",
  ]},
  { n: 5, t: "Lookout", pts: [
    "Proper lookout at ALL times by sight and hearing plus ALL available means (radar, ARPA, AIS, ECDIS, VHF).",
    "Purpose: full appraisal of the situation and risk of collision. No other duty may interfere with keeping lookout.",
  ]},
  { n: 6, t: "Safe speed", pts: [
    "Every vessel shall at all times proceed at a safe speed so she can take proper, effective avoiding action and stop within a distance appropriate to the conditions.",
    "Judge by: visibility, traffic density, manoeuvrability and stopping distance, background lights, draught vs available depth, wind/sea/current and proximity of hazards.",
    "With operational radar: allow for its characteristics, efficiency and constraints — scale in use, sea/weather interference, small vessels and ice detection, number/range/motion of targets. Use long range for early warning.",
  ]},
  { n: 7, t: "Risk of collision", pts: [
    "Use ALL available means — including compass bearings — to determine risk. ARPA/radar plotting where fitted.",
    "Risk exists when the compass bearing of an approaching vessel does not appreciably change (steady bearing + closing range = act).",
    "Risk MAY exist with bearing change: very large vessels, tows, or short range. Never assume safety from a bearing change alone until past and clear.",
    "Never decide on scanty information — especially scanty radar information.",
  ]},
  { n: 8, t: "Action to avoid collision", pts: [
    "Act early, positively and in ample time, with due regard to good seamanship.",
    "Alterations of course and/or speed must be LARGE enough to be readily apparent to the other vessel — a succession of small alterations is forbidden.",
    "With sea room, course alteration alone is usually most effective; check it works (bearing draws, CPA opens) until finally past and clear.",
    "Slacken speed, stop or reverse if necessary; keep engines ready in confined or busy waters.",
    "Avoiding one vessel must not create a close-quarters situation with another — scan the whole picture first.",
  ]},
  { n: 9, t: "Narrow channels", pts: [
    "Keep to the starboard side of the outer limit of the channel or fairway, as safe and practicable.",
    "Vessels under 20 m, sailing vessels and fishing vessels shall NOT IMPEDE vessels that can navigate safely only inside the channel.",
    "Do not cross if it impedes a channel-bound vessel. Overtaking inside is allowed only with the other vessel's agreement (sound signals). Never anchor in a narrow channel.",
    "Fishing vessels shall not obstruct the passage of any other vessel navigating inside the channel.",
  ]},
  { n: 10, t: "Traffic separation schemes", pts: [
    "Proceed in the general direction of traffic for your lane; keep clear of separation lines and zones; join and leave at the ends (or at a small angle to the general direction).",
    "Cross lanes at RIGHT ANGLES as far as practicable. Never use inshore traffic zones as through routes.",
    "Fishing vessels, vessels under 20 m and sailing vessels shall not impede power-driven vessels following a traffic lane.",
    "Vessels constrained by draught show the Rule 28 signals and others must respect that protection.",
    "Separation zones are avoided except when crossing, joining/leaving, or in an emergency.",
  ]},
  { n: 11, t: "Application (vessels in sight)", pts: [
    "Rules 12–18 apply ONLY to vessels in sight of one another — visual contact, not radar alone.",
  ]},
  { n: 12, t: "Sailing vessels", pts: [
    "Different tacks: the port-tack vessel keeps out of the way of the starboard-tack vessel.",
    "Same tack: the windward vessel keeps out of the way of the leeward vessel.",
    "Port-tack vessel unsure of the other's tack must keep out of the way regardless.",
    "Windward side = opposite the side the mainsail (or largest fore-and-aft sail) is carried on.",
  ]},
  { n: 13, t: "Overtaking", pts: [
    "Overtaking = coming up from more than 22.5° abaft the beam (at night: seeing the stern light but neither sidelight).",
    "The overtaking vessel keeps out of the way until FINALLY PAST AND CLEAR — the duty persists even if bearings later change.",
    "In doubt, assume you are the overtaking vessel.",
  ]},
  { n: 14, t: "Head-on situation", pts: [
    "Meeting on reciprocal or nearly reciprocal courses with risk of collision: BOTH alter course to starboard.",
    "Night aspect: both sidelights plus masthead(s) in line or nearly in line.",
    "In doubt, assume a head-on situation exists and act accordingly.",
  ]},
  { n: 15, t: "Crossing situation", pts: [
    "The vessel with the other on its OWN STARBOARD side gives way and shall, if possible, avoid crossing ahead of the other.",
    "The port-side (stand-on) vessel keeps course and speed under Rule 17.",
  ]},
  { n: 16, t: "Action by give-way vessel", pts: [
    "Take EARLY and SUBSTANTIAL action to keep well clear — early, big and obvious.",
  ]},
  { n: 17, t: "Action by stand-on vessel", pts: [
    "Keep course and speed — but MAY act as soon as it becomes clear the give-way vessel is not taking proper action.",
    "MUST act when collision cannot be avoided by the give-way vessel's action alone.",
    "If altering, avoid turning to port for a vessel on your own port side.",
    "Standing on never excuses standing into danger — good seamanship overrules.",
  ]},
  { n: 18, t: "Responsibilities between vessels (pecking order)", pts: [
    "Memory aid: 'New Reels Catch Fish So Purchase Some' — NUC, RAM, CBD, Fishing, Sailing, Power-driven; each keeps clear of all before it.",
    "Power-driven underway keeps clear of NUC, RAM, CBD, fishing and sailing vessels. Sailing keeps clear of NUC, RAM, CBD and fishing. Fishing keeps clear of NUC, RAM and CBD.",
    "Seaplanes on the water keep clear of ALL vessels. WIG craft taking off, landing or flying near the surface keep clear of all vessels.",
    "Within the same category (e.g. power vs power) the steering rules 13–15 decide — the pecking order ranks different categories.",
  ]},
  { n: 19, t: "Conduct in restricted visibility", pts: [
    "No stand-on / head-on / crossing hierarchy — those rules do NOT apply without visual contact (TSS and narrow-channel duties continue).",
    "Every vessel: safe speed adapted to the conditions, engines ready for immediate manoeuvre.",
    "Detection by radar alone forward of the beam: do NOT alter to port (except when overtaking) and do NOT alter toward a vessel abeam or abaft the beam.",
    "Fog signal heard forward of the beam, or close-quarters unavoidable: reduce to minimum steerageway — take all way off if necessary — and navigate with extreme caution until danger is past.",
    "Sound the correct fog signal (Rule 35) at ≤2 min intervals; extra lookouts, lights on, watertight integrity.",
  ]},
  { n: 20, t: "Application (lights and shapes)", pts: [
    "Lights sunset→sunrise and in restricted visibility; shapes by day. No other lights may be mistaken for prescribed lights or impair their visibility, distinctive character, or the keeping of a proper lookout.",
    "Rules 20–31 prescribe what to show; Annex I gives the technical positioning and intensity details.",
  ]},
  { n: 21, t: "Definitions (lights)", pts: [
    "Masthead light: white, unbroken 225° (112.5° each side from right ahead to 22.5° abaft the beam each side).",
    "Sidelights: green starboard / red port, 112.5° each (right ahead to 22.5° abaft the beam).",
    "Stern light: white 135° (67.5° each side from right astern). Towing light: yellow with the same 135° character as a stern light.",
    "All-round light: unbroken 360°. Flashing light: flashes ≥120 per minute.",
  ]},
  { n: 22, t: "Visibility of lights (ranges)", pts: [
    "Vessels ≥50 m: masthead 6 nm; sidelights 3 nm; stern, towing and all-round lights 3 nm.",
    "Vessels 12–50 m: masthead 5 nm (3 nm if under 20 m); sidelights, stern, towing, all-round: 2 nm.",
    "Vessels under 12 m: masthead 2 nm; sidelights 1 nm; stern, towing, all-round: 2 nm.",
    "Inconspicuous, partly submerged tows: dedicated white all-round lights with 3 nm range.",
  ]},
  { n: 23, t: "Power-driven vessels underway", pts: [
    "Under 50 m: ONE masthead + sidelights + stern light (a second masthead abaft and higher is allowed).",
    "50 m and over: fore + main mastheads + sidelights + stern light; sidelights must not be placed forward of the fore masthead.",
    "Air-cushion (hovercraft) non-displacement mode: additionally a yellow all-round flashing light.",
    "WIG craft: red all-round flashing light when taking off, landing or flying near the surface.",
    "Under 12 m: white all-round + sidelights (sidelights may be combined in one lantern); under 7 m at ≤7 kn: white all-round only (plus sidelights if practicable).",
  ]},
  { n: 24, t: "Towing and pushing", pts: [
    "Power-driven towing: TWO mastheads in a vertical line (tow under 200 m) or THREE (tow 200 m+) + sidelights + stern light + yellow towing light above the stern light.",
    "Vessel being towed (manned): sidelights + stern light only — no masthead. Diamond shape by day if the tow exceeds 200 m.",
    "Pushing ahead / towing alongside: two mastheads, sidelights, stern light — but NO towing light. Pushed-ahead vessel shows sidelights at its forward end.",
    "Rigidly connected composite unit = treated as a single power-driven vessel.",
    "Inconspicuous, partly submerged tows carry special all-round white lights spaced along their length.",
  ]},
  { n: 25, t: "Sailing vessels and rowing boats", pts: [
    "Sailing underway: sidelights + stern light; MAY additionally show red-over-green all-round at/near the masthead (never together with a combined lantern).",
    "Under 20 m: sidelights + stern may be combined in ONE lantern at/near the masthead.",
    "Under 7 m: exhibit a white light or torch in sufficient time to prevent collision. Rowing boats: same as sailing under 7 m.",
  ]},
  { n: 26, t: "Fishing vessels", pts: [
    "Trawling (making way or not): green-over-white all-round lights + sidelights and stern light ONLY when making way. Day: two cones apex together.",
    "Other fishing (lines, nets restricting manoeuvrability): red-over-white all-round + sidelights/stern when making way.",
    "Purse seiners with gear hampering manoeuvrability: two yellow lights flashing alternately.",
    "Trolling lines alone do not make a vessel a 'fishing vessel' under the rules.",
  ]},
  { n: 27, t: "Not under command / restricted manoeuvrability", pts: [
    "NUC: two red all-round vertical (+ sidelights/stern only if making way; day: two black balls).",
    "RAM: red-white-red vertical (+ sidelights/stern and mastheads as for her propulsion when making way; day: ball-diamond-ball).",
    "RAM towing: three mastheads vertical instead of one/two, plus the tow's lights. Minesweeping: three GREEN all-round (fore, main, masthead area) + normal power-driven lights; day: three balls.",
    "Dredging/underwater ops with an obstructed side: two reds (blocked side) + two greens (pass side), sidelights/stern/masthead(s) if making way; day: two balls + two diamonds. At anchor: the same minus sidelights/stern/mastheads.",
    "Diving operations: RAM lights + a rigid replica of Code flag A (≥1 m), visible all round.",
  ]},
  { n: 28, t: "Constrained by draught", pts: [
    "Power-driven CBD: THREE red all-round vertical + normal power-driven lights (mastheads, sidelights, stern). Day: a black cylinder.",
    "Other vessels must not impede her where the rules grant that protection (Rules 9, 10, 18).",
  ]},
  { n: 29, t: "Pilot vessels", pts: [
    "On duty: white-over-red all-round at/near the masthead + sidelights and stern light when underway. At anchor: anchor lights PLUS the white-over-red.",
    "Day: flag Hotel (H).",
  ]},
  { n: 30, t: "Anchored and aground", pts: [
    "Anchored under 50 m: one white all-round forward. 50 m+: forward + a second (lower) aft. Day: one black ball forward.",
    "Aground: anchor lights + TWO red all-round vertical. Day: anchor ball + two balls (three balls vertical).",
    "Under 7 m at anchor: exempt except in/near narrow channels, fairways, anchorages or where others navigate.",
    "Deck and working lights are encouraged at anchor (they never replace the prescribed lights).",
  ]},
  { n: 31, t: "Seaplanes", pts: [
    "On the water: exhibit lights and shapes as closely as possible to power-driven vessels of her size — as far as practicable.",
  ]},
  { n: 32, t: "Definitions (sound)", pts: [
    "Whistle = any sound-signalling appliance. Short blast ≈ 1 second. Prolonged blast = 4–6 seconds.",
  ]},
  { n: 33, t: "Sound equipment", pts: [
    "12 m and over: whistle + bell. 100 m and over: whistle + bell + gong (gong tone must not be confused with the bell).",
    "Under 12 m: any other efficient sound means (no whistle/bell required) — but the prescribed SIGNALS still apply.",
  ]},
  { n: 34, t: "Manoeuvring and warning signals (in sight)", pts: [
    "1 short = altering to starboard. 2 shorts = altering to port. 3 shorts = operating astern propulsion.",
    "Overtaking in a narrow channel/fairway: 2 prolonged + 1 short (overtake on her starboard) / 2 prolonged + 2 shorts (on her port); agreement: prolonged-short-prolonged-short.",
    "Bend: vessel out of sight around a bend sounds 1 prolonged; any approaching vessel there answers with 1 prolonged.",
    "Doubt/danger: 5 or more rapid short blasts — and the signal may be supplemented by at least 5 short rapid flashes. Always back it with avoiding action.",
  ]},
  { n: 35, t: "Sound signals in restricted visibility (≤2 min intervals)", pts: [
    "Power-driven MAKING WAY: one prolonged. Power-driven STOPPED (not making way): two prolonged.",
    "NUC, RAM, CBD, sailing, fishing and towing vessels (underway): one prolonged + two shorts.",
    "Vessel towed (manned, normally only the last): one prolonged + three shorts, immediately after her tug's signal.",
    "Pilot vessel on duty: four shorts (identity), plus her fog signal by class when underway/stopped.",
    "Anchored under 100 m: bell 5 s forward; 100 m+: bell forward + gong aft. Aground: anchor signal + three separate bell strokes (before and after rapid ringing). Under 12 m: any efficient sound.",
    "Vessels at anchor or aground may additionally sound Morse R (·—·) as an extra position warning to approaching vessels.",
  ]},
  { n: 36, t: "Signals to attract attention", pts: [
    "Any light or sound that cannot be mistaken for an authorised signal may be used to attract attention — but never embarrass another vessel.",
    "High-intensity intermittent or revolving lights (e.g. strobes) must not be used as such signals.",
  ]},
  { n: 37, t: "Distress signals", pts: [
    "A vessel needing assistance uses the Annex IV signals — gun/explosive ~1 min, continuous fog-apparatus sounding, red rockets/starshells, NC flags, SOS by any method, MAYDAY by voice, square flag with ball, flames aboard, red parachute/hand flare, orange smoke, slow arm raising/lowering, EPIRB/DSC alerting.",
    "On sighting distress: acknowledge, relay to RCC/coast station, log everything, and proceed to assist as able without endangering your own vessel — the duty to assist is a legal obligation.",
  ]},
  { n: 38, t: "Exemptions", pts: [
    "Vessels built before the rules' entry into force are exempted from refitting (keel-laying dates govern) for lights, shapes and sound-apparatus ranges — comply as far as possible.",
    "Exemptions never cover conduct rules (Parts B and D): steering, lookout, safe speed and signals in use apply to every vessel.",
  ]},
];

// ---------- Light configurations (side profile, bow to the right) ----------

export type ShapeKind = "ball" | "coneUp" | "coneDown" | "cyl" | "diamond";

export interface LightConfig {
  id: string;
  name: string;
  note: string;
  masts: { x: number; ys: number[] }[];
  side: boolean;
  stern: boolean;
  tow?: number;
  specials: { c: string; x: number; ys: number[]; label: string }[];
  shapes: ShapeKind[];
}

const W = "#f8fafc";
const R = "#ef4444";
const G = "#22c55e";
const Y = "#eab308";

export const LIGHT_CONFIGS: LightConfig[] = [
  { id: "pd50", name: "Power-driven ≥50 m", note: "Fore + main mastheads; sidelights abaft the fore masthead.", masts: [{ x: 210, ys: [38] }, { x: 110, ys: [28] }], side: true, stern: true, specials: [], shapes: [] },
  { id: "pd12", name: "Power-driven <50 m", note: "Single masthead + sidelights + stern light.", masts: [{ x: 150, ys: [38] }], side: true, stern: true, specials: [], shapes: [] },
  { id: "pd7", name: "Power-driven <12 m", note: "White all-round + sidelights (may combine sidelights in one lantern). Under 7 m at ≤7 kn: white all-round only.", masts: [], side: true, stern: false, specials: [{ c: W, x: 150, ys: [38], label: "all-round" }], shapes: [] },
  { id: "tow", name: "Towing (tow <200 m)", note: "Two mastheads vertical + yellow towing light above the stern light.", masts: [{ x: 150, ys: [28, 44] }], side: true, stern: true, tow: 26, specials: [], shapes: [] },
  { id: "tow200", name: "Towing (tow ≥200 m)", note: "Three mastheads vertical + towing light. Tow shows a diamond by day.", masts: [{ x: 150, ys: [22, 36, 50] }], side: true, stern: true, tow: 26, specials: [], shapes: ["diamond"] },
  { id: "towed", name: "Vessel towed (manned)", note: "Sidelights + stern only — never a masthead.", masts: [], side: true, stern: true, specials: [], shapes: [] },
  { id: "push", name: "Pushing ahead / alongside", note: "Two mastheads vertical, sidelights, stern — but NO towing light. Rigid composite = single power-driven vessel.", masts: [{ x: 150, ys: [28, 44] }], side: true, stern: true, specials: [], shapes: [] },
  { id: "sail", name: "Sailing vessel", note: "Sidelights + stern. May add red-over-green at the masthead (not with a combined lantern).", masts: [], side: true, stern: true, specials: [{ c: R, x: 150, ys: [34], label: "" }, { c: G, x: 150, ys: [48], label: "R over G (optional)" }], shapes: [] },
  { id: "sail20", name: "Sailing <20 m / <7 m / rowing", note: "<20 m: combine into one masthead lantern. <7 m or rowing: white light/torch shown in time.", masts: [], side: false, stern: false, specials: [{ c: W, x: 150, ys: [40], label: "combined / torch" }], shapes: [] },
  { id: "trawl", name: "Trawling", note: "Green over white. Sidelights + stern only when making way. Day: two cones apex together.", masts: [], side: true, stern: true, specials: [{ c: G, x: 150, ys: [40], label: "" }, { c: W, x: 150, ys: [56], label: "G over W" }], shapes: ["coneUp", "coneDown"] },
  { id: "fish", name: "Fishing (other than trawling)", note: "Red over white. Sidelights + stern only when making way. Purse seiners: two alternate-flashing yellows when gear hampers.", masts: [], side: true, stern: true, specials: [{ c: R, x: 150, ys: [40], label: "" }, { c: W, x: 150, ys: [56], label: "R over W" }], shapes: [] },
  { id: "nuc", name: "Not under command", note: "Two reds. Sidelights + stern only if making way. Day: two balls.", masts: [], side: true, stern: true, specials: [{ c: R, x: 150, ys: [40, 58], label: "2× red" }], shapes: ["ball", "ball"] },
  { id: "ram", name: "Restricted manoeuvrability", note: "Red-white-red. Mastheads/sidelights/stern as per propulsion when making way. Day: ball-diamond-ball.", masts: [{ x: 150, ys: [24] }], side: true, stern: true, specials: [{ c: R, x: 185, ys: [44], label: "" }, { c: W, x: 185, ys: [58], label: "" }, { c: R, x: 185, ys: [72], label: "R-W-R" }], shapes: ["ball", "diamond", "ball"] },
  { id: "ramtow", name: "RAM towing", note: "Three mastheads vertical instead of one/two, plus the tow's lights.", masts: [{ x: 150, ys: [22, 36, 50] }], side: true, stern: true, tow: 26, specials: [{ c: R, x: 185, ys: [58], label: "" }, { c: W, x: 185, ys: [70], label: "" }, { c: R, x: 185, ys: [82], label: "R-W-R" }], shapes: ["ball", "diamond", "ball"] },
  { id: "dredge", name: "Dredging, obstructed one side", note: "Two reds (blocked side) + two greens (pass side). Masthead(s)/sidelights/stern if making way. Day: two balls + two diamonds.", masts: [{ x: 150, ys: [24] }], side: true, stern: true, specials: [{ c: R, x: 120, ys: [44, 60], label: "blocked" }, { c: G, x: 195, ys: [44, 60], label: "pass" }], shapes: ["ball", "ball"] },
  { id: "dive", name: "Diving operations", note: "RAM lights + rigid replica of Code flag A (≥1 m), visible all round.", masts: [{ x: 150, ys: [24] }], side: true, stern: true, specials: [{ c: R, x: 185, ys: [58], label: "" }, { c: W, x: 185, ys: [70], label: "" }, { c: R, x: 185, ys: [82], label: "R-W-R + flag A" }], shapes: ["ball", "diamond", "ball"] },
  { id: "mine", name: "Minesweeping", note: "Three green all-rounds + normal power-driven lights. Day: three balls.", masts: [{ x: 150, ys: [24] }], side: true, stern: true, specials: [{ c: G, x: 60, ys: [40], label: "" }, { c: G, x: 150, ys: [52], label: "" }, { c: G, x: 240, ys: [40], label: "3× green" }], shapes: ["ball", "ball", "ball"] },
  { id: "cbd", name: "Constrained by draught", note: "Three reds + normal power-driven lights. Day: black cylinder. Others must not impede.", masts: [{ x: 210, ys: [38] }, { x: 110, ys: [28] }], side: true, stern: true, specials: [{ c: R, x: 150, ys: [40, 54, 68], label: "3× red" }], shapes: ["cyl"] },
  { id: "pilot", name: "Pilot vessel on duty", note: "White over red (+ sidelights/stern underway; anchor lights + W/R at anchor). Day: flag H.", masts: [], side: true, stern: true, specials: [{ c: W, x: 150, ys: [42], label: "" }, { c: R, x: 150, ys: [58], label: "W over R" }], shapes: [] },
  { id: "anchor", name: "At anchor", note: "<50 m: one white all-round forward. ≥50 m: forward + lower aft. Day: one ball forward.", masts: [], side: false, stern: false, specials: [{ c: W, x: 200, ys: [44], label: "anchor light" }], shapes: ["ball"] },
  { id: "aground", name: "Aground", note: "Anchor light(s) + two reds vertical. Day: three balls vertical.", masts: [], side: false, stern: false, specials: [{ c: W, x: 200, ys: [44], label: "anchor" }, { c: R, x: 150, ys: [52, 68], label: "2× red" }], shapes: ["ball", "ball", "ball"] },
  { id: "hover", name: "Hovercraft (non-displacement)", note: "Power-driven lights + yellow all-round flashing light.", masts: [{ x: 150, ys: [38] }], side: true, stern: true, specials: [{ c: Y, x: 185, ys: [52], label: "flashing" }], shapes: [] },
  { id: "wig", name: "WIG craft", note: "On water: power-driven lights. Taking off / landing / flying near surface: red all-round flashing.", masts: [], side: true, stern: true, specials: [{ c: R, x: 150, ys: [40], label: "flashing (airborne)" }], shapes: [] },
];

// ---------- Sound signals ----------

export interface ManeuverSignal { s: string; m: string }

export const MANEUVER_SIGNALS: ManeuverSignal[] = [
  { s: "·", m: "I am altering course to starboard" },
  { s: "··", m: "I am altering course to port" },
  { s: "···", m: "My engines are going astern" },
  { s: "····· +", m: "Doubt / danger — I doubt your action. Back with avoiding action + 5+ rapid flashes by light" },
  { s: "— ·", m: "I intend to overtake on YOUR starboard side (narrow channel)" },
  { s: "— ··", m: "I intend to overtake on YOUR port side (narrow channel)" },
  { s: "— · — ·", m: "Agreement to be overtaken" },
  { s: "—", m: "Bend signal — vessel out of sight around a bend, answered with the same" },
];

export type BlastKind = "P" | "S" | "bell" | "gong" | "R" | "X";

export interface FogPattern {
  v: string;
  seq: BlastKind[];
  note: string;
}

export const FOG_PATTERNS: FogPattern[] = [
  { v: "Power-driven, making way", seq: ["P"], note: "" },
  { v: "Power-driven, stopped (not making way)", seq: ["P", "P"], note: "" },
  { v: "NUC · RAM · CBD · sailing · fishing · towing (underway)", seq: ["P", "S", "S"], note: "" },
  { v: "Vessel towed (manned, normally last only)", seq: ["P", "S", "S", "S"], note: "Immediately after the tug's signal" },
  { v: "Pilot vessel on duty", seq: ["S", "S", "S", "S"], note: "Plus her fog signal by class (underway/stopped)" },
  { v: "At anchor (<100 m)", seq: ["bell"], note: "Bell 5 s forward" },
  { v: "At anchor (≥100 m)", seq: ["bell", "gong"], note: "Bell forward + gong aft" },
  { v: "Aground", seq: ["bell", "bell"], note: "Anchor signal + three separate bell strokes" },
  { v: "Under 12 m", seq: ["X"], note: "Any efficient sound signal instead" },
  { v: "Anchor/aground extra warning", seq: ["R"], note: "Morse R (·—·) to warn approaching vessels" },
];

export const DISTRESS_SIGNALS: string[] = [
  "Gun or explosive signal, ~1 minute intervals",
  "Continuous sounding with any fog-signalling apparatus",
  "Red rockets / shells, fired one at a time at short intervals",
  "Signal NC (November over Charlie)",
  "SOS by any signalling method (light, whistle, radio)",
  "MAYDAY by voice radio",
  "Square flag with a ball above or below it",
  "Flames on the vessel (burning tar / oil barrel)",
  "Red parachute or hand flare showing a red light",
  "Orange smoke signal",
  "Slowly raising and lowering outstretched arms",
  "EPIRB / DSC alerting",
];
