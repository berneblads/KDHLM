import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { mediaFeeds } from '../server/media-config.js';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], checks = [];
await mkdir('artifacts', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.request.get(base + '/api/media');
  assert.equal(response.status(), 200);
  const live = await response.json(); assert.equal(live.available, true); assert.equal(live.feedCount, mediaFeeds.length); assert.equal(live.partial, false);
  assert.ok(!JSON.stringify(live).includes('/alerts/feeds/'));
  await page.goto(base + '/i-media.html');
  await expect(page.locator('.media-live')).toHaveText('Uppdateras automatiskt');
  if (!live.articles.length) await expect(page.locator('.media-empty h3')).toHaveText('Nästa nyhet börjar här.');
  await expect(page.locator('.media-notice')).toBeHidden();
  await page.screenshot({ path: 'artifacts/media-live-1440.png', fullPage: true });
  checks.push(`Real API: ${live.feedCount} Google Alerts feeds respond; ${live.articles.length} real articles; live page renders honestly`);

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto(base + '/i-media.html?preview=media');
    await expect(page.locator('.media-card')).toHaveCount(4);
    await expect(page.locator('.media-notice')).toContainText('inte publicerade artiklar');
    assert.equal(await page.locator('.media-card a').count(), 0);
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.ok(await page.locator('#sub-image').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.screenshot({ path: `artifacts/media-preview-${width}.png`, fullPage: true });
    await expect(page.locator('.media-filters')).toHaveCount(0);
    await expect(page.locator('.media-topic')).toHaveText(['Simon', 'Erika', 'KD Hässleholm', 'Simon']);
  }
  checks.push('Desktop, 390px and 320px previews: no overflow, real hero image, labeled examples, all topics in a single feed without filters');
  await page.goto(base + '/aktuellt.html?preview=media');
  await page.getByRole('button', { name: 'I media', exact: true }).click();
  await expect(page.locator('.media-card')).toHaveCount(4); await expect(page.locator('#news-grid')).toBeHidden();
  await page.reload(); await expect(page.locator('.media-card')).toHaveCount(4);
  await page.locator('#news-filters').getByRole('button', { name: 'Alla', exact: true }).click();
  await expect(page.locator('#news-grid')).toBeVisible(); await expect(page.locator('#media-root')).toBeHidden();
  await page.goto(base + '/?preview=media#i-media'); await expect(page.locator('.media-card')).toHaveCount(4);
  checks.push('Homepage and news archive: I media tab, direct hash, reload and return to editorial articles');

  const articles = Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: `Artikel ${i} <img src=x onerror=alert(1)>`, source: 'example.com', summary: 'En extern artikel.', topics: [i % 2 ? 'Simon' : 'Erika'], date: '2026-09-05T10:00:00Z', url: `https://example.com/article/${i}` }));
  let fail = true;
  await page.route('**/api/media', route => route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify(fail ? { available: false } : { available: true, articles, checkedAt: new Date().toISOString() }) }));
  await page.goto(base + '/i-media.html');
  await expect(page.locator('.media-empty h3')).toHaveText('Vi är snart tillbaka.');
  fail = false; await page.getByRole('button', { name: 'Försök igen' }).click();
  await expect(page.locator('.media-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Visa fler artiklar', exact: true }).click();
  await expect(page.locator('.media-card')).toHaveCount(8);
  await expect(page.locator('.media-card img')).toHaveCount(0);
  await expect(page.locator('.media-read').first()).toHaveAttribute('href', 'https://example.com/article/0');
  await expect(page.locator('.media-read').first()).toHaveAttribute('rel', 'noopener noreferrer');
  checks.push('Simulated articles: retry after failure, pagination, safe text rendering and external source links');
  assert.deepEqual(errors, []);
  await writeFile('artifacts/media-verification.json', JSON.stringify({ checks, errors }, null, 2));
  console.log(checks.join('\n'));
} finally { await browser.close(); }
