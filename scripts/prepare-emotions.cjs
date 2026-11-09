const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'), work='D:/PGI_3D/WEB_ATLAS_5_EMOCIONES_20261107';
const sources=require('./emotion-sources.json'),manifest={};fs.mkdirSync(work,{recursive:true});
for(const [key,source] of Object.entries(sources)){
 const destination=path.join(root,'assets/source',`MITA_${key.toUpperCase()}_WEB.blend`);
 if(!fs.existsSync(destination))fs.copyFileSync(source,destination);
 manifest[key]={original:source,protected:destination,sha256:crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex')};
 const out=path.join(work,key);fs.mkdirSync(out,{recursive:true});
 if(fs.existsSync(path.join(out,'audit.json'))&&fs.existsSync(path.join(out,'source-front.png')))continue;
 const log=fs.openSync(path.join(out,'audit.log'),'w');
 const result=spawnSync('C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',['--background','--disable-autoexec',destination,'--python',path.join(root,'scripts/audit-emotion.py'),'--',out],{stdio:['ignore',log,log]});fs.closeSync(log);
 if(result.status!==0)throw Error(`Audit ${key} failed: ${result.status}`);console.log(`Audited ${key}`);
}
fs.writeFileSync(path.join(work,'sources.json'),JSON.stringify(manifest,null,2));
