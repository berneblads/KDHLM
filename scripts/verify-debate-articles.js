import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { debateArticles } from '../debate-articles.js';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const sources = JSON.parse(await readFile('artifacts/debate-sources.json', 'utf8'));
const normalize = text => text.replace(/\s+/g, ' ').trim();
for (const article of debateArticles) {
  const source = sources.find(s => s.file === article.sourceFile);
  const original = source.paragraphs.slice(article.sourceFile.startsWith('260821') ? 0 : 1).join(' ');
  assert.equal(normalize([article.intro, ...article.paragraphs, ...article.signatures].join(' ')), normalize(original), article.sourceFile);
}
assert.equal(new Set(debateArticles.map(a=>a.id)).size, debateArticles.length);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error=>errors.push(error.message));
  for (const path of ['/#debatt', '/aktuellt.html#debatt']) {
    await page.goto(base + path);
    await expect(page.getByRole('button', { name: 'Debatt', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.news-card')).toHaveCount(3);
    await expect(page.locator('.news-copy h2').first()).toHaveText(debateArticles[0].title);
    while (await page.locator('#news-more').isVisible()) await page.locator('#news-more').click();
    await expect(page.locator('.news-card')).toHaveCount(debateArticles.length);
    const titles = await page.locator('.news-copy h2').allTextContents();
    assert.equal(new Set(titles).size, debateArticles.length);
    assert.deepEqual(titles, debateArticles.map(a=>a.title));
    await expect(page.locator('#news-grid')).not.toContainText('EXEMPEL');
    await page.getByRole('button', { name: 'Nyheter', exact: true }).click();
    await expect(page.locator('.news-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Debatt', exact: true }).click();
    await page.locator('.news-copy .text-button').first().click();
    await expect(page.locator('.article-heading h1')).toHaveText(debateArticles[0].title);
  }
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  const sitemap = await (await page.request.get(base + '/sitemap.xml')).text();
  for (const article of debateArticles) {
    const path = `/artiklar/${article.id}.html`;
    assert.equal((await noJS.goto(base + path)).status(), 200);
    await expect(noJS.locator('.article-lead')).toHaveText(article.intro);
    assert.deepEqual(await noJS.locator('.article-body>p').allTextContents(), article.paragraphs);
    assert.deepEqual(await noJS.locator('.article-signatures>p').allTextContents(), article.signatures);
    await expect(noJS.locator('meta[name=robots]')).toHaveAttribute('content', 'index,follow,max-image-preview:large');
    assert.ok(sitemap.includes(path));
    assert.equal((await noJS.request.get(new URL(await noJS.locator('.article-cover img').getAttribute('src'), base).href)).status(), 200);
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/aktuellt.html#debatt');
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.news-card')).toHaveCount(3);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('.news-image').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.screenshot({ path: `artifacts/debate-list-${width}.png`, fullPage: true });
    await page.locator('.news-copy .text-button').first().click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({ path: `artifacts/debate-article-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${debateArticles.length} unique articles: source text/signatures preserved, date order, category filtering, pagination, links, HTML without JS, sitemap, images, desktop/mobile; no browser errors.`);
} finally { await browser.close(); }
