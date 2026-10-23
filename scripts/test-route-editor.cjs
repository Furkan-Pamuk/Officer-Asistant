// Run with node scripts/test-route-editor.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
const root = path.resolve(__dirname, '..'), cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  new Function('require', 'module', 'exports', ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(
    id => id.startsWith('.') ? load(path.resolve(path.dirname(file), id + '.ts')) : require(id), module, module.exports);
  return module.exports;
}
const route = load(path.join(root, 'src/lib/route.ts'));
const editor = load(path.join(root, 'src/lib/route-editor.ts'));
const original = route.planRoute('FRLEH', 'SEGOT');
const index = original.points.findIndex((p,i) => i > 0 && i < original.points.length - 1 && p.lat > 52 && p.lat < 54 && p.lon > 2 && p.lon < 5);
assert(index > 0, 'Move regression must use an existing offshore network point');
const movedLat = original.points[index].lat + 0.02, movedLon = original.points[index].lon + 0.02;
const moved = original.points.map((point, i) => i === index ? { ...point, id: 'c:manual-test', kind: 'custom', lat: movedLat, lon: movedLon } : point);
assert(editor.canEditTrack(original.points, moved));
const movedPlan = editor.planEditedTrack('FRLEH', 'SEGOT', moved);
assert.equal(movedPlan.points[index].lat, movedLat);
assert.equal(movedPlan.points[index].lon, movedLon);
assert(!movedPlan.points.some(p => p.id === original.points[index].id), 'Moved automatic waypoint must not snap back');
assert.notEqual(movedPlan.totalNm, original.totalNm);
assert.equal(movedPlan.legs.length, moved.length - 1);
assert(Math.abs(movedPlan.totalNm - movedPlan.legs.reduce((sum, leg) => sum + leg.nm, 0)) < 1e-9);

const removeIndex = original.points.findIndex(p => p.id === 'w:dover_ne_s');
assert(removeIndex > 0, 'Removal regression must target an existing point');
const removed = original.points.filter((_, i) => i !== removeIndex);
assert(editor.canEditTrack(original.points, removed));
assert(!editor.planEditedTrack('FRLEH', 'SEGOT', removed).points.some(p => p.id === 'w:dover_ne_s'), 'Deleted waypoint must remain deleted');

const a = original.points[index], b = original.points[index + 1];
const inserted = { id: 'c:insert', kind: 'custom', label: 'Test', lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };
assert.equal(editor.nearestTrackLeg(original.points, inserted.lat, inserted.lon), index);
const withInsertion = [...original.points.slice(0, index + 1), inserted, ...original.points.slice(index + 1)];
assert(editor.canEditTrack(original.points, withInsertion));
assert.equal(editor.planEditedTrack('FRLEH', 'SEGOT', withInsertion).points[index + 1].id, 'c:insert');
assert.deepEqual(editor.restoreEditedTrack(JSON.parse(JSON.stringify(moved)), 'FRLEH', 'SEGOT'), moved, 'Reload must preserve the edited coordinates and order');
assert.equal(editor.restoreEditedTrack(moved, 'SEGOT', 'FRLEH'), null);
assert.equal(editor.restoreEditedTrack([{ ...moved[0], lat: NaN }, ...moved.slice(1)], 'FRLEH', 'SEGOT'), null);
const onLand = original.points.map((p, i) => i === index ? { ...p, lat: 50.87, lon: 1.62 } : p);
assert.equal(editor.canEditTrack(original.points, onLand), false, 'Land drop must be rejected');
const missingEndpoint = original.points.slice(1);
assert.equal(editor.canEditTrack(original.points, missingEndpoint), false);
assert(editor.canEditTrack(original.points, original.points));
assert.equal(editor.nearestTrackLeg([{ lat: 0, lon: 179 }, { lat: 0, lon: -179 }, { lat: 10, lon: -150 }], 0, 180), 0);
console.log('PASS: waypoint move/delete/insert, no automatic snapback, changed distances, persistence, land rejection, endpoints, antimeridian insertion.');
