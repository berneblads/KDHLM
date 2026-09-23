import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleURL, parseFeed, mergeArticles, createMediaService } from '../server/media-feed.js';
const xml = (entries = '') => `<feed xmlns="http://www.w3.org/2005/Atom">${entries}</feed>`;
const entry = (url = 'https://paper.se/story?utm_source=google', title = 'Simon &amp; Erika', date = '2026-09-05T10:00:00Z') => `<entry><title type="html">${title}</title><link rel="alternate" href="${url}"/><published>${date}</published><content type="html">En &lt;b&gt;lokal&lt;/b&gt; artikel.</content></entry>`;
test('Atom: real empty feed, escaped HTML, dates, redirect URLs and no executable links', () => {
  assert.deepEqual(parseFeed(xml(), 'Simon'), []);
  const [article] = parseFeed(xml(entry('https://www.google.com/url?url=https%3A%2F%2Fpaper.se%2Fstory%3Futm_source%3Dalerts')), 'Simon');
  assert.equal(article.title, 'Simon & Erika'); assert.equal(article.summary, 'En lokal artikel.');
  assert.equal(article.url, 'https://paper.se/story'); assert.equal(article.source, 'paper.se');
  assert.equal(parseFeed(xml(entry('javascript:alert(1)')), 'Simon').length, 0);
  assert.equal(articleURL('https://user:pass@paper.se/story'), null);
  assert.equal(parseFeed(xml(entry('https://paper.se/story', 'Test', 'bad-date')), 'Simon')[0].date, null);
  assert.throws(() => parseFeed('<html></html>', 'Simon'));
  assert.throws(() => parseFeed(xml('<entry>'), 'Simon'));
  assert.throws(() => parseFeed('<!DOCTYPE feed>' + xml(), 'Simon'));
});
test('Merges overlapping alerts, retains topics, sorts and hides unwanted URLs', () => {
  const a = parseFeed(xml(entry()), 'Simon'), b = parseFeed(xml(entry()), 'KD Hässleholm');
  const older = parseFeed(xml(entry('https://paper.se/older', 'Older', '2026-09-01')), 'Erika');
  const merged = mergeArticles([older, a, b]);
  assert.equal(merged.length, 2); assert.deepEqual(merged[0].topics, ['Simon', 'KD Hässleholm']);
  assert.equal(mergeArticles([a, b], ['https://paper.se/story']).length, 0);
});
test('Independent feed failure, cache, stale fallback, expiry and concurrent requests', async () => {
  let at = Date.now(), calls = 0, fail = false;
  const feeds = [{ id: 'one', topic: 'Simon', url: 'https://feed.test/one' }, { id: 'two', topic: 'Erika', url: 'https://feed.test/two' }];
  const service = createMediaService(feeds, { now: () => at, fetcher: async url => {
    calls++; if (fail || url.endsWith('two')) return new Response('', { status: 503 });
    return new Response(xml(entry()));
  } });
  const [first, same] = await Promise.all([service(), service()]);
  assert.equal(calls, 2); assert.deepEqual(first, same); assert.equal(first.partial, true); assert.equal(first.articles.length, 1);
  await service(); assert.equal(calls, 3);
  at += 16 * 60_000; fail = true;
  const stale = await service(); assert.equal(stale.stale, true); assert.equal(stale.available, true);
  at += 24 * 60 * 60_000;
  const expired = await service(); assert.equal(expired.available, false); assert.equal(expired.articles.length, 0);
});
test('Malformed upstream and oversized responses cannot look like successful empty feeds', async () => {
  for (const body of ['<html>sign in</html>', 'a'.repeat(2_000_001)]) {
    const service = createMediaService([{ id: 'one', topic: 'Simon', url: 'https://feed.test' }], { fetcher: async () => new Response(body) });
    assert.equal((await service()).available, false);
  }
});
