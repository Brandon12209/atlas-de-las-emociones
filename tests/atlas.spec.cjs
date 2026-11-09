const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs');
test.setTimeout(90000);
const base=process.env.ATLAS_TEST_URL||'http://127.0.0.1:5173';
const url=base+'/felicidad.html?qa';
async function ready(page){await page.goto(url);await page.waitForFunction(()=>window.__ATLAS_TEST__?.ready);await page.evaluate(()=>window.scrollTo(0,document.querySelector('#exposicion').offsetTop));await page.waitForTimeout(900);}
test('desktop: complete character, camera, hotspots, emotion navigation, keyboard, access',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 const metrics=await page.evaluate(()=>window.__ATLAS_TEST__.metrics());expect(metrics.meshes).toBe(9);expect(metrics.materials.every(m=>m.map)).toBeTruthy();expect(metrics.triangles).toBeGreaterThan(40000);
 await page.screenshot({path:'evidence/desktop-exhibit-final.png'});
 await page.locator('[data-focus="manoL"]').click();await page.waitForTimeout(900);expect(await page.evaluate(()=>window.__ATLAS_TEST__.camera.zoom)).toBeGreaterThan(4);await expect(page.locator('#focus-title')).toHaveText('Mano izquierda');await page.screenshot({path:'evidence/desktop-hand.png'});
 await page.locator('.camera-toolbar [data-camera="reset"]').click();await page.waitForTimeout(900);
 const before=await page.evaluate(()=>window.__ATLAS_TEST__.camera.position.toArray());await page.locator('#viewer canvas').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(900);const after=await page.evaluate(()=>window.__ATLAS_TEST__.camera.position.toArray());expect(after[0]).not.toBe(before[0]);await page.keyboard.press('Home');await page.waitForTimeout(900);
 const p=await page.evaluate(()=>window.__ATLAS_TEST__.project('manoL'));await page.mouse.move(p.x,p.y);await expect(page.locator('#hotspot-card')).toBeVisible({timeout:4000});await page.screenshot({path:'evidence/desktop-hotspot.png'});
 await page.locator('#hotspot-focus').click();await expect(page.locator('#focus-detail')).toBeVisible();
 await page.locator('.camera-toolbar [data-camera="reset"]').click();await page.waitForTimeout(900);const face=await page.evaluate(()=>window.__ATLAS_TEST__.project('rostro'));await page.mouse.dblclick(face.x,face.y);await page.waitForTimeout(900);expect(await page.evaluate(()=>window.__ATLAS_TEST__.camera.zoom)).toBeGreaterThan(2);
 await page.locator('.emotion-selector [data-emotion="enojo"]').click();await expect(page).toHaveURL(/enojo.html/);await expect(page.locator('#viewer canvas[data-ready="true"]')).toBeVisible();await expect(page.locator('#character-name')).toContainText('cabello corto');
 await ready(page);await expect(page.locator('#overview-panel')).toBeVisible();
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();fs.writeFileSync('evidence/accessibility-desktop.json',JSON.stringify(a11y.violations,null,2));expect(a11y.violations).toEqual([]);
 expect(errors).toEqual([]);fs.writeFileSync('evidence/desktop-metrics.json',JSON.stringify(metrics,null,2));
});
test('matched views and full rotation',async({page})=>{
 await ready(page);const profiles=JSON.parse(fs.readFileSync('docs/validation/cameras.json','utf8'));fs.mkdirSync('evidence/browser',{recursive:true});
 for(const profile of profiles){const data=await page.evaluate(p=>window.__ATLAS_TEST__.capture(p),profile);fs.writeFileSync(`evidence/browser/${profile.name}.png`,Buffer.from(data.split(',')[1],'base64'));}
 for(let i=0;i<12;i++){const data=await page.evaluate(angle=>window.__ATLAS_TEST__.capture({angle,width:480,pixels:640}),i*Math.PI/6);fs.writeFileSync(`evidence/browser/rotation-${i}.png`,Buffer.from(data.split(',')[1],'base64'));}
});
test('mobile: no overflow, touch detail, readable content, keyboard-equivalent controls',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const page=await context.newPage();await ready(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:'evidence/mobile-exhibit.png'});
 await page.locator('[data-focus="rostro"]').tap();await page.waitForTimeout(1000);await expect(page.locator('#focus-title')).toHaveText('Rostro y mirada');await expect(page.locator('#overview-panel')).toBeHidden();await page.screenshot({path:'evidence/mobile-face.png'});
 await page.locator('#ficha').scrollIntoViewIfNeeded();await page.screenshot({path:'evidence/mobile-academic.png'});
 await page.goto(base+'/');await page.waitForLoadState('networkidle');await page.screenshot({path:'evidence/mobile-cover.png',fullPage:true});
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();fs.writeFileSync('evidence/accessibility-mobile.json',JSON.stringify(results.violations,null,2));expect(results.violations).toEqual([]);await context.close();
});
test('nine real pages: links, desktop/mobile typography, no overlapping text, accessibility',async({browser})=>{
 const pages=['','coleccion.html','felicidad.html','miedo.html','tristeza.html','enojo.html','asco.html','metodologia.html','fuentes.html'];
 const records=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of pages){
   const errors=[];const capture=e=>errors.push(e.message);page.on('pageerror',capture);const response=await page.goto(base+'/'+route);expect(response.status()).toBe(200);await page.waitForLoadState('networkidle');
   await expect(page.locator('main h1')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   if(route===''&&width===390){
    const character=await page.locator('.cover-art img').boundingBox();
    const caption=await page.locator('.cover-art figcaption').boundingBox();
    expect(character.y+character.height+12).toBeLessThanOrEqual(caption.y);
   }
   const overlaps=await page.evaluate(()=>{const ns=[...document.querySelectorAll('main h1,main h2,main h3,main p')].filter(n=>n.offsetWidth&&n.offsetHeight&&!n.closest('[hidden]'));const result=[];for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const a=ns[i],b=ns[j];if(a.contains(b)||b.contains(a))continue;const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>3&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>3)result.push([a.textContent.slice(0,55),b.textContent.slice(0,55)]);}return result;});
   expect(overlaps,`${route} at ${width}px`).toEqual([]);expect(errors).toEqual([]);
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations,route).toEqual([]);
   if(['','coleccion.html','metodologia.html','fuentes.html'].includes(route))await page.screenshot({path:`evidence/${width}-${route||'home'}.png`,fullPage:true});
   records.push({route:route||'index.html',width,status:response.status(),overlaps,errors,accessibilityViolations:audit.violations.length});page.off('pageerror',capture);
  }
  await context.close();
 }
 fs.writeFileSync('evidence/multipage-validation.json',JSON.stringify(records,null,2));
});
