import type { CheckCard } from "./types";

// Workplace areas used across all inspection check-cards.
export const BRIDGE_CATS = [
  "Navigation",
  "Passage plan",
  "GMDSS",
  "Pilotage",
  "Radio",
  "Watchkeeping",
];

export const SAFETY_CATS = [
  "Fire safety",
  "LSA",
  "Drills",
  "Safety",
  "Emergency",
  "Alarms",
  "Safety culture",
  "Safety Management",
  "Security",
  "Permits",
  "Risk",
];

export type CardArea = "bridge" | "deck" | "engine" | "safety";

export function areaOf(card: Pick<CheckCard, "department" | "category">): CardArea {
  if (card.department === "engine") return "engine";
  if (SAFETY_CATS.includes(card.category)) return "safety";
  if (BRIDGE_CATS.includes(card.category)) return "bridge";
  return "deck";
}

export const AREA_LABEL: Record<CardArea, string> = {
  bridge: "Bridge",
  deck: "Cargo · Deck",
  engine: "Engine",
  safety: "Safety",
};
