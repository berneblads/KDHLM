import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(`${base}/#loften`);
  await expect(page.locator('#focus-heading')).toBeVisible();
  assert.equal(new URL(page.url()).pathname, '/');
  const proposals = await page.evaluate(() => window.siteContent.politics.national);
  for (const [index, proposal] of proposals.entries()) {
    await expect(page.locator('#focus-panel-nationellt .focus-proposal-text')).toHaveText(proposal.title);
    await expect(page.locator('#focus-panel-nationellt .focus-proposal-description')).toHaveText(proposal.text);
    await expect(page.locator('#focus-panel-nationellt .focus-proposal-source')).toHaveAttribute('href', proposal.source);
    await expect(page.locator('#focus-panel-nationellt .focus-controls>span')).toHaveText(`${index + 1} / ${proposals.length}`);
    await page.locator('#focus-panel-nationellt .focus-controls button:last-child').click();
  }
  await expect(page.locator('#focus-panel-nationellt .focus-proposal-text')).toHaveText(proposals[0].title);
  await page.locator('#focus-panel-nationellt .focus-controls button:first-child').click();
  await expect(page.locator('#focus-panel-nationellt .focus-proposal-text')).toHaveText(proposals.at(-1).title);
  for (let i = 0; i < 20; i++) {
    const before = await page.locator('#focus-panel-nationellt .focus-proposal-text').textContent();
    await page.locator('#focus-panel-nationellt .focus-random').click();
    const after = await page.locator('#focus-panel-nationellt .focus-proposal-text').textContent();
    assert.notEqual(after, before);
    const selected = proposals.find(proposal => proposal.title === after);
    assert.ok(selected);
    await expect(page.locator('#focus-panel-nationellt .focus-proposal-source')).toHaveAttribute('href', selected.source);
    await expect(page.locator('#focus-panel-nationellt .focus-random')).toBeFocused();
  }
  await page.locator('#focus-panel-nationellt .focus-controls button:last-child').focus();
  const before = await page.locator('#focus-panel-nationellt .focus-proposal-text').textContent();
  await page.keyboard.press('Enter');
  assert.notEqual(await page.locator('#focus-panel-nationellt .focus-proposal-text').textContent(), before);
  await expect(page.locator('#focus-panel-nationellt .focus-controls button:last-child')).toBeFocused();
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    for (let i = 0; i < proposals.length; i++) {
      await page.locator('#focus-panel-nationellt .focus-controls button:last-child').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    }
    await page.locator('#fokus').screenshot({ path: `artifacts/proposal-cards-${width}.png` });
  }
  assert.deepEqual(errors, []);
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(`${base}/#loften`);
  await expect(noJS.locator('#fokus noscript a')).toBeVisible();
  console.log('PASS: all 15 cards and source links, wraparound, random avoids repeats, keyboard/focus, #loften, 4 widths, no-JS fallback; no browser errors.');
} finally {
  await browser.close();
}
