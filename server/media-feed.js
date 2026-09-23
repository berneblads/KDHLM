import { SaxesParser } from 'saxes';
import { createHash } from 'node:crypto';
const ATOM = 'http://www.w3.org/2005/Atom';

export function articleURL(raw) {
  try {
    let url = new URL(raw);
    if (['www.google.com', 'google.com'].includes(url.hostname) && url.pathname === '/url') {
      url = new URL(url.searchParams.get('url') || url.searchParams.get('q'));
    }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)) return null;
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|gclid$|fbclid$)/i.test(key)) url.searchParams.delete(key);
    url.hash = '';
    url.searchParams.sort();
    return url.href;
  } catch { return null; }
}

function plainText(raw = '') {
  return raw.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, e => ({'&nbsp;':' ', '&amp;':'&', '&quot;':'"', '&apos;':"'", '&lt;':'<', '&gt;':'>'}[e])).replace(/\s+/g, ' ').trim();
}

export function parseFeed(xml, topic) {
  if (Buffer.byteLength(xml) > 2_000_000) throw new Error('Feed too large');
  const parser = new SaxesParser({ xmlns: true });
  const entries = [], stack = [];
  let entry, root = false;
  parser.on('doctype', () => { throw new Error('DOCTYPE not supported'); });
  parser.on('opentag', tag => {
    stack.push(tag);
    if (stack.length === 1) root = tag.local === 'feed' && tag.uri === ATOM;
    if (tag.uri !== ATOM) return;
    if (tag.local === 'entry' && stack.length === 2) entry = {};
    if (entry && tag.local === 'link' && stack.length === 3) {
      const attr = name => Object.values(tag.attributes).find(a => a.local === name)?.value;
      if (!attr('rel') || attr('rel') === 'alternate') entry.url = attr('href');
    }
  });
  const onText = text => {
    const field = stack[2];
    if (entry && field?.uri === ATOM && ['title', 'content', 'summary', 'published', 'updated'].includes(field.local)) entry[field.local] = (entry[field.local] || '') + text;
  };
  parser.on('text', onText); parser.on('cdata', onText);
  parser.on('closetag', tag => {
    if (tag.local === 'entry' && tag.uri === ATOM && stack.length === 2 && entry) {
      const url = articleURL(entry.url), title = plainText(entry.title).slice(0, 350);
      const instant = Date.parse(entry.published || entry.updated);
      if (url && title) entries.push({
        id: createHash('sha256').update(url).digest('hex').slice(0, 20), url, title,
        summary: plainText(entry.content || entry.summary).slice(0, 360),
        source: new URL(url).hostname.replace(/^www\./, ''), topics: [topic],
        date: Number.isFinite(instant) ? new Date(instant).toISOString() : null,
      });
      entry = null;
    }
    stack.pop();
  });
  parser.write(xml).close();
  if (!root) throw new Error('Expected Atom feed');
  return entries;
}

export function mergeArticles(groups, hidden = []) {
  const excluded = new Set(hidden.map(articleURL)), unique = new Map();
  for (const article of groups.flat()) {
    if (excluded.has(article.url)) continue;
    const old = unique.get(article.url);
    if (old) old.topics = [...new Set([...old.topics, ...article.topics])];
    else unique.set(article.url, { ...article, topics: [...article.topics] });
  }
  return [...unique.values()].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0) || a.url.localeCompare(b.url)).slice(0, 100);
}

export function createMediaService(feeds, { fetcher = fetch, now = Date.now, hidden = [] } = {}) {
  const cache = new Map();
  let pending;
  async function refresh() {
    const results = await Promise.allSettled(feeds.map(async feed => {
      const old = cache.get(feed.id);
      if (old && now() - old.at < 15 * 60_000) return old;
      const response = await fetcher(feed.url, { signal: AbortSignal.timeout(10_000), redirect: 'error', headers: { Accept: 'application/atom+xml, application/xml' } });
      if (!response.ok) throw new Error('Feed unavailable');
      let xml = '', bytes = 0;
      const decoder = new TextDecoder();
      for await (const chunk of response.body) {
        bytes += chunk.byteLength;
        if (bytes > 2_000_000) throw new Error('Feed too large');
        xml += decoder.decode(chunk, { stream: true });
      }
      xml += decoder.decode();
      const value = { articles: parseFeed(xml, feed.topic), at: now() };
      cache.set(feed.id, value);
      return value;
    }));
    const good = results.filter(r => r.status === 'fulfilled').length;
    const snapshots = feeds.map(f => cache.get(f.id)).filter(v => v && now() - v.at < 24 * 60 * 60_000);
    return {
      articles: mergeArticles(snapshots.map(v => v.articles), hidden),
      available: good > 0 || snapshots.length > 0,
      partial: good < feeds.length, stale: good === 0 && snapshots.length > 0,
      checkedAt: snapshots.length ? new Date(Math.min(...snapshots.map(v => v.at))).toISOString() : null,
      feedCount: feeds.length,
    };
  }
  return () => pending || (pending = refresh().finally(() => { pending = null; }));
}
