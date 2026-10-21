"use client";
import { useState } from "react";

interface Scenario {
  id: string;
  icon: string;
  title: string;
  callout: string;
  steps: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "cpr",
    icon: "❤️",
    title: "Cardiac arrest (CPR + AED)",
    callout: "No response + no normal breathing = start compressions immediately.",
    steps: [
      "Check response: shake shoulders, shout. Shout for help — send someone to fetch the AED and call the Master.",
      "Open airway (head tilt–chin lift), look/listen/feel for breathing max 10 seconds.",
      "If not breathing normally: call/TMAS alert, start chest compressions — centre of chest, 5–6 cm deep, 100–120/min.",
      "30 compressions : 2 breaths. Minimise interruptions; swap compressors every 2 minutes if possible.",
      "Switch on AED as soon as it arrives, follow its voice prompts, resume compressions immediately after shock.",
      "Continue until: casualty wakes/moves/breathes normally, help takes over, or you are exhausted.",
    ],
  },
  {
    id: "choking",
    icon: "🗣️",
    title: "Choking",
    callout: "Can cough/speak? Encourage coughing. Cannot breathe? Act now.",
    steps: [
      "Ask 'Are you choking?' If coughing forcefully: encourage, monitor.",
      "If silent / cannot breathe: lean them forward, give up to 5 sharp back blows between shoulder blades.",
      "If still blocked: up to 5 abdominal thrusts (fist above navel, pull sharply in and up).",
      "Alternate 5 blows / 5 thrusts. Call for help early.",
      "If they collapse: start CPR (chest compressions may expel the object).",
      "After any relief: medical check — internal injuries possible.",
    ],
  },
  {
    id: "bleeding",
    icon: "🩸",
    title: "Severe bleeding",
    callout: "Press hard, don't remove the first dressing.",
    steps: [
      "Gloves on. Press HARD directly on the wound with dressing/cloth.",
      "Keep pressure — add more dressings on top, never remove the first.",
      "Sit/lay casualty down; raise the injured part above heart level if possible.",
      "Limb bleeding uncontrolled? Improvised tourniquet 5–7 cm above wound (NOT on a joint), note the time, do not cover it.",
      "Treat for shock: keep warm and still, reassure, nil by mouth if deteriorating.",
      "Arrange urgent medevac — major blood loss kills in minutes.",
    ],
  },
  {
    id: "burns",
    icon: "🔥",
    title: "Burns / scalds",
    callout: "Cool with running water for 20 minutes.",
    steps: [
      "Stop the burning: remove from heat, smother flames (stop-drop-roll / blanket).",
      "Cool under cool running water for at least 20 minutes — as soon as possible.",
      "Remove jewellery/watches/constricting items before swelling; leave stuck clothing.",
      "Cover loosely with cling film or clean plastic bag (lengthwise, not wrapped tight).",
      "Never: ice, creams, butter, adhesive dressings, or burst blisters.",
      "Large/deep/face/hands/feet/genital/airway burns = medevac. Treat for shock.",
    ],
  },
  {
    id: "fracture",
    icon: "🦴",
    title: "Fracture / spinal injury",
    callout: "Suspect spine? Do NOT move them.",
    steps: [
      "Neck/back pain, numbness, or fall from height / heavy blow? Assume spinal injury: hold head still, call for help.",
      "Log-roll only if airway threatened or must move — keep spine straight, one person holds head.",
      "Immobilise fractures as found: splint joint above + below, padding, check circulation beyond splint.",
      "Open fracture: cover with sterile dressing, do NOT push bone back.",
      "Sprains: rest, ice (wrapped), compression, elevation — no weight bearing.",
      "Pain relief + stillness + medevac advice for any deformed/limb-threatening injury.",
    ],
  },
  {
    id: "heart",
    icon: "💔",
    title: "Heart attack",
    callout: "Chest pain/pressure, sweat, nausea, arm/jaw pain — act fast.",
    steps: [
      "Sit them down, rest completely — no walking, no exertion.",
      "Call Master + TMAS immediately; prepare for medevac.",
      "Aspirin if available, no allergy, and TMAS agrees (chew, don't swallow whole).",
      "Nitroglycerin only if prescribed to them — assist as directed.",
      "Loosen clothing, reassure, monitor breathing/pulse.",
      "If they collapse and stop breathing normally: start CPR + fetch AED.",
    ],
  },
  {
    id: "stroke",
    icon: "🧠",
    title: "Stroke (FAST)",
    callout: "Face – Arms – Speech – Time. Note the exact time symptoms started.",
    steps: [
      "FAST check: Face droop? Arms drift? Speech slurred? → Time to call: note the exact onset time.",
      "Call Master + TMAS immediately — treatment depends on elapsed time.",
      "Lay them down with head/shoulders slightly raised; nothing to eat or drink.",
      "If unconscious but breathing: recovery position, monitor.",
      "Do NOT give aspirin/food/drink (choking + bleeding risk).",
      "Record symptoms + times for the medevac team.",
    ],
  },
  {
    id: "seizure",
    icon: "⚡",
    title: "Seizure / fit",
    callout: "Protect from injury. Never put anything in the mouth.",
    steps: [
      "Clear space, cushion the head, loosen neckwear. Time the seizure.",
      "Do NOT restrain; do NOT put anything in the mouth.",
      "When jerking stops: check breathing, recovery position.",
      "Medevac if: first seizure, lasts >5 min, repeats, breathing difficulty, injury, or diabetic/pregnant casualty.",
      "Stay until fully recovered; explain what happened.",
    ],
  },
  {
    id: "electric",
    icon: "🔌",
    title: "Electric shock",
    callout: "Isolate power FIRST — don't become the second casualty.",
    steps: [
      "Switch off / isolate the supply before touching the casualty.",
      "If still in contact: separate with dry non-conducting material (wood, rope, dry cloth).",
      "Check response + breathing; start CPR + AED if needed.",
      "Treat entry/exit burns (cool + cover); assume internal injury.",
      "Even if they 'feel fine': medevac — delayed heart rhythm problems occur.",
    ],
  },
  {
    id: "hypothermia",
    icon: "🥶",
    title: "Drowning / hypothermia",
    callout: "Handle gently — a cold heart fibrillates easily.",
    steps: [
      "Recover from water with spinal care if trauma possible; shout for help.",
      "Not breathing? Drowning protocol: 5 rescue breaths first, then 30:2 CPR.",
      "Remove wet clothing, dry, insulate from cold (blankets, sleeping bag, vapour barrier).",
      "Handle gently — no rubbing limbs, no sudden movement.",
      "Warm sweet drinks only if fully conscious and can swallow; no alcohol.",
      "Rewarm gradually + urgent medevac — hypothermia can worsen after rescue.",
    ],
  },
];

export default function FirstAid() {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const sc = SCENARIOS.find((s) => s.id === sel) ?? null;

  function toggle(key: string) {
    setTicks((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setSel(null); setTicks({}); }}
        className="flex w-full items-center justify-center gap-3 rounded-3xl bg-red-600 px-6 py-5 text-2xl font-black text-white shadow-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
      >
        <span className="text-3xl">🆘</span> FIRST AID — tap in an emergency
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3" onClick={() => setOpen(false)}>
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white text-stone-900 shadow-2xl dark:bg-neutral-950 dark:text-red-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2 bg-red-600 px-4 py-3 text-white dark:bg-red-800">
              <strong className="text-lg">🆘 First Aid {sc ? `— ${sc.title}` : ""}</strong>
              <div className="flex gap-2">
                {sc && <button onClick={() => { setSel(null); setTicks({}); }} className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">← All</button>}
                <button onClick={() => setOpen(false)} className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">✕ Close</button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {!sc ? (
                <>
                  <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold dark:bg-red-950/40">
                    1. Scene safe? &nbsp;2. Shout for help — send someone to call the Master. &nbsp;3. Radio medical advice (TMAS/MEDICO) early — contacts at the GMDSS station.
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {SCENARIOS.map((s) => (
                      <button key={s.id} onClick={() => { setSel(s.id); setTicks({}); }} className="flex items-center gap-3 rounded-2xl border border-amber-200 p-3 text-left hover:shadow dark:border-red-900">
                        <span className="text-3xl">{s.icon}</span>
                        <span>
                          <span className="block font-black">{s.title}</span>
                          <span className="block text-xs opacity-70">{s.callout}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold dark:bg-red-950/40">⚠️ {sc.callout}</p>
                  <ol className="mt-3 grid gap-2">
                    {sc.steps.map((st, i) => {
                      const key = `${sc.id}:${i}`;
                      const on = !!ticks[key];
                      return (
                        <li key={i}>
                          <button onClick={() => toggle(key)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left ${on ? "border-emerald-500 bg-emerald-50 opacity-70 dark:bg-red-950/40" : "border-amber-200 dark:border-red-900"}`}>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-black ${on ? "bg-emerald-600 text-white" : "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white"}`}>
                              {on ? "✓" : i + 1}
                            </span>
                            <span className={`text-sm font-medium ${on ? "line-through" : ""}`}>{st}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-3 text-xs opacity-60">Guidance per ILCOR/ERC first-aid practice + shipboard reality (TMAS, medevac). Not a substitute for training — drill these scenarios.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
