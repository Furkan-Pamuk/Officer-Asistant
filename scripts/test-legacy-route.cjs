// Run with: node scripts/test-route.cjs (uses the project's existing TypeScript).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loadRoute(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    new Function('require', 'module', 'exports', compiled)((id) => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      return id.startsWith('.') ? load(path.resolve(path.dirname(file), id + '.ts')) : require(id);
    }, module, module.exports);
    return module.exports;
  }
  return { route: load(path.join(root, 'src/lib/legacy-route.ts')), ports: load(path.join(root, 'src/lib/ports.ts')).PORTS };
}

const { route, ports } = loadRoute();
const plan = route.planRoute('FRLEH', 'SEGOT');
assert(plan && plan.totalNm < 800, 'Le Havre–Gothenburg must avoid the old 1,046 nm detour');
assert.equal(plan.points[1].id, 'w:le_havre_approach');
assert(plan.points.some(p => p.id === 'w:dover_ne_gris'));
assert.equal(plan.points.at(-2).id, 'w:skagen');
assert(!plan.points.some(p => ['w:channel_c', 'w:kattegat'].includes(p.id)));
const reverse = route.planRoute('SEGOT', 'FRLEH');
assert(reverse.points.some(p => p.id === 'w:dover_sw_gris'));
assert(!reverse.points.some(p => p.id.startsWith('w:dover_ne')));
assert(!plan.points.some(p => p.id.startsWith('w:dover_sw')));
assert.equal(route.isWater(50.87, 1.62), false, 'Cap Gris-Nez must be represented as land');
assert.equal(route.isWaterSegment(49.49, 0.11, 51, 1.8), false, 'Reject the previously accepted Le Havre–Calais land crossing');
for (const passage of [plan, reverse]) {
  for (const leg of passage.legs.filter(l => l.from !== 'Gothenburg' && l.to !== 'Gothenburg')) {
    assert(route.isWaterSegment(leg.fromLat, leg.fromLon, leg.toLat, leg.toLon), leg.from + ' → ' + leg.to + ' must remain offshore');
  }
}
assert.deepEqual(route.planRouteWithStops('FRLEH', 'SEGOT', []), plan);
assert.equal(route.planRoute('FRLEH', 'SEGOT', ['dover']), null);
assert.equal(route.planRoute('FRLEH', 'FRLEH'), null);
assert.equal(route.planRoute('UNKNOWN', 'SEGOT'), null);

for (const [from, to, canal] of [['NLRTM', 'SGSIN', 'suez'], ['USNYC', 'USLAX', 'panama']]) {
  const open = route.planRoute(from, to), closed = route.planRoute(from, to, [canal]);
  assert(open && closed && closed.totalNm > open.totalNm + 1000, canal + ' closure must still force a detour');
}
const stop = { lat: 53.5, lon: 3 };
assert(route.planRouteWithStops('FRLEH', 'SEGOT', [stop]).points.some(p => p.kind === 'custom' && p.lat === stop.lat && p.lon === stop.lon));
const avoided = route.planRouteWithStops('FRLEH', 'SEGOT', [], ['hanstholm_off']);
assert(!avoided || !avoided.points.some(p => p.id === 'w:hanstholm_off'));

// A small island misses endpoint/midpoint checks; a new connector must not cross it.
function fixture(land = [], closed = []) {
  return loadRoute({
    './ports': { PORTS: [
      { code: 'P', name: 'P', lat: 0, lon: 0 },
      { code: 'Q', name: 'Q', lat: 3, lon: 0 },
    ] },
    './route-data': {
      WAYPOINTS: [
        { id: 'g', name: 'Gateway', lat: 0, lon: 2 },
        { id: 'b', name: 'Neighbour', lat: 2, lon: 0 },
        { id: 't', name: 'Target', lat: 3, lon: 0 },
      ],
      EDGES: [['g', 'b'], ['b', 't']],
      DIRECTED_EDGES: [],
      PORT_GATEWAYS: { P: ['g'], Q: ['t'] },
      CHOKEPOINTS: [{ id: 'passage', edges: [['g', 'b']] }],
    },
    './routing-land': { LAND_RINGS: land },
  }).route.planRoute('P', 'Q', closed);
}
assert.equal(fixture().points[1].id, 'w:b', 'Clear approach should remove the gateway detour');
assert.equal(fixture([[[-0.1, 0.4], [0.1, 0.4], [0.1, 0.5], [-0.1, 0.5], [-0.1, 0.4]]]).points[1].id, 'w:g', 'Island must block the shortcut');
assert.equal(fixture([], ['passage']), null, 'New approaches must not bypass a closed gateway edge');

let checked = 0;
for (const port of ports) for (const hub of ['NLRTM', 'SGSIN', 'USNYC']) {
  if (port.code === hub) continue;
  const result = route.planRoute(port.code, hub);
  assert(result, port.code + ' → ' + hub + ' must remain connected');
  assert(!result.points.slice(1, -1).some(p => p.kind === 'port'), 'Ports must not bridge unrelated sea lanes');
  assert(Math.abs(result.totalNm - result.legs.reduce((n, l) => n + l.nm, 0)) < 1e-7);
  assert(result.totalNm + 1e-7 >= route.haversineNm(result.from.lat, result.from.lon, result.to.lat, result.to.lon));
  checked++;
}
console.log('PASS: gateway detours, detailed Calais coast, directed NE/SW lanes, coastline intersection, closures, stops, avoidance; ' + checked + ' port pairs.');
