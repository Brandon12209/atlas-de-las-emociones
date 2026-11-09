const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const base=process.env.ATLAS_TEST_URL||'http://127.0.0.1:5173';
const routes=['felicidad','miedo','tristeza','enojo','asco'];
const parts=['rostro','manoL','manoR','torso','piernas','postura'];
test.setTimeout(90000);
for(const route of routes){
 test(`${route}: six contextual panels, direct selection, rubric and sources`,async({page})=>{
  fs.mkdirSync(`evidence/emotions/${route}`,{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${base}/${route}.html?qa`);await page.waitForFunction(()=>window.__ATLAS_TEST__?.ready);await page.waitForTimeout(150);
  expect(await page.evaluate(()=>window.__ATLAS_TEST__.metrics().meshes)).toBe(route==='enojo'?8:9);
  await expect(page.locator('#academic-portrait')).toHaveJSProperty('complete',true);expect(await page.locator('#academic-portrait').evaluate(n=>n.naturalWidth)).toBeGreaterThan(0);
  const citations=new Set();
  for(const field of ['definition','function','triggers','thoughts','body','behaviors','regulation','expression']){
   expect((await page.locator('#'+field).textContent()).length).toBeGreaterThan(50);
   expect(await page.locator('#'+field+' a.citation').count()).toBeGreaterThan(0);
  }
  await expect(page.locator('.example span')).toHaveText('EJEMPLO FICTICIO');await expect(page.locator('#practice ol li')).toHaveCount(4);
  for(const part of parts){
   await page.locator(`[data-focus="${part}"]`).click();await expect(page.locator('#focus-detail')).toBeVisible();await expect(page.locator('#overview-panel')).toBeHidden();await expect(page.locator('#panel-region')).toHaveAttribute('aria-pressed','true');
   expect((await page.locator('#region-observation').textContent()).length).toBeGreaterThan(40);expect((await page.locator('#focus-text').textContent()).length).toBeGreaterThan(80);
   for(const link of await page.locator('#region-sources a').evaluateAll(ns=>ns.map(n=>n.getAttribute('href'))))citations.add(link);
   expect(await page.locator('#region-sources a').count()).toBeGreaterThan(0);
  }
  await page.locator('#panel-general').click();await expect(page.locator('#overview-panel')).toBeVisible();await page.locator('#panel-region').click();await expect(page.locator('#focus-detail')).toBeVisible();
  // Real surface selection rather than only shortcut buttons.
  await page.locator('.camera-toolbar [data-camera="reset"]').click();await page.waitForTimeout(200);
  const face=await page.evaluate(()=>window.__ATLAS_TEST__.project('rostro'));await page.mouse.click(face.x,face.y);await expect(page.locator('#focus-title')).toHaveText('Rostro y mirada');await expect(page.locator('#focus-detail')).toBeVisible();
  await page.locator('.camera-toolbar [data-camera="reset"]').click();await page.waitForTimeout(200);
  const handPart=route==='enojo'?'manoR':'manoL';
  const hand=await page.evaluate(part=>window.__ATLAS_TEST__.project(part),handPart);await page.mouse.click(hand.x,hand.y);await expect(page.locator('#focus-title')).toHaveText(route==='enojo'?'Mano derecha':'Mano izquierda');
  await page.locator('.camera-toolbar [data-camera="reset"]').click();await page.waitForTimeout(200);
  const p=await page.evaluate(()=>window.__ATLAS_TEST__.project('torso'));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+65,p.y+10,{steps:8});await page.mouse.up();await page.waitForTimeout(350);await expect(page.locator('#focus-detail')).toBeHidden();
  await page.locator('[data-focus="manoR"]').click();await page.waitForTimeout(250);await page.screenshot({path:`evidence/emotions/${route}/context-desktop.png`,fullPage:true});
  await page.goto(base+'/fuentes.html');await page.waitForLoadState('networkidle');for(const link of citations)await expect(page.locator(link.slice(link.indexOf('#')))).toHaveCount(1);
  expect(errors).toEqual([]);
 });
}
test('all emotion panels on touch screens, linked citations and complete collection',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 for(const route of routes){
  fs.mkdirSync(`evidence/emotions/${route}`,{recursive:true});
  await page.goto(`${base}/${route}.html?qa`);await page.waitForFunction(()=>window.__ATLAS_TEST__?.ready);
  await page.locator('[data-focus="rostro"]').tap();await expect(page.locator('#focus-detail')).toBeVisible();await page.waitForTimeout(100);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const top=await page.locator('#ficha').evaluate(n=>n.getBoundingClientRect().top);expect(top).toBeGreaterThanOrEqual(0);expect(top).toBeLessThan(200);
  await page.screenshot({path:`evidence/emotions/${route}/context-mobile.png`,fullPage:true});
  await page.locator('#region-sources a').first().tap();await expect(page).toHaveURL(/fuentes.html#ref-/);await page.waitForTimeout(200);const target=await page.evaluate(()=>document.querySelector(location.hash)?.getBoundingClientRect().top);expect(target).toBeLessThan(250);
 }
 await page.goto(base+'/coleccion.html');await page.waitForLoadState('networkidle');const images=await page.locator('.collection-grid img').evaluateAll(ns=>ns.map(n=>n.complete&&n.naturalWidth>0));expect(images).toHaveLength(5);expect(images.every(Boolean)).toBeTruthy();await context.close();
});
