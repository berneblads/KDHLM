import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: process.env.TEST_BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(`${base}/#fokus`);
  await expect(page.locator('#focus-heading')).toBeVisible();
  assert.equal(new URL(page.url()).pathname, '/');
  const topics = await page.evaluate(() => window.siteContent.politics.topics);
  await expect(page.getByRole('tab')).toHaveCount(topics.length + 1);
  for (const topic of topics) {
    await page.getByRole('tab', { name: topic.label, exact: true }).click();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toHaveCount(1);
    await expect(panel.locator('h3')).toHaveText(topic.title);
    assert.deepEqual(await panel.locator('.focus-summary li').allTextContents(), topic.bullets.slice(0, 3));
    for (const bullet of topic.bullets) {
      await expect(panel.locator('.focus-proposal-text')).toHaveText(bullet);
      await panel.getByRole('button', { name: 'Nästa förslag', exact: true }).click();
    }
    await expect(panel.locator('.focus-proposal-text')).toHaveText(topic.bullets[0]);
    await panel.getByRole('button', { name: 'Föregående förslag', exact: true }).click();
    await expect(panel.locator('.focus-proposal-text')).toHaveText(topic.bullets.at(-1));
    await panel.getByRole('button', { name: 'Visa förslag 2', exact: true }).click();
    await expect(panel.locator('.focus-proposal-text')).toHaveText(topic.bullets[1]);
  }
  const firstTab = page.getByRole('tab').first();
  await firstTab.click();
  await firstTab.press('ArrowLeft');
  await expect(page.getByRole('tab').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(firstTab).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tabpanel').getByRole('link').click();
  await expect(page.locator('#policy-subject')).toHaveValue(topics[1].id);
  await expect(page.locator('.policy-answer[open]')).toHaveCount(1);
  await page.goto(`${base}/#fokus`);
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    for (const topic of topics) {
      await page.getByRole('tab', { name: topic.label, exact: true }).click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}, ${topic.id}`);
    }
    await firstTab.click();
    await page.locator('#fokus').screenshot({ path: `artifacts/policy-focus-${width}.png` });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: all 7 areas and all proposals, wraparound, dot navigation, keyboard tabs, subject links, #fokus and 4 viewport sizes; no browser errors.');
} finally {
  await browser.close();
}
