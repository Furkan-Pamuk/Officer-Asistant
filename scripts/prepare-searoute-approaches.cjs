const fs=require('node:fs'),{route,ports,root}=require('./route-loader.cjs');
const net=JSON.parse(fs.readFileSync(root+'/public/third-party/searoute/network-source.json','utf8')), all=net.nodes.map(([lat,lon],node)=>({lat:lat/1e6,lon:lon/1e6,node}));
const distance=(a,b)=>route.haversineNm(a.lat,a.lon,b.lat,b.lon);
function coastPath(p){
 const targets=all.map(n=>({...n,nm:distance(p,n)})).sort((a,b)=>a.nm-b.nm).slice(0,12).filter(n=>route.isWater(n.lat,n.lon));
 const step=p.code==='ZADUR'?0.002:0.08, origin={lat:Math.round(p.lat/step)*step,lon:Math.round(p.lon/step)*step};
 const grid=new Map();function point(x,y){const key=x+','+y;if(!grid.has(key)){const n={key,x,y,lat:+(origin.lat+y*step).toFixed(6),lon:+(origin.lon+x*step).toFixed(6)};n.water=route.isWater(n.lat,n.lon);grid.set(key,n);}return grid.get(key);}
 const queue=[],scores=new Map(),prev=new Map();const heuristic=n=>Math.min(...targets.map(t=>distance(n,t)));
 for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const n=point(x,y),nm=distance(p,n);if(!n.water||nm>12)continue;
  let clear=route.isWaterSegment(p.lat,p.lon,n.lat,n.lon);
  if(!clear&&!route.isWater(p.lat,p.lon)){
   for(let d=.25;d<=nm;d+=.25){const q={lat:p.lat+(n.lat-p.lat)*d/nm,lon:p.lon+(n.lon-p.lon)*d/nm};if(route.isWater(q.lat,q.lon)){clear=route.isWaterSegment(q.lat,q.lon,n.lat,n.lon);break;}}
  }
  if(clear){scores.set(n.key,nm);queue.push({n,score:nm+heuristic(n),cost:nm});}
 }
 let visited=0;
 while(queue.length){queue.sort((a,b)=>b.score-a.score);const {n,cost}=queue.pop();if(cost!==scores.get(n.key))continue;if(++visited>18000)break;
  for(const t of targets)if(distance(n,t)<250&&route.isWaterSegment(n.lat,n.lon,t.lat,t.lon)){
   const track=[[t.lat,t.lon]];for(let at=n;at;at=prev.get(at.key))track.push([at.lat,at.lon]);track.reverse();
   // Visibility pruning stays strictly outside the coastline after the initial harbour edge.
   for(let i=0;i<track.length-2;i++){let last=i+1;for(let j=track.length-1;j>i+1;j--)if(route.isWaterSegment(...track[i],...track[j])){last=j;break;}if(last>i+1)track.splice(i+1,last-i-1);}
   console.log(p.code,'grid visits',visited,'points',track.length,'node',t.node);
   return {node:t.node,track};
  }
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const next=point(n.x+dx,n.y+dy);if(Math.abs(next.x)>90||Math.abs(next.y)>90||!next.water)continue;const nc=cost+distance(n,next);if(nc>=(scores.get(next.key)??Infinity)||!route.isWaterSegment(n.lat,n.lon,next.lat,next.lon))continue;scores.set(next.key,nc);prev.set(next.key,n);queue.push({n:next,cost:nc,score:nc+heuristic(next)});}
 }
 throw Error('No offshore approach '+p.code);
}
const result={};for(const code of ['IRBND','INMUN','ZADUR','BRPNG'])result[code]=[coastPath(ports.find(p=>p.code===code))];
const rivers=JSON.parse(fs.readFileSync(process.argv[2]||'rivers.geojson','utf8'));
const lines=rivers.features.filter(f=>f.properties.name==='Paraná').flatMap(f=>f.geometry.coordinates);
const main=lines.find(l=>l[0][0]===-58.604848&&l.at(-1)[0]===-60.414703);
const p=ports.find(p=>p.code==='ARRGY');let start=0;
main.forEach(([lon,lat],i)=>{if(distance(p,{lat,lon})<distance(p,{lat:main[start][1],lon:main[start][0]}))start=i;});
const branch=lines.find(l=>l[0][0]===-60.414703&&l.length===86),mouth=lines.find(l=>l[0][0]===-59.186431&&l.length===20);
const river=[...main.slice(start),...branch.slice(1),...mouth.slice(1)].map(([lon,lat])=>[lat,lon]);
const end={lat:river.at(-1)[0],lon:river.at(-1)[1]};const target=all.map(n=>({...n,nm:distance(end,n)})).sort((a,b)=>a.nm-b.nm)[0];
river.push([target.lat,target.lon]);result.ARRGY=[{node:target.node,track:river}];
fs.writeFileSync(root+'/src/lib/searoute-approaches.ts','// Generated approaches; Natural Earth Paraná river data is public domain.\nexport const approaches: Record<string,{node:number;track:number[][]}[]> = '+JSON.stringify(result)+';\n');
console.log('River approach',river.length,'points');
