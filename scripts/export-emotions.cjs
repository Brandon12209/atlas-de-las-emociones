const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),work='D:/PGI_3D/WEB_ATLAS_5_EMOCIONES_20261107';
const pythonChoices=process.env.PGI_PYTHON?[[process.env.PGI_PYTHON,[]]]:process.env.PYTHON?[[process.env.PYTHON,[]]]:(process.platform==='win32'?[['py',['-3']],['python',[]]]:[['python3',[]],['python',[]]]);
const python=pythonChoices.find(([exe,args])=>{const check=spawnSync(exe,[...args,'--version'],{stdio:'ignore'});return !check.error&&check.status===0;});
if(!python)throw Error('No se encontró Python 3. Instálalo o define PGI_PYTHON con la ruta del intérprete.');
for(const key of ['miedo','tristeza','enojo','asco']){
 const out=path.join(work,key,'bake'),dest=path.join(root,'public/emotions',key);fs.mkdirSync(out,{recursive:true});fs.mkdirSync(dest,{recursive:true});
 if(!fs.existsSync(path.join(out,'export-manifest.json'))){
  const log=fs.openSync(path.join(out,'export.log'),'w');
  const r=spawnSync('C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',['--background','--disable-autoexec',path.join(root,'assets/source',`MITA_${key.toUpperCase()}_WEB.blend`),'--python',path.join(root,'scripts/export-cappie.py'),'--',out],{stdio:['ignore',log,log]});fs.closeSync(log);
  if(r.status!==0)throw Error(`Export ${key}: ${r.status}`);
 }
 const r=spawnSync(python[0],[...python[1],path.join(root,'scripts/finalize-glb.py'),path.join(out,'cappie-radiance.glb'),path.join(dest,'model.glb')],{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw Error(`Finalize ${key}`);
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'export-manifest.json')));fs.writeFileSync(path.join(dest,'landmarks.json'),JSON.stringify(manifest.landmarks));
 console.log(`EXPORT_READY ${key}`);
}
