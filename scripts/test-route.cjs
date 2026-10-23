// Run with node scripts/test-route.cjs. No external services or dependencies.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id),m,m.exports);return m.exports;}
const route=load(path.join(root,'src/lib/route.ts')),ports=load(path.join(root,'src/lib/ports.ts')).PORTS;
const network=load(path.join(root,'src/lib/searoute-network.ts')).network;
assert(network.nodes.length>40000&&network.edges.length>75000,'Full Eurostat network must be bundled');
const forward=route.planRoute('FRLEH','SEGOT'),reverse=route.planRoute('SEGOT','FRLEH');
assert(forward.totalNm<800);
assert(forward.points.some(p=>p.id==='w:dover_ne_gris'));
assert(reverse.points.some(p=>p.id==='w:dover_sw_gris'));
assert(!forward.points.some(p=>p.id.startsWith('w:dover_sw')));
assert(!reverse.points.some(p=>p.id.startsWith('w:dover_ne')));
for(const [from,to,max] of [['JPTOK','JPYOK',60],['CLSAI','CLVAP',120],['USCHS','USSAV',180],['IQUMQ','KWKWI',180]]){
 const p=route.planRoute(from,to);assert(p&&p.totalNm<max,`${from}–${to} must avoid the distant gateway detour`);
}
for(const [from,to,closed] of [['NLRTM','SGSIN','suez'],['USNYC','USLAX','panama'],['FRLEH','SEGOT','dover'],['NLRTM','SGSIN','gibraltar'],['DEHAM','PLGDN','kiel']]){
 const open=route.planRoute(from,to),blocked=route.planRoute(from,to,[closed]);
 assert(open&&blocked&&blocked.totalNm>open.totalNm+100,`${closed} closure must force a real detour`);
 assert(!blocked.via.some(v=>v===({suez:'Suez Canal',panama:'Panama Canal',dover:'Dover Strait',gibraltar:'Strait of Gibraltar',kiel:'Kiel Canal'})[closed]));
}
const stop={lat:53.5,lon:3};const custom=route.planRouteWithStops('FRLEH','SEGOT',[stop]);
assert(custom&&custom.points.some(p=>p.kind==='custom'&&p.lat===stop.lat&&p.lon===stop.lon));
const avoided=forward.points.find(p=>p.id.startsWith('w:sea:')).id;
const alternate=route.planRouteWithStops('FRLEH','SEGOT',[],[avoided.slice(2)]);
assert(alternate&&!alternate.points.some(p=>p.id===avoided),'New network waypoint avoids must be respected');
assert.equal(route.planRoute('UNKNOWN','SEGOT'),null);
assert.equal(route.planRoute('FRLEH','FRLEH'),null);
assert.equal(route.planRouteWithStops('FRLEH','SEGOT',[{lat:NaN,lon:3}]),null);
assert.equal(route.isWaterSegment(49.49,0.11,51,1.8),false);
let pairs=0,maxPoints=0;
for(const from of ports)for(const to of ports){if(from===to)continue;const p=route.planRoute(from.code,to.code);assert(p,`${from.code} → ${to.code} disconnected`);pairs++;
 assert(Number.isFinite(p.totalNm));assert.equal(p.points[0].id,'p:'+from.code);assert.equal(p.points.at(-1).id,'p:'+to.code);
 assert(!p.points.slice(1,-1).some(p=>p.kind==='port'));
 assert(Math.abs(p.totalNm-p.legs.reduce((sum,l)=>sum+l.nm,0))<1e-6);
 assert(p.totalNm+1e-6>=route.haversineNm(from.lat,from.lon,to.lat,to.lon));
 assert(p.points.length<=2000,'Track must fit manual editor persistence');maxPoints=Math.max(maxPoints,p.points.length);
}
console.log(`PASS: Eurostat network, directed Dover, canal closures, stops, avoids, invalid input; ${pairs} routes connected; max ${maxPoints} points.`);

const trackBefore=JSON.stringify(forward.points),display=route.mergeLegs(forward.legs);
assert(display.length<forward.legs.length);
assert(Math.abs(display.reduce((s,l)=>s+l.nm,0)-forward.totalNm)<1e-6);
assert.equal(JSON.stringify(forward.points),trackBefore,'Display grouping must not alter the sailed track');
