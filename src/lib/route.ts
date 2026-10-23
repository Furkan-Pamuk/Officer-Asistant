import { courseDeg } from "./legacy-route";
import type { RouteLeg } from "./legacy-route";
export { haversineNm, isWater, isWaterSegment, wrapLon, unwrapTrack, formatDuration, courseDeg } from "./legacy-route";
export type { RouteLeg, RoutePlan, TrackPoint, ExtraNode, CustomStop } from "./legacy-route";
export { planRoute, planRouteWithStops } from "./searoute";

// Display only: group the dense Eurostat track into readable near-collinear
// legs. The map and editor retain every point; distances are summed exactly.
export function mergeLegs(legs: RouteLeg[]): RouteLeg[] {
  if (!legs.length) return [];
  const output: RouteLeg[] = [];
  let current = { ...legs[0] };
  for (const next of legs.slice(1)) {
    const a = courseDeg(current.fromLat, current.fromLon, current.toLat, current.toLon);
    const b = courseDeg(next.fromLat, next.fromLon, next.toLat, next.toLon);
    let turn = Math.abs(a - b) % 360;
    if (turn > 180) turn = 360 - turn;
    if (turn <= 5 && !current.via && !next.via) {
      current = { ...current, to: next.to, toLat: next.toLat, toLon: next.toLon, nm: current.nm + next.nm };
    } else { output.push(current); current = { ...next }; }
  }
  output.push(current);
  return output;
}
