import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
try {
  await page.goto(`${base}/politik.html`);
  await expect(page.locator('.policy-answer')).toHaveCount(8);
  await expect(page.locator('.policy-answer[open]')).toHaveCount(0);
  const first = page.locator('.policy-answer').first();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('li')).toHaveCount(14);
  assert.equal((await page.request.get(new URL(await first.locator('a').getAttribute('href'), base).href)).status(), 200);
  await page.keyboard.press('Enter');
  await expect(first).not.toHaveAttribute('open', '');
  await page.locator('#policy-search').fill('buss');
  await expect(page.locator('.policy-answer[open]')).not.toHaveCount(0);
  await expect(page.locator('#policy-results')).toContainText('avgångar');
  await page.locator('#policy-search').fill('finnsinte987');
  await expect(page.locator('.policy-no-results')).toBeVisible();
  await page.locator('#policy-reset').click();
  await page.locator('#policy-subject').selectOption('skola');
  await expect(page.locator('.policy-answer[open]')).toHaveCount(1);
  await expect(page.locator('#policy-results')).toContainText('högst 12 barn');
  await page.reload();
  await expect(page.locator('.policy-answer[open]')).toHaveCount(1);
  await page.locator('#policy-period').selectOption('2022');
  await expect(page.locator('#policy-period-note')).toContainText('Tidigare valförslag');
  await page.locator('.policy-answer summary').first().click();
  await expect(page.locator('#policy-results')).toContainText('80 år');
  await page.locator('#policy-period').selectOption('2026');
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    await page.screenshot({ path: `artifacts/politics-clear-${width}.png`, fullPage: true });
    await first.locator('summary').click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Expanded overflow at ${width}`);
    await first.locator('summary').click();
  }
  assert.deepEqual(errors, []);
  console.log('Politics verified: cards, keyboard, proposals, sources, search, empty state, reset, subject, deep link, archive and four viewport widths.');
} finally {
  await browser.close();
}
