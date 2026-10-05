import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1440, 390, 320]) {
    for (const path of ['/', '/aktuellt.html', '/politik-omsorg.html']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/**', route => route.fulfill({ status: 503, json: { available: false } }));
      // Expose the first paint before JavaScript takes over, with slow fonts.
      const network = await page.context().newCDPSession(page);
      await network.send('Network.enable');
      await network.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 500000, uploadThroughput: 100000 });
      await page.route(url => /\/(?:app\.js|assets\/app-[^/]+\.js)$/.test(url.pathname), async route => { await new Promise(resolve => setTimeout(resolve, 1000)); await route.continue(); });
      await page.addInitScript(() => {
        window.loadingShifts = [];
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.loadingShifts.push({ value: entry.value, nodes: entry.sources.map(source => source.node?.className || source.node?.id) });
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await expect(page.locator('#sub-title')).not.toBeEmpty();
      assert.equal(await page.locator('#news-filters button').count(), path.includes('politik-') ? 0 : 4);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const shifts = await page.evaluate(() => window.loadingShifts);
      const score = shifts.reduce((sum, entry) => sum + entry.value, 0);
      console.log(JSON.stringify({ width, path, score, shifts }));
      assert.ok(score < 0.02, `Layout shifted at ${width}px on ${path}: ${score}`);
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
} finally { await browser.close(); }
