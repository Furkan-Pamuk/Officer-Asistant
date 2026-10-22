"use client";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { CLEANING_METHODS } from "@/lib/cargo-data";

const STAGES = [
  ["1. Ambient rinse", "Knock down loose residues and cool the tank. For semi-drying/drying oils (soyabean, sunflower, cottonseed) this cold rinse is MANDATORY first — hot water bakes them into a varnish that fails wall-wash."],
  ["2. Main wash", "Hot water (60–80 °C) for most cargoes; caustic circulation for fats, fatty acids and vegetable/animal oils; approved solvent for polymerised monomer residues. Follow the P&A Manual washing program."],
  ["3. Fresh-water rinse", "Remove all cleaning chemicals — leftover caustic or chlorides fail the next cargo's wall-wash and chloride tests."],
  ["4. Ventilate / gas-free", "Mechanical ventilation until readings are safe for the next cargo and for entry. Dense vapours (EDC, perchloroethylene) sit low — sample at several levels, not just the top."],
  ["5. Dry + inspect", "Dry fully (moisture fails methanol/glycol specs), then inspect: wall-wash test, hydrocarbon test, chloride test, permanganate-time test for methanol. Record results."],
];

const PREWASH = [
  "Solidifying cargoes (phenol mp 41 °C, palm oil, tallow, maleic/phthalic anhydrides) — keep heated during discharge and strip completely.",
  "High-viscosity cargoes — follow the P&A Manual prewash procedure and discharge all washings to a reception facility, never overboard.",
  "Check the IBC Code product entry: where it says prewash required, it is mandatory and must be logged with a surveyor endorsement where applicable.",
];

const SPECIAL = [
  ["Polymerising monomers (styrene, vinyl acetate, MMA)", "Valid inhibitor certificate, temperature control and maximum voyage time. Never load uninhibited monomer. Polymer deposits need solvent wash, not hotter water."],
  ["Acids and caustics", "Copious water rinse first, then neutralise wash water as needed. Beware dilution heat (sulphuric acid) and hydrogen gas from light metals."],
  ["Hydrogen peroxide", "Rinse with clean water only — no organics, no rust, no catalysts. Tanks must be passivated and vented; never seal unvented."],
  ["Ethylene / propylene oxide", "Specialist cargoes: inerted systems, no catalytic contaminants (rust, acids, amines). Gas-free thoroughly; follow shore instructions exactly."],
  ["Methanol and glycols", "After washing, tanks must be bone-dry and pass hydrocarbon + chloride + permanganate tests. One damp hose ruins a methanol parcel."],
  ["Molasses / fermentables", "Headspace can hold CO₂ and flammable gas — treat as enclosed space: ventilate, test oxygen and toxics before entry."],
];

const SEGREGATION = [
  "Acids × caustics — violent heat and splashing.",
  "Oxidizers (nitric acid, peroxides) × ALL organics and flammables — fire/explosion.",
  "Amines × acids, chlorinated cargoes, copper alloys.",
  "Nitriles (acrylonitrile) × acids, amines, peroxides — plus cyanide-like toxicity.",
  "Monomers × polymerisation initiators (peroxides, strong acids, UV, rust for some).",
  "Caustics × aluminium, zinc, tin (hydrogen gas) and × ammonium salts (ammonia gas).",
  "Always confirm with the SDS and the USCG compatibility system (46 CFR 150): find each cargo's group in Table 1 (this booklet shows it on every cargo page), intersect the two groups in Figure 1, then check Appendix I exceptions. Appendix I also lists pairs tested dangerously reactive (or unexpectedly compatible) — e.g. caustic soda (5) vs glycols (20), formic acid (4) vs furfuryl alcohol (20).",
];

export default function CargoCleaning() {
  const { t } = useLocale();
  return (
    <div className="grid gap-4">
      <Link href="/cargo" className="text-sm font-bold text-slate-600 underline">{t("cargo.back")}</Link>
      <div>
        <h1 className="text-2xl font-bold">{t("cargo.cleanTitle")}</h1>
        <p className="text-sm text-slate-600">{t("cargo.cleanSub")}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.stages")}</h2>
        <ul className="mt-2 grid gap-2">
          {STAGES.map(([t, b]) => (
            <li key={t} className="text-sm"><span className="font-bold">{t}:</span> {b}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.cleanMethods")}</h2>
        <ul className="mt-2 grid gap-2">
          {CLEANING_METHODS.map((m) => (
            <li key={m.key} className="text-sm"><span className="font-bold">{m.title}:</span> {m.body}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.prewash")}</h2>
        <ul className="mt-2 grid gap-1.5">
          {PREWASH.map((p) => <li key={p} className="list-disc pl-5 text-sm">{p}</li>)}
        </ul>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.special")}</h2>
        <ul className="mt-2 grid gap-2">
          {SPECIAL.map(([t, b]) => (
            <li key={t} className="text-sm"><span className="font-bold">{t}:</span> {b}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.segRules")}</h2>
        <ul className="mt-2 grid gap-1.5">
          {SEGREGATION.map((s) => <li key={s} className="list-disc pl-5 text-sm">{s}</li>)}
        </ul>
      </div>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h2 className="font-bold text-red-800">{t("cargo.safety")}</h2>
        <p className="mt-1 text-sm text-red-900">{t("cargo.safetyBody")}</p>
      </div>
    </div>
  );
}
