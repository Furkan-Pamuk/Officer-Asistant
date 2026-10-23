const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const input=process.argv[2],revision=process.argv[3];
if(!input||!revision)throw Error('Usage: node scripts/prepare-searoute.cjs input.gpkg revision');
const folder=path.resolve(__dirname,'../public/third-party/searoute');
const db=new DatabaseSync(input,{readOnly:true});
const nodes=[],edges=[],index=new Map(),passes=[''];
function node(x,y){x=Math.round(x*1e6);y=Math.round(y*1e6);const k=x+','+y;if(!index.has(k)){index.set(k,nodes.length);nodes.push([y,x]);}return index.get(k);}
for(const row of db.prepare('select geometry,pass from type order by fid').all()){
 const b=Buffer.from(row.geometry), env=(b[3]>>1)&7;
 let p=8+[0,32,48,48,64][env];const le=b[p]===1;p++;
 const uint=()=>{const v=le?b.readUInt32LE(p):b.readUInt32BE(p);p+=4;return v;};
 const num=()=>{const v=le?b.readDoubleLE(p):b.readDoubleBE(p);p+=8;return v;};
 const type=uint();if(type!==2)throw Error('Unsupported WKB '+type);
 const n=uint();let last;
 let pass=passes.indexOf(row.pass||'');if(pass<0){pass=passes.length;passes.push(row.pass);}
 for(let i=0;i<n;i++){const x=num(),y=num(),id=node(x,y);if(last!==undefined&&last!==id)edges.push([last,id,pass]);last=id;}
}
const result={revision,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),precision:1e6,passes,nodes,edges};
const json=JSON.stringify(result);
fs.mkdirSync(folder,{recursive:true});
fs.writeFileSync(path.join(folder,'network-source.json'),json);
fs.writeFileSync(path.resolve(__dirname,'../src/lib/searoute-network.ts'),'// Eurostat/SeaRoute network, EUPL-1.2. See THIRD_PARTY_NOTICES.md.\nexport const network: { revision:string; sourceSha256:string; precision:number; passes:string[]; nodes:number[][]; edges:number[][] } = JSON.parse('+JSON.stringify(json)+');\n');
console.log({revision,nodes:nodes.length,edges:edges.length,passes,bytes:Buffer.byteLength(json)});
