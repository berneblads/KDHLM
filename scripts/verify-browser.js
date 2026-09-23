import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL || 'msedge',headless:true});
const errors=[],checks=[];
const page=await browser.newPage({viewport:{width:1024,height:1536},reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base))errors.push(`${r.status()} ${r.url()}`);});
try {
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.facebook-section')).toHaveCount(0);
  await expect(page.locator('#calendar-list>.event')).toHaveCount(3);
  await expect(page.locator('#sub-title')).toHaveText('TRO PÅ HÄSSLEHOLM');
  await expect(page.locator('#news-grid>.news-card')).toHaveCount(3);
  assert.deepEqual(await page.locator('main>section').evaluateAll(ns=>ns.map(n=>n.className)), ['sub-hero','container sub-content','policy-focus','calendar-section','membership-section']);
  await expect(page.locator('.carousel,.leader-section')).toHaveCount(0);
  await expect(page.locator('#navigation').getByRole('link',{name:'Träffa oss',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Debatt',exact:true}).click();await expect(page.locator('#news-grid>.news-card')).toHaveCount(3);
  const articleHref=await page.locator('#news-grid .text-button').first().getAttribute('href');await page.locator('#news-grid .text-button').first().click();await expect(page).toHaveURL(new URL(articleHref,base).href);await expect(page.locator('.article-content h1')).toBeVisible();await expect(page.locator('dialog')).not.toBeVisible();await page.goBack();
  await page.getByRole('button',{name:'Alla',exact:true}).click();
  const membership=await page.evaluate(()=>window.siteContent.links.membership);
  for(const selector of ['#navigation .button','#membership-open']){
    await expect(page.locator(selector)).toHaveAttribute('href',membership);
    assert.equal(await page.locator(selector).evaluate(n=>n.tagName),'A');
    await page.route(membership,r=>r.fulfill({contentType:'text/html',body:'<title>KD membership destination</title>'}));
    await page.locator(selector).click();await expect(page).toHaveURL(membership);await page.goto(base);
  }
  checks.push('Homepage uses news design before calendar; news links open standalone articles; both membership links navigate directly to KD');
  await page.locator('#calendar-list .event-summary').first().click();
  await expect(page.locator('#calendar-list .event-details').first()).toBeVisible();
  await page.getByRole('button',{name:'Visa plats',exact:true}).first().click();await expect(page.locator('.place-panel').first()).toBeVisible();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Lägg till i min kalender',exact:true}).first().click();const download=await downloadPromise;await download.saveAs('artifacts/calendar-export.ics');assert.match(await readFile('artifacts/calendar-export.ics','utf8'),/BEGIN:VEVENT/);
  await page.locator('#calendar-list .event-summary').first().click();await page.locator('#calendar-more').click();await expect(page.locator('#calendar-list>.event')).toHaveCount(5);await expect(page.locator('#calendar-list .cancelled')).toHaveText('Inställt');
  await page.locator('#month-view').click();await expect(page.locator('#calendar-month')).toBeVisible();
  await page.locator('#month-grid button').first().click();await expect(page.locator('#month-details .event-details')).toBeVisible();
  const month=await page.locator('#month-heading').textContent();await page.locator('#month-next').click();assert.notEqual(await page.locator('#month-heading').textContent(),month);await page.locator('#month-prev').click();await page.locator('#list-view').click();
  checks.push('Calendar list/month, event/place details, cancelled events, load more, ICS download');
  await page.locator('#navigation').getByRole('link',{name:'Kontakt',exact:true}).click();await expect(page.locator('#contact-form')).toBeVisible();await page.goto(base);
  checks.push('Contact navigation');
  for(const [name,width,height] of [['desktop-1024',1024,1536],['desktop-1440',1440,1100],['mobile-390',390,844],['mobile-320',320,750]]) {
    await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.facebook-section')).toHaveCount(0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: no overflow`);
    await page.locator('img').evaluateAll(async images=>{for(const image of images)image.loading='eager';await Promise.all(images.map(image=>image.decode()));});
    const images=await page.locator('img').evaluateAll(ns=>ns.filter(n=>!n.complete||!n.naturalWidth).map(n=>n.src));assert.deepEqual(images,[]);
    if(width<761){await page.locator('.menu-toggle').click();await expect(page.locator('#navigation')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');}
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`artifacts/${name}.png`,fullPage:true});
  }
  checks.push('1024 / 1440 / 390 / 320 screenshots, image loading, no horizontal overflow, mobile menu');
  await page.goto(base+'/valprogram.html');await expect(page.locator('.policy-detail')).toHaveCount(7);await expect(page.locator('.candidate')).toHaveCount(10);await page.locator('.policy-detail summary').first().click();await expect(page.locator('.policy-detail').first()).toHaveAttribute('open','');
  const pdf=await page.request.get(base+'/Valprogram%20KD%20H%C3%A4ssleholm%202026.pdf');assert.equal(pdf.status(),200);assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');checks.push('Separate built politics page, 7 policy areas, 10 candidates and original PDF');
  // Mocked public contract proves client refresh, XSS safety and last-good data retention.
  const live=await browser.newPage({viewport:{width:1024,height:1536},reducedMotion:'reduce'});await live.clock.install();
  let revision=1,fail=false;
  const future=new Date(Date.now()+86400000).toISOString(),end=new Date(Date.now()+90000000).toISOString();
  await live.route('**/api/calendar',route=>fail?route.fulfill({status:503,json:{available:false}}):route.fulfill({json:{events:[{id:'live-1',title:`Uppdatering ${revision} <img src=x onerror=alert(1)>`,start:future,end,place:'Plats',address:'Adress',description:'Detaljer',status:'scheduled'}]}}));
  await live.route('**/api/facebook*',route=>route.fulfill({status:503,json:{available:false}}));
  await live.goto(base+'/?data=live');await expect(live.locator('#calendar-list>.event')).toHaveCount(1);assert.equal(await live.locator('#calendar-list img').count(),0);
  revision=2;await live.clock.fastForward(300001);await expect(live.locator('.event-title')).toContainText('Uppdatering 2');fail=true;await live.clock.fastForward(300001);await expect(live.locator('.event-title')).toContainText('Uppdatering 2');await expect(live.locator('.facebook-section')).toHaveCount(0);assert.equal(await live.locator('.facebook-card').count(),0);
  await live.clock.fastForward(91000000);await expect(live.locator('#calendar-list>.event')).toHaveCount(0);
  await live.close();checks.push('Mock API: five-minute update, text-safe rendering, retained calendar on failure, expired events removed even offline, Facebook section removed; no live integration claimed');
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/verification.json',JSON.stringify({base,checks,errors},null,2));console.log(checks.map(c=>'PASS '+c).join('\n'));
} finally {await browser.close();}
