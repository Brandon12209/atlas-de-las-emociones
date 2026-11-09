// Archive measured evidence only after the production suite passes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),work=process.env.ATLAS_WORK_DIR||'D:/PGI_3D/WEB_ATLAS_5_EMOCIONES_20261107';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const tests=JSON.parse(fs.readFileSync(path.join(root,'evidence/test-results.json')));
if(tests.stats.unexpected||tests.stats.skipped||tests.stats.expected!==10)throw Error('Production validation is incomplete');
const out=path.join(root,'docs/validation/emotions');fs.mkdirSync(out,{recursive:true});
const sources=JSON.parse(fs.readFileSync(path.join(work,'sources.json'))),records={date:'2026-11-08',models:{}};
for(const [key,source] of Object.entries(sources)){
 const originalHash=hash(source.original),protectedHash=hash(source.protected);
 if(originalHash!==source.sha256||protectedHash!==source.sha256)throw Error('Source changed: '+key);
 const file=path.join(root,'public/emotions',key,'model.glb'),bytes=fs.readFileSync(file);
 if(bytes.readUInt32LE(0)!==0x46546c67)throw Error('Not GLB: '+key);
 const data=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 records.models[key]={sourceOriginal:source.original,sourceProtected:path.relative(root,source.protected).replaceAll('\\','/'),sourceSHA256:protectedHash,originalUnchanged:true,model:path.relative(root,file).replaceAll('\\','/'),modelSHA256:hash(file),modelBytes:bytes.length,textures:data.textures.length,meshPrimitives:data.meshes.reduce((n,m)=>n+m.primitives.length,0)};
 const dest=path.join(out,key);fs.mkdirSync(dest,{recursive:true});
 for(const name of fs.readdirSync(path.join(root,'evidence/emotions',key)))if(/^comparison-.*\.(jpg|json)$|^rotation-sheet\.jpg$|^context-.*\.png$/.test(name))fs.copyFileSync(path.join(root,'evidence/emotions',key,name),path.join(dest,name));
 fs.copyFileSync(path.join(root,'evidence/emotions',key,'blender/cameras.json'),path.join(dest,'cameras.json'));
 fs.copyFileSync(path.join(work,key,'bake/export-manifest.json'),path.join(dest,'export-manifest.json'));
}
const joyFile=path.join(root,'public/cappie/cappie-radiance.glb');
const priorPointer=execFileSync('git',['show','a715173:public/cappie/cappie-radiance.glb'],{cwd:root,encoding:'utf8'});
const previousHash=priorPointer.match(/oid sha256:([a-f0-9]+)/)[1];
if(hash(joyFile)!==previousHash)throw Error('Felicidad GLB changed');
const joySource=hash(path.join(root,'assets/source/CAPPIE_MANOS_CORREGIDAS.blend'));
if(joySource!=='efd5e06b191f1c2e96ae102fe2024ac7ddbaae86e6c9d4784ac06143fb3c2f82')throw Error('Felicidad source changed');
records.models.felicidad={model:'public/cappie/cappie-radiance.glb',modelSHA256:previousHash,unchangedFrom:'a715173',sourceSHA256:joySource};
fs.writeFileSync(path.join(out,'source-integrity.json'),JSON.stringify(records,null,2));
for(const name of ['test-results.json','multipage-validation.json','responsive-extra.json'])fs.copyFileSync(path.join(root,'evidence',name),path.join(out,name));
fs.copyFileSync(path.join(root,'evidence/emotions/browser-audit.json'),path.join(out,'browser-audit.json'));
for(const [file,name] of [['1440-coleccion.html.png','collection-desktop.png'],['390-coleccion.html.png','collection-mobile.png'],['mobile-face.png','region-mobile.png'],['desktop-exhibit-final.png','exhibit-desktop.png'],['1440-metodologia.html.png','rubric-desktop.png']])fs.copyFileSync(path.join(root,'evidence',file),path.join(out,name));
console.log('Sources unchanged; five models and production evidence archived.');
