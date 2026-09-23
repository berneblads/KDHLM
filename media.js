import './media.css';

const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const preview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && new URLSearchParams(location.search).get('preview') === 'media';

function examples() {
  return [
    ['Simon', 'När det lokala samtalet tar plats i medierna', 'Här visas en artikel om Simon Berneblad Mandegård. Rubrik, källa och länk hämtas automatiskt när bevakningen hittar en träff.'],
    ['Erika', 'En plats för rösterna som formar Hässleholm', 'Så här presenteras en träff om Erika Heil Utbult, med en kort förhandsvisning och tydlig avsändare.'],
    ['KD Hässleholm', 'Det senaste om Kristdemokraterna i Hässleholm', 'Artiklar från externa källor samlas här, med den senaste publiceringen överst.'],
    ['Simon', 'Fler perspektiv på det lokala arbetet', 'Ett exempel på hur ytterligare en artikel visas i medieflödet.'],
  ].map(([topic, title, summary], index) => ({ id: `example-${index}`, title, summary, topics: [topic], source: 'Exempelkälla', date: new Date(Date.now() - index * 86400_000).toISOString(), example: true }));
}

function card(article, index) {
  const item = node('article', undefined, `media-card${index === 0 ? ' media-card-featured' : ''}`);
  const top = node('div', undefined, 'media-card-meta');
  top.append(node('span', article.example ? 'DESIGNEXEMPEL' : article.source, 'media-source'));
  if (article.date && Number.isFinite(Date.parse(article.date))) {
    const time = node('time', new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(article.date)));
    time.dateTime = article.date; top.append(time);
  }
  const heading = node('h3');
  let url;
  try { const parsed = new URL(article.url); if (['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password) url = parsed.href; } catch { /* no link in examples */ }
  if (url && !article.example) {
    const a = node('a', article.title); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; heading.append(a);
  } else heading.textContent = article.title;
  const bottom = node('div', undefined, 'media-card-bottom');
  bottom.append(node('span', article.topics.join(' · '), 'media-topic'));
  if (url && !article.example) {
    const a = node('a', `Läs hos ${article.source} ↗`, 'media-read');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Läs ${article.title} hos ${article.source} (öppnas i ny flik)`); bottom.append(a);
  } else bottom.append(node('span', 'Förhandsvisning ↗', 'media-read'));
  item.append(top, heading, node('p', article.summary, 'media-summary'), bottom);
  return item;
}

export function initMedia(root) {
  let articles = [], count = 6, loaded = false, busy = false;
  root.classList.add('media-feed');
  const header = node('div', undefined, 'media-heading');
  const intro = node('div'); intro.append(node('p', 'PRESS & OMVÄRLD', 'eyebrow'), node('h2', 'Hässleholm i blickfånget.'), node('p', 'Artiklar, röster och perspektiv på vårt lokala arbete.', 'media-intro'));
  const badge = node('span', preview ? 'Designpreview' : 'Nyhetsbevakning', 'media-live');
  header.append(intro, badge);
  const notice = node('p', '', 'media-notice'); notice.setAttribute('role', 'status');
  const grid = node('div', undefined, 'media-grid');
  const status = node('p', '', 'media-results'); status.setAttribute('aria-live', 'polite');
  const empty = node('div', undefined, 'media-empty');
  const more = node('button', 'Visa fler artiklar', 'button button-outline centered'); more.type = 'button'; more.hidden = true;
  const footer = node('div', undefined, 'media-footer');
  const updated = node('span', '');
  footer.append(node('p', 'Artiklarna publiceras av externa redaktioner. Länkar öppnas i en ny flik; vissa artiklar kan kräva prenumeration.'), updated);
  const pageLink = node('a', 'Alla medieträffar ↗', 'text-link'); pageLink.href = '/i-media.html' + (preview ? '?preview=media' : '');
  if (document.body.dataset.page !== 'media') footer.append(pageLink);
  root.append(header, notice, status, grid, empty, more, footer);

  function emptyState(title, description) {
    empty.replaceChildren(node('span', 'I MEDIA', 'media-empty-label'), node('h3', title), node('p', description));
    empty.hidden = false;
  }
  function render() {
    const matches = articles;
    grid.replaceChildren(...matches.slice(0, count).map(card));
    status.textContent = matches.length ? `${matches.length} ${preview ? 'designexempel' : matches.length === 1 ? 'artikel' : 'artiklar'} · Senaste först` : '';
    more.hidden = count >= matches.length;
    empty.hidden = matches.length > 0;
    if (!matches.length) emptyState('Nästa nyhet börjar här.', 'När bevakningen hittar nya artiklar visas de här automatiskt. Här följer vi Simon Berneblad Mandegård, Erika Heil Utbult och KD Hässleholm.');
  }
  more.addEventListener('click', () => { count += 6; render(); });

  async function refresh() {
    if (busy) return;
    busy = true; root.setAttribute('aria-busy', 'true');
    if (!loaded) emptyState('Vi hämtar det senaste.', 'Söker efter nya artiklar i mediebevakningen …');
    try {
      let data;
      if (preview) data = { articles: examples(), available: true };
      else {
        const response = await fetch('/api/media', { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error('Unavailable');
        data = await response.json();
        if (!data.available || !Array.isArray(data.articles)) throw new Error('Invalid payload');
      }
      articles = data.articles.filter(a => typeof a.title === 'string' && Array.isArray(a.topics));
      loaded = true;
      notice.textContent = preview ? 'DESIGNPREVIEW · Alla kort nedan är exempel på utseendet, inte publicerade artiklar.' : data.stale ? 'Visar senast sparade artiklar. Bevakningen kan inte uppdateras just nu.' : data.partial ? 'Delar av bevakningen kan inte uppdateras just nu. Tillgängliga artiklar visas.' : '';
      badge.textContent = preview ? 'Designpreview' : data.partial ? 'Tillfälligt begränsat' : 'Uppdateras automatiskt';
      badge.classList.toggle('media-live-muted', Boolean(data.partial));
      if (data.checkedAt) updated.textContent = 'Senast kontrollerat ' + new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' }).format(new Date(data.checkedAt));
      render();
    } catch {
      badge.textContent = 'Tillfälligt pausad'; badge.classList.add('media-live-muted');
      notice.textContent = loaded ? 'Kunde inte uppdatera. Tidigare hämtade artiklar visas tills vidare.' : 'Nyhetsbevakningen är tillfälligt otillgänglig.';
      if (!loaded) emptyState('Vi är snart tillbaka.', 'Det gick inte att hämta artiklarna just nu. Försök gärna igen om en stund.');
      const retry = node('button', 'Försök igen', 'media-retry'); retry.type = 'button'; retry.addEventListener('click', refresh); notice.append(' ', retry);
    } finally { busy = false; root.setAttribute('aria-busy', 'false'); }
  }
  refresh();
  if (!preview) setInterval(() => { if (!document.hidden && !root.hidden) refresh(); }, 15 * 60_000);
}
