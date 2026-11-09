const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.screenshot({path:'evidence/desktop-cover.png'});
 await page.goto('http://127.0.0.1:5173/felicidad.html?qa',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__ATLAS_TEST__?.ready,null,{timeout:60000});
 await page.locator('#exposicion').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
 await page.screenshot({path:'evidence/desktop-exhibit.png'});
 const data=await page.evaluate(()=>({metrics:window.__ATLAS_TEST__.metrics(),image:window.__ATLAS_TEST__.capture()}));
 fs.writeFileSync('evidence/browser-front.png',Buffer.from(data.image.split(',')[1],'base64'));
 fs.writeFileSync('evidence/first-check.json',JSON.stringify({errors,metrics:data.metrics},null,2));
 console.log(JSON.stringify({errors,metrics:data.metrics},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
