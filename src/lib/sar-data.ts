// SAR directory + first-aid study notes.
// Centre phone/emails verified against official sources (Oct 2026) —
// where no official number could be confirmed the field is left blank and
// the card points to ALRS Vol 5 / GISIS. Never invent contact details.
export interface SarCentre {
  n: number;
  name: string;
  authority: string;
  coverage: string;
  lat: number;
  lon: number;
  phone?: string;
  email?: string;
}

export const SAR_CENTRES: SarCentre[] = [
  { n: 1, name: "MSRCC Ankara", authority: "Türkiye (Ministry of Transport / Coast Guard)", coverage: "Turkish SRR — Black Sea, Aegean, E. Mediterranean", lat: 39.93, lon: 32.86, phone: "+90 312 231 9105", email: "trmrcc@udhb.gov.tr" },
  { n: 2, name: "JRCC Piraeus", authority: "Hellenic Coast Guard", coverage: "Greek SRR — Aegean, Ionian, E. Mediterranean", lat: 37.94, lon: 23.64, phone: "+30 210 4112500", email: "jrccpgr@hcg.gr" },
  { n: 3, name: "IMRCC Rome", authority: "Italian Coast Guard", coverage: "Italian SRR — Central Mediterranean", lat: 41.9, lon: 12.5, phone: "+39 0659084409", email: "itmrcc@mit.gov.it" },
  { n: 4, name: "CNCS Madrid", authority: "SASEMAR Salvamento Marítimo", coverage: "Spanish SRR — national coordination incl. straits & Canaries", lat: 40.42, lon: -3.7, phone: "+34 91 755 9132", email: "CNCS@SASEMAR.ES" },
  { n: 5, name: "NMOC Fareham (JRCC UK)", authority: "HM Coastguard", coverage: "UK SRR — Channel, North Sea, Atlantic approaches", lat: 50.85, lon: -1.28, phone: "+44 344 382 0025", email: "ukmrcc@hmcg.gov.uk" },
  { n: 6, name: "CROSS Gris-Nez", authority: "France", coverage: "Dover Strait / Southern North Sea approaches", lat: 50.87, lon: 1.58, phone: "+33 3 21 87 21 87" },
  { n: 7, name: "MRCC Lisboa", authority: "Portuguese Navy", coverage: "Lisbon SRR — W. Iberia, Madeira approaches", lat: 38.7, lon: -9.4, phone: "+351 21 440 1919", email: "mrcc.lisboa@marinha.pt" },
  { n: 8, name: "RCC Valletta", authority: "Armed Forces of Malta", coverage: "Malta SRR — Central Mediterranean", lat: 35.9, lon: 14.51, phone: "+356 21257267", email: "rccmalta@gov.mt" },
  { n: 9, name: "JRCC Larnaca", authority: "Cyprus (Ministry of Defence)", coverage: "Nicosia FIR / Cyprus SRR — E. Mediterranean", lat: 34.98, lon: 33.63, phone: "+357 24643005", email: "info@jrcc.org.cy" },
  { n: 10, name: "MRCC Rijeka", authority: "Croatia", coverage: "Croatian Adriatic (national number 195)", lat: 45.33, lon: 14.44, phone: "+385 51 195", email: "mrcc@pomorstvo.hr" },
  { n: 11, name: "MRCC Mumbai", authority: "Indian Coast Guard", coverage: "Indian SRR (West) — Arabian Sea", lat: 19.07, lon: 72.87, phone: "+91 22 24388065", email: "mrcc-west@indiancoastguard.nic.in" },
  { n: 12, name: "MRCC Cape Town", authority: "SAMSA / SASAR", coverage: "Southern African SRR — Cape sea route", lat: -33.9, lon: 18.42, phone: "+27 21 938 3300", email: "mrcc.ct@samsa.org.za" },
  { n: 13, name: "JRCC Canberra", authority: "AMSA", coverage: "Australian SRR — ~10% of Earth's surface", lat: -35.28, lon: 149.13, phone: "+61 2 6230 6811", email: "rccaus@amsa.gov.au" },
  { n: 14, name: "POCC Singapore", authority: "MPA Singapore", coverage: "Singapore Strait / Malacca approaches", lat: 1.26, lon: 103.82, phone: "+65 6226 5539", email: "pocc@mpa.gov.sg" },
  { n: 15, name: "JCG Tokyo", authority: "Japan Coast Guard", coverage: "Japanese SRR — NW Pacific", lat: 35.68, lon: 139.69, phone: "+81 3 3591 6361" },
  { n: 16, name: "JRCC Boston", authority: "US Coast Guard (District 1)", coverage: "NW Atlantic SRR", lat: 42.36, lon: -71.06, phone: "+1 866 842 1560", email: "RCCBoston@uscg.mil" },
  { n: 17, name: "JRCC Alameda", authority: "US Coast Guard (Pacific)", coverage: "NE Pacific SRR", lat: 37.77, lon: -122.28, phone: "+1 510 437 3700", email: "rccalameda1@uscg.mil" },
];

export interface AidSection {
  id: string;
  title: string;
  points: string[];
}

export const FIRST_AID: AidSection[] = [
  {
    id: "drsabcd", title: "🆘 Emergency action — DRSABCD",
    points: [
      "Danger to you, others, casualty. Response: shake + shout — AVPU scale (Alert, Voice, Pain, Unresponsive).",
      "Send for help: raise alarm, call master, prepare MAYDAY/urgency traffic if needed.",
      "Airway: head tilt–chin lift (jaw thrust if spinal injury suspected); clear visible obstructions only.",
      "Breathing: look-listen-feel ≤10 s. Not breathing normally → start CPR, send for AED/oxygen.",
      "CPR adult: 30 compressions : 2 breaths, 100–120/min, 5–6 cm deep, full recoil; AED as soon as available.",
      "Defibrillation + advanced care: continue until professional help, exhaustion, or signs of life.",
    ],
  },
  {
    id: "recovery", title: "🛌 Recovery position (breathing but unconscious)",
    points: [
      "Kneel beside: nearest arm at right angle, far hand to near cheek.",
      "Pull the far knee up, roll them toward you onto their side.",
      "Tilt head back to keep airway open; monitor breathing continuously.",
      "Never leave them alone; keep warm; nil by mouth.",
    ],
  },
  {
    id: "choking", title: "🫁 Choking adult",
    points: [
      "Mild (talking/coughing forcefully): encourage coughing, watch closely.",
      "Severe (silent, clutching throat, blue): 5 back blows between shoulder blades, check mouth.",
      "Then 5 abdominal thrusts (fist above navel, sharp inward-upward pulls). Alternate 5 + 5.",
      "Unconscious: lower gently, start CPR; look in mouth before each breath set.",
    ],
  },
  {
    id: "bleeding", title: "🩸 Severe bleeding",
    points: [
      "Gloves on. Direct firm pressure on the wound with dressing/pad — do not lift to peek.",
      "Add dressings on top if soaked; bandage firmly. Elevate the limb if no fracture suspected.",
      "Tourniquet (limb, life-threatening, pressure failed): 5–7 cm above wound, tighten to stop flow, NOTE THE TIME, never cover or loosen.",
      "Treat for shock; urgent medevac advice for arterial, abdominal, chest or neck bleeding.",
    ],
  },
  {
    id: "shock", title: "🥶 Shock (any major injury/illness)",
    points: [
      "Lie flat, legs raised — UNLESS spinal injury, chest injury, breathing difficulty or vomiting (then recovery position if unconscious).",
      "Keep warm (blankets, remove wet clothing), reassure, nil by mouth.",
      "Oxygen if trained and available; monitor pulse/breathing continuously.",
      "Find and treat the cause (bleeding, burns, allergy, heart) — shock itself is not a diagnosis.",
    ],
  },
  {
    id: "burns", title: "🔥 Burns & scalds",
    points: [
      "Cool with running water 20 minutes minimum, within 3 hours — the single most effective step.",
      "Remove jewellery, watches, belts before swelling; do NOT peel stuck clothing.",
      "Cover loosely with cling film or clean non-fluffy dressing. No ice, creams, butter or toothpaste.",
      "Chemical burns: irrigate 20+ min, remove contaminated clothing carefully. Eye splash: irrigate 20 min, remove contact lenses.",
      "Large/deep, face/hands/feet/joints/genitals/airway burns = medevac advice + burns assessment (palm ≈ 1%).",
    ],
  },
  {
    id: "fractures", title: "🦴 Fractures & spinal injury",
    points: [
      "Immobilise as found: splint joint above + below, sling for arms, padding between legs for lower limbs.",
      "Suspected spinal injury: DO NOT move unless in danger — log-roll only with 3+ helpers, rigid collar if trained.",
      "Check circulation beyond the injury (pulse, colour, warmth, feeling) before and after splinting.",
      "Open fracture: cover with sterile dressing, do NOT push bone back; urgent medevac advice.",
    ],
  },
  {
    id: "hypo", title: "🌡️ Hypothermia & heat illness",
    points: [
      "Hypothermia: handle gently (rough handling can trigger cardiac arrest), insulate from ground, remove wet clothes, gradual rewarm; warm sweet drinks only if fully conscious.",
      "Cold-water casualty: horizontal recovery where possible; rewarm slowly; hospital check even if they 'feel fine' (afterdrop).",
      "Heat exhaustion: shade, lie down, cool with water/fanning, small sips.",
      "Heat stroke (hot dry skin, confusion, collapse): emergency — cool aggressively (ice packs to neck/armpits/groin), medevac advice.",
    ],
  },
  {
    id: "enclosed", title: "🚫 Enclosed-space & electrical rescue",
    points: [
      "DO NOT ENTER a space to rescue without breathing apparatus — most enclosed-space deaths are would-be rescuers.",
      "Raise alarm, ventilate if safe from outside, rescue with BA + lifeline + attendant only.",
      "Electrocution: isolate/switch off power FIRST (or drag clear with dry non-conductor), then DRSABCD + treat entry/exit burns.",
    ],
  },
  {
    id: "poison", title: "☠️ Poisoning & chemical exposure",
    points: [
      "Do NOT induce vomiting (corrosives, hydrocarbons → worse injury). Keep the packaging/SDS for advisors.",
      "Decontaminate: strip clothing, irrigate skin/eyes; save vomit/clothing samples if safe.",
      "Call for advice early: TMAS / MFAG (IMDG Supplement) / poison centre — state substance, amount, time, weight, symptoms.",
      "Gas exposure: remove to fresh air with BA for rescuers; oxygen if trained; hospital for delayed lung injury (NO₂, phosgene, chlorine).",
    ],
  },
  {
    id: "medevac", title: "🚁 Requesting medevac / medical advice",
    points: [
      "Ship name, call sign/MMSI, position + course/speed, weather on scene.",
      "Patient: age, sex, symptoms/vitals (pulse, breathing, BP, temp, consciousness), treatment given, medical history/allergies.",
      "Nature of illness/injury + time of onset; language spoken; helicopter winching area readiness.",
      "Keep a runner/log: record every advice received with time; confirm read-back of drug doses.",
    ],
  },
];
