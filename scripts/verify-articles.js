import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],checks=[];
try{
  const page=await browser.newPage({viewport:{width:1024,height:950}});page.on('pageerror',e=>errors.push(e.message));
  const paths=new Set();
  for(const route of ['/','/aktuellt.html']){
    await page.goto(base+route);await expect(page.locator('.news-card').first()).toBeVisible();
    for(const selector of ['.news-image-link','.news-copy h2 a','.news-copy .text-button']){
      const a=page.locator(selector).first(),href=await a.getAttribute('href');paths.add(new URL(href).pathname);
      await a.click();await expect(page).toHaveURL(href);await expect(page.locator('.article-content h1')).toBeVisible();await expect(page.locator('dialog')).not.toBeVisible();
      await page.reload();await expect(page.locator('.article-body p').first()).toBeVisible();await page.goto(base+route);
    }
  }
  await page.goto(base+'/aktuellt.html');if(await page.locator('#news-more').isVisible())await page.locator('#news-more').click();
  for(const href of await page.locator('.news-copy .text-button').evaluateAll(ns=>ns.map(n=>n.href)))paths.add(new URL(href).pathname);
  checks.push('Images, titles and read-more links from homepage and archive open reloadable article URLs');
  const noJS=await browser.newPage({javaScriptEnabled:false,viewport:{width:1024,height:950}});
  for(const path of paths){
    const response=await noJS.goto(base+path);assert.equal(response.status(),200);
    const raw=await response.text();assert.match(raw,/<h1>/);assert.match(raw,/class="article-body"/);
    await expect(noJS.locator('.article-body p').first()).toBeVisible();
    await expect(noJS.locator('link[rel="canonical"]')).toHaveAttribute('href','https://kdhlm.se'+path);
    await expect(noJS.locator('meta[property="og:type"]')).toHaveAttribute('content','article');
    await expect(noJS.locator('meta[name="robots"]')).toHaveAttribute('content','index,follow,max-image-preview:large');
    const image=await noJS.locator('.article-cover img').getAttribute('src');assert.equal((await noJS.request.get(new URL(image,base).href)).status(),200);
  }
  assert.equal((await page.request.get(base+'/artiklar/does-not-exist.html')).status(),404);
  checks.push('Built HTML readable without JavaScript; canonical, share metadata, working images, indexable articles and true 404 for unknown articles');
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:950});await page.goto(base+[...paths][0]);await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('.article-cover img').evaluate(n=>n.decode());await page.screenshot({path:`artifacts/article-${width}.png`,fullPage:true});
  }
  await page.goto(base+'/om-oss.html');await expect(page.locator('#board-grid .board-card')).toHaveCount(2);await expect(page.locator('#political-grid .board-card')).toHaveCount(2);
  const directory=await (await page.request.get(base+'/api/representatives')).json();
  const dimensions=[];
  for(const person of directory.people.filter(p=>p.imageThumbnail).slice(0,4)){
    const sizes=await page.evaluate(async urls=>Promise.all(urls.map(async url=>{const image=new Image();image.src=url;await image.decode();return {width:image.naturalWidth,height:image.naturalHeight};})),[person.imageThumbnail,person.image]);
    assert.ok(sizes[1].width>=sizes[0].width);dimensions.push({name:person.name,thumbnail:sizes[0],profile:sizes[1]});
  }
  const first=directory.people.find(p=>p.imageThumbnail);await page.route(first.image,r=>r.abort());await page.reload();
  await expect(page.locator('.board-card img').first()).toHaveAttribute('src',first.imageThumbnail);
  await page.locator('.board-card img').first().evaluate(n=>n.decode());
  checks.push('Larger official portrait dimensions confirmed; image-load failure falls back to original thumbnail');
  assert.deepEqual(errors,[]);await writeFile('artifacts/articles-verification.json',JSON.stringify({base,checks,dimensions,errors},null,2));console.log(checks.map(c=>'PASS '+c).join('\n'));
}finally{await browser.close();}
