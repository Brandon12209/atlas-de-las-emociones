const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');const root=path.resolve(__dirname,'..');
for(const key of ['miedo','tristeza','enojo','asco']){
 const out=path.join(root,'evidence/emotions',key,'blender');fs.mkdirSync(out,{recursive:true});
 if(fs.existsSync(path.join(out,'legs.png')))continue;
 const log=fs.openSync(path.join(out,'render.log'),'w');
 const r=spawnSync('C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',['--background','--disable-autoexec',path.join(root,'assets/source',`MITA_${key.toUpperCase()}_WEB.blend`),'--python',path.join(root,'scripts/render-emotion-reference.py'),'--',out,path.join(root,'public/emotions',key,'landmarks.json')],{stdio:['ignore',log,log]});fs.closeSync(log);if(r.status!==0)throw Error('Reference failed '+key);console.log('REFERENCE_READY '+key);
}
