import {verifyContact} from './verify-contact.js';
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const b=await chromium.launch({channel:'msedge',headless:true});const errors=[],checks=[];
const p=await b.newPage({viewport:{width:1024,height:950},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
try{
  const api=await p.request.get(base+'/api/representatives');assert.equal(api.status(),200);const live=await api.json();assert.ok(live.people.length>0);assert.ok(live.people.some(p=>p.roles.some(r=>r.group==='board')));checks.push('Real public directory API returns people and board members');
  await p.goto(base+'/politik.html');await expect(p.locator('.policy-links>a')).toHaveCount(6);
  const destinations=await p.locator('.policy-links>a').evaluateAll(ns=>ns.map(n=>n.pathname));
  for(const path of destinations){const response=await p.goto(base+path);assert.equal(response.status(),200);await expect(p.locator('.proposal').first()).toHaveAttribute('open','');await p.locator('.proposal summary').first().click();assert.equal(await p.locator('.proposal').first().getAttribute('open'),null);assert.ok(await p.locator('.proposal li').count()>0);}
  checks.push('Six real HTML policy pages; accordions contain preserved program proposals');
  await p.goto(base+'/aktuellt.html');await expect(p.locator('.news-card')).toHaveCount(3);await expect(p.getByRole('button',{name:'Gruppledaren',exact:true})).toHaveCount(0);await p.getByRole('button',{name:'Debatt',exact:true}).click();await expect(p.locator('.news-card')).toHaveCount(3);await p.locator('.news-card .text-button').first().click();await expect(p.locator('.article-content h1')).toBeVisible();await expect(p.locator('dialog')).not.toBeVisible();await p.goBack();await p.getByRole('button',{name:'Alla',exact:true}).click();await expect(p.locator('#news-more')).toBeVisible();await expect(p.locator('.news-card')).toHaveCount(3);
  await expect(p.locator('.footer-signature')).toHaveText('Människan före systemet');
  checks.push('News category filters without Gruppledaren, standalone article navigation and updated footer motto');
  for(const directoryPath of ['/fortroendevalda.html','/om-oss.html']){
  await p.goto(base+directoryPath);await expect(p.locator('#people-grid>.person-card')).toHaveCount(4);await p.locator('#people-search').fill('Simon');await expect(p.locator('#people-grid>.person-card')).toHaveCount(1);if(directoryPath==='/om-oss.html'){
    const simon=live.people.find(person=>person.name.includes('Simon'));
    await expect(p.locator('.person-contact-inline')).toBeVisible();
    await expect(p.locator('.person-contact-inline')).toContainText(simon.email);
    await expect(p.locator('.person-contact-inline')).toContainText(simon.phone);
    await expect(p.locator('#people-grid a[href^="mailto:"],#people-grid a[href^="tel:"]')).toHaveCount(0);
  }else{await p.locator('.person-details summary').click();await expect(p.locator('.person-contact a[href^="mailto:"]')).toBeVisible();}await p.locator('#people-search').fill('Finns inte 777');await expect(p.locator('.empty-state')).toBeVisible();await p.locator('#people-search').fill('');await p.getByRole('button',{name:'Styrelsen',exact:true}).click();await expect(p.locator('#people-grid>.person-card')).toHaveCount(4);await p.locator('#people-more').click();await expect(p.locator('#people-grid>.person-card')).toHaveCount(8);
  }
  checks.push('Both directory pages: search, empty result, role filters, expansion, contacts and pagination');
  await verifyContact(p,base);checks.push('Contact form: validation, failures, retry, success and responsive layout');
  const pages=['aktuellt','politik','politik-2022-2026','politik-kultur-och-fritid','fortroendevalda','om-oss','kontakt'];
  for(const width of [1024,1440,390,320]){
    await p.setViewportSize({width,height:width<761?844:950});
    for(const name of pages){await p.goto(base+'/'+name+'.html');await p.evaluate(()=>document.fonts.ready);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflow at '+width);
      await p.locator('img:visible').evaluateAll(ns=>ns.forEach(n=>n.loading='eager'));await p.evaluate(async()=>Promise.all([...document.images].filter(n=>n.offsetParent).map(n=>n.decode().catch(()=>{}))));
      await p.screenshot({path:`artifacts/sub-${name}-${width}.png`,fullPage:true});
    }
  }
  checks.push('Six mockup page types checked and captured at 1024, 1440, 390 and 320 px');
  // Simulate a changed upstream payload; the open About page must update after polling.
  const q=await b.newPage({reducedMotion:'reduce'});await q.clock.install();let changed=false,fail=false;
  await q.route('**/api/representatives',r=>fail?r.fulfill({status:503,json:{available:false}}):r.fulfill({json:{...live,people:live.people.map((person,i)=>i===0?{...person,name:changed?'Uppdaterat testnamn':person.name}:person)}}));
  await q.goto(base+'/om-oss.html');await expect(q.locator('#people-grid')).toBeVisible();changed=true;await q.clock.fastForward(300001);await expect(q.locator('#people-grid')).toContainText('Uppdaterat testnamn');fail=true;await q.clock.fastForward(300001);await expect(q.locator('#people-grid')).toContainText('Uppdaterat testnamn');await q.close();checks.push('Mock upstream change refreshes open About page; failure preserves last good people');
  // No example news on an explicitly live view.
  await p.goto(base+'/aktuellt.html?data=live');await expect(p.locator('.news-card')).toHaveCount(0);
  assert.deepEqual(errors,[]);await writeFile('artifacts/subpages-verification.json',JSON.stringify({base,checks,errors},null,2));console.log(checks.map(c=>'PASS '+c).join('\n'));
}finally{await b.close();}
