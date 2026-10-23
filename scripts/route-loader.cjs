const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const req=require('module').createRequire(path.join(root,'package.json')),ts=req('typescript');
const cache={};function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id),m,m.exports);return m.exports;}
const route=load(path.join(root,'src/lib/route.ts')),data=load(path.join(root,'src/lib/route-data.ts')),ports=load(path.join(root,'src/lib/ports.ts')).PORTS;

module.exports={root,req,ts,load,route,data,ports};
