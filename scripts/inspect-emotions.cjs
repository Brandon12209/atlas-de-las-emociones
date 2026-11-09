const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const output='evidence/emotions/browser-audit.json';const records=fs.existsSync(output)?JSON.parse(fs.readFileSync(output)):[];
for(const key of (process.argv.length>2?process.argv.slice(2):['miedo','tristeza','enojo','asco'])){
 const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.goto((process.env.ATLAS_TEST_URL||'http://127.0.0.1:5173')+'/'+key+'.html?qa');await p.waitForFunction(()=>window.__ATLAS_TEST__?.ready,null,{timeout:60000});await p.waitForTimeout(300);
 const out='evidence/emotions/'+key;fs.mkdirSync(out+'/browser',{recursive:true});
 await p.screenshot({path:out+'/page.png'});const metrics=await p.evaluate(()=>window.__ATLAS_TEST__.metrics());
 for(const profile of JSON.parse(fs.readFileSync(out+'/blender/cameras.json','utf8'))){const data=await p.evaluate(profile=>window.__ATLAS_TEST__.capture(profile),profile);fs.writeFileSync(out+'/browser/'+profile.name+'.png',Buffer.from(data.split(',')[1],'base64'));}
 for(let i=0;i<12;i++){const data=await p.evaluate(angle=>window.__ATLAS_TEST__.capture({angle,width:480,pixels:640}),i*Math.PI/6);fs.writeFileSync(out+'/browser/rotation-'+i+'.png',Buffer.from(data.split(',')[1],'base64'));}
 const i=records.findIndex(r=>r.key===key);if(i>=0)records[i]={key,errors,metrics};else records.push({key,errors,metrics});await p.close();console.log('CAPTURED '+key,errors);
}
fs.writeFileSync('evidence/emotions/browser-audit.json',JSON.stringify(records,null,2));await b.close();})().catch(e=>{console.error(e);process.exitCode=1});
