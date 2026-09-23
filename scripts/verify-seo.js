import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { debateArticles } from '../debate-articles.js';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({javaScriptEnabled:false});
 const sitemap=await (await page.request.get(base+'/sitemap.xml')).text();
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(new Set(urls).size,urls.length);
 const robots=await (await page.request.get(base+'/robots.txt')).text();
 assert.ok(robots.includes('Sitemap: https://kdhlm.se/sitemap.xml'));
 for(const url of urls){
  const response=await page.goto(base+new URL(url).pathname);assert.equal(response.status(),200,url);
  await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',url);
  await expect(page.locator('meta[name=description]')).toHaveCount(1);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/index,follow/);
  const descriptions=await page.locator('meta[name=description]').getAttribute('content');assert.ok(descriptions.length>0&&descriptions.length<=170);
  for(const raw of await page.locator('script[type="application/ld+json"]').allTextContents())JSON.parse(raw);
 }
 await page.goto(base+'/aktuellt.html');
 await expect(page.locator('#news-grid .news-card')).toHaveCount(debateArticles.length);
 await expect(page.locator('#sub-title')).not.toBeEmpty();
 const links=await page.locator('#news-grid h2 a').evaluateAll(nodes=>nodes.map(a=>new URL(a.href).pathname));
 for(const article of debateArticles)assert.ok(links.includes(`/artiklar/${article.id}.html`));
 await page.goto(base+'/');await expect(page).toHaveTitle('Kristdemokraterna i Hässleholm');
 await expect(page.locator('.news-archive-link a')).toBeVisible();
 for(const article of debateArticles){
  await page.goto(base+`/artiklar/${article.id}.html`);
  const schemas=(await page.locator('script[type="application/ld+json"]').allTextContents()).map(JSON.parse);
  const schema=schemas.find(s=>s['@type']==='Article');
  assert.equal(schema.dateCreated,article.date);assert.equal(schema.datePublished,undefined);
  if(article.author)assert.deepEqual(schema.author.map(a=>a.name),article.author.split(/,\s*/));else assert.equal(schema.author,undefined);
  assert.ok(schemas.some(s=>s['@type']==='BreadcrumbList'));
  assert.ok(sitemap.includes(`/artiklar/${article.id}.html`));
 }
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/aktuellt.html');
  await expect(page.locator('#navigation')).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 const interactive=await browser.newPage();await interactive.goto(base+'/aktuellt.html#debatt');
 await expect(interactive.locator('#news-grid .news-card')).toHaveCount(3);
 await interactive.locator('#news-more').click();await expect(interactive.locator('#news-grid .news-card')).toHaveCount(6);
 await interactive.goto(base+'/valprogram.html');await expect(interactive.locator('#politik .policy-detail')).toHaveCount(7);
 const examples=(await readdir('dist/artiklar')).filter(name=>!debateArticles.some(a=>name===a.id+'.html'));
 for(const name of examples){const html=await readFile('dist/artiklar/'+name,'utf8');assert.match(html,/noindex,follow/);assert.ok(!sitemap.includes('/artiklar/'+name));}
 console.log(`PASS ${urls.length} sitemap URLs return 200; canonical/description/schema; ${debateArticles.length} articles discoverable without JS; separate coauthors, truthful dates, examples excluded; mobile no-JS navigation and interactive archive.`);
}finally{await browser.close();}
