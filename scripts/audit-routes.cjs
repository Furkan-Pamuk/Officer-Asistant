// Run: node scripts/audit-routes.cjs [optional-report.json]
// Uses existing TypeScript and offline geometry; makes no network requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} };
  modules.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', source)(id => id.startsWith('.')
    ? load(path.resolve(path.dirname(file), id + '.ts')) : require(id), module, module.exports);
  return module.exports;
}
const route = load(path.join(root, 'src/lib/route.ts'));
const { PORTS } = load(path.join(root, 'src/lib/ports.ts'));
const { CHOKEPOINTS, WAYPOINTS } = load(path.join(root, 'src/lib/route-data.ts'));
const fixed = new Set([...CHOKEPOINTS.flatMap(c => c.edges.flat()), ...WAYPOINTS.filter(w => w.corridor).map(w => w.id)].map(id => 'w:' + id));
const coastlineReview = new Map(), nearbyReview = [], failures = [];
const geometry = new Map();
function clear(a, b) {
  const key = [a.lat + ',' + a.lon, b.lat + ',' + b.lon].sort().join('|');
  if (!geometry.has(key)) geometry.set(key, route.isWaterSegment(a.lat, a.lon, b.lat, b.lon));
  return geometry.get(key);
}
let pairs = 0, avoidableTurns = 0;
for (const from of PORTS) for (const to of PORTS) {
  if (from.code === to.code) continue;
  pairs++;
  const plan = route.planRoute(from.code, to.code);
  try {
    assert(plan, 'Disconnected route');
    assert(Number.isFinite(plan.totalNm), 'Non-finite distance');
    assert.equal(plan.points[0].id, 'p:' + from.code);
    assert.equal(plan.points.at(-1).id, 'p:' + to.code);
    assert(!plan.points.slice(1, -1).some(p => p.kind === 'port'), 'Unrelated port used as transit');
    assert(Math.abs(plan.totalNm - plan.legs.reduce((sum, leg) => sum + leg.nm, 0)) < 1e-6, 'Leg sum differs');
    const direct = route.haversineNm(from.lat, from.lon, to.lat, to.lon);
    assert(plan.totalNm + 1e-6 >= direct, 'Distance below direct lower bound');
    if (from.code < to.code && direct < 100 && plan.totalNm > direct * 3 && plan.totalNm - direct > 50) {
      nearbyReview.push({ from: from.code, to: to.code, directNm: direct, routeNm: plan.totalNm });
    }
    for (let i = 0; i < plan.points.length - 1; i++) {
      const a = plan.points[i], b = plan.points[i + 1];
      const leg = plan.legs[i];
      assert(Math.abs(leg.nm - route.haversineNm(a.lat, a.lon, b.lat, b.lon)) < 1e-6, 'Leg geometry differs from distance');
      if (!clear(a, b)) {
        const key = [a.id, b.id].sort().join('|');
        const entry = coastlineReview.get(key) || { a, b, routes: 0 };
        entry.routes++;
        coastlineReview.set(key, entry);
      }
    }
    for (let i = 1; i < plan.points.length - 1; i++) {
      const a = plan.points[i - 1], b = plan.points[i], c = plan.points[i + 1];
      if (fixed.has(b.id) || !clear(a, c)) continue;
      const via = route.haversineNm(a.lat, a.lon, b.lat, b.lon) + route.haversineNm(b.lat, b.lon, c.lat, c.lon);
      const saving = via - route.haversineNm(a.lat, a.lon, c.lat, c.lon);
      if (saving >= 10 && saving / via >= 0.1) avoidableTurns++;
    }
  } catch (error) { failures.push({ from: from.code, to: to.code, error: error.message }); }
}
const report = {
  createdAt: new Date().toISOString(), ports: PORTS.length, pairs, failures, avoidableTurns,
  // Review flags are not confirmed crossings: canals and port coordinates can
  // fall inside this simplified land mask. Do not treat them as a safety verdict.
  coastlineReview: [...coastlineReview.values()].sort((a, b) => b.routes - a.routes),
  nearbyReview,
};
if (process.argv[2]) fs.writeFileSync(path.resolve(process.argv[2]), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ports: report.ports, pairs, failures: failures.length, avoidableTurns,
  coastlineSegmentsForReview: report.coastlineReview.length, nearbyPairsForReview: nearbyReview.length }, null, 2));
assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 10)));
// Candidate open-water chords are reported, not applied to Eurostat lane geometry.
