import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFile, mkdir } from 'node:fs/promises';
import { articlePath, publishedArticles } from '../article-utils.js';
import { siteName, description, jsonLD } from '../seo-utils.js';
import { escapeHTML as e, loadSiteContent } from './generate-articles.js';

const assetPath = value => value.startsWith('file:') ? '/assets/' + fileURLToPath(value).split(/[\\/]/).pop() : value;
export function renderArchiveCard(article) {
  const href = articlePath(article);
  const image = article.image.startsWith('file:') ? '/article-media/' + basename(fileURLToPath(article.image)) : article.image;
  const date = article.date ? new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Stockholm' }).format(new Date(article.date)) : '';
  return `<article class="news-card"><a class="news-image-link${article.category==='Debatt'?' debate-image':''}" href="${e(href)}" tabindex="-1" aria-hidden="true"><img class="news-image" src="${e(image)}" alt="${e(article.alt)}" loading="lazy" decoding="async"></a><div class="news-copy"><div class="news-card-meta"><p class="article-category">${e(article.category)}</p>${date?`<time datetime="${e(article.date)}">${e(date)}</time>`:''}</div><h2><a href="${e(href)}">${e(article.title)}</a></h2><p class="news-excerpt">${e(article.intro)}</p>${article.author?`<p class="news-author">${e(article.author)}</p>`:''}<a class="text-button" href="${e(href)}" aria-label="${e('Läs mer: '+article.title)}">Läs mer →</a></div></article>`;
}

export function renderSEOPage(html, path, content) {
  // Keep the first visible layout stable while the small local fonts settle.
  // Reveal promptly even when a font request fails or the connection is slow.
  html = html.replace('</head>', `<script>document.documentElement.classList.add('fonts-loading');const revealFonts=()=>document.documentElement.classList.remove('fonts-loading');setTimeout(revealFonts,1500);document.addEventListener('DOMContentLoaded',()=>document.fonts.ready.then(revealFonts,revealFonts),{once:true});</script></head>`);
  if (/class="[^"]*article-page/.test(html)) return html;
  const c = content, url = new URL(path === '/index.html' ? '/' : path, c.siteURL).href;
  const page = html.match(/data-page="([^"]+)"/)?.[1];
  const home = path === '/' || path === '/index.html';
  if (home) html = html.replace(/(<a class="brand"[^>]*>)<img[^>]*>/, (_, start) => `${start}<img src="${e(assetPath(c.images.whiteLogo))}" width="65" height="65" alt="KD"><span>${e(c.brandName)}</span>`);
  const areaId = html.match(/data-area="([^"]+)"/)?.[1];
  const area = c.subpages.areas.find(a => a.id === areaId);
  const hero = home ? c.subpages.heroes.home : page === 'media' ? {title:'I MEDIA',intro:'Det lokala arbetet.\nDe större perspektiven.',image:c.subpages.heroes.news.image,alt:c.subpages.heroes.news.alt} : page === 'area' && area ? { title: area.title.toLocaleUpperCase('sv-SE'), intro: c.subpages.text.areaIntro, image: area.image, alt: area.alt } : c.subpages.heroes[page];
  const fill = (id, text) => { html = html.replace(new RegExp(`(<[^>]+id="${id}"[^>]*>)(</[^>]+>)`), (_, start, end) => start + e(text) + end); };
  html = html.replace(/(<([a-z0-9]+)\b[^>]*data-text="([^"]+)"[^>]*>)(<\/\2>)/g, (match,start,tag,key,end)=>c.text[key]===undefined?match:start+e(c.text[key])+end);
  if (hero) {
    fill('sub-title', hero.title); fill('sub-intro', hero.intro);
    html = html.replace(/<img id="sub-image"[^>]*>/, `<img id="sub-image" src="${e(assetPath(hero.image))}" width="1200" height="800" alt="${e(hero.alt)}" style="object-position:${e(hero.position||'center')}" fetchpriority="high">`);
  }
  if (page === 'area' && area) {
    html = html.replace('<nav id="breadcrumbs" aria-label="Brödsmulor" hidden></nav>', `<nav id="breadcrumbs" aria-label="Brödsmulor"><a href="/politik.html">Vår politik</a><span> / ${e(area.title)}</span></nav>`);
    fill('proposals-heading', 'Våra förslag från 2026');
    fill('related-heading', c.subpages.text.related);
    const proposals = area.groups.map((group, index) => {
      const topic = c.politics.topics.find(topic => topic.id === group.topic);
      const bullets = topic.bullets.filter(bullet => !group.include || group.include.some(term => bullet.toLocaleLowerCase('sv-SE').includes(term)));
      return `<details class="proposal"${index===0?' open':''}><summary>${e(group.title)}</summary><ul>${bullets.map(bullet=>`<li>${e(bullet)}</li>`).join('')}</ul></details>`;
    }).join('');
    html = html.replace('<div id="area-proposals"></div>', `<p class="policy-period">Lokal politik ur valprogrammet som antogs den 26 maj 2026.</p><div id="area-proposals">${proposals}</div>`);
  }
  const nav = items => items.map(item => `<a${item.primary?' class="button"':''} href="${e(item.href || c.links[item.link])}">${e(item.label)}</a>`).join('');
  html = html.replace(/(<nav id="navigation"[^>]*>)(<\/nav>)/, `$1${nav(c.navigation)}$2`);
  html = html.replace(/(<nav id="footer-navigation"[^>]*>)(<\/nav>)/, `$1${nav(c.footerNavigation)}$2`);
  const topicHTML = topic => `<details class="policy-detail" id="${e(topic.id)}"><summary>${e(topic.label)}</summary><h3>${e(topic.title)}</h3><p>${e(topic.intro)}</p><ul>${topic.bullets.map(text=>`<li>${e(text)}</li>`).join('')}</ul></details>`;
  if (page === 'politics') html = html.replace('<div id="policy-results"></div>', `<div id="policy-results">${c.politics.topics.map(topicHTML).join('')}</div>`);
  if (path === '/valprogram.html') {
    html = html.replace(/(<section id="politik"[^>]*>)(<\/section>)/, `$1${c.politics.topics.map(topicHTML).join('')}$2`);
    html = html.replace('<div id="national-politics"></div>', `<div id="national-politics">${c.politics.national.map(item=>`<article class="national-item"><h3>${e(item.title)}</h3><p>${e(item.text)}</p><a href="${e(item.source)}">Läs mer hos Kristdemokraterna</a></article>`).join('')}</div>`);
    html = html.replace(/<a class="button" id="program-link"/, `<a href="${e(c.links.program)}" class="button" id="program-link"`);
  }
  const articles = publishedArticles(c.subpages.articles).filter(a=>a.category!=='Gruppledaren').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if (page === 'news') {
    const visible = home ? articles.slice(0, 3) : articles;
    html = html.replace('<div id="news-grid" class="news-grid"></div>', `<div id="news-grid" class="news-grid">${visible.map(renderArchiveCard).join('')}</div>`);
    html = html.replace('<div id="news-filters" class="pill-filters" aria-label="Filtrera artiklar"></div>', `<div id="news-filters" class="pill-filters" aria-label="Filtrera artiklar">${[...c.subpages.text.newsFilters,'I media'].map(label=>`<button aria-pressed="${label==='Alla'}">${e(label)}</button>`).join('')}</div>`);
    html = html.replace('<button id="news-more" class="button button-outline centered"></button>', `<button id="news-more" class="button button-outline centered"${visible.length>=articles.length?' hidden':''}>${e(c.subpages.text.moreNews)}</button>`);
    if (home) html = html.replace('<button id="news-more"', '<p class="news-archive-link"><a href="/aktuellt.html">Alla artiklar och debattinlägg →</a></p><button id="news-more"');
  }
  const title = home ? siteName : html.match(/<title>([^<]+)<\/title>/)?.[1] || siteName;
  const summary = home ? 'Nyheter, debatt och lokal politik från Kristdemokraterna i Hässleholm. Läs våra förslag och hitta kontaktuppgifter och aktiviteter.' : page === 'news' ? 'Läs debattartiklar och nyheter från Kristdemokraterna i Hässleholm. Hela artikelarkivet, med författare och datum, samlat på ett ställe.' : html.match(/<meta name="description" content="([^"]*)"/)?.[1] || hero?.intro || siteName;
  html = html.replace(/<link rel="canonical"[^>]*>/g, '').replace(/<meta (?:property="og:[^"]+"|name="(?:description|robots|twitter:[^"]+)")[^>]*>/g, '').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const organization = { '@type': 'Organization', '@id': c.siteURL + '/#organization', name: siteName, url: c.siteURL + '/', logo: c.siteURL + '/seo/kd-hassleholm.png', email: c.contact.email, telephone: c.contact.phone, sameAs: [c.links.representatives, c.links.facebook] };
  const website = { '@type': 'WebSite', '@id': c.siteURL + '/#website', name: siteName, url: c.siteURL + '/', inLanguage: 'sv-SE', publisher: { '@id': organization['@id'] } };
  const webpage = { '@type': page === 'news' && !home ? 'CollectionPage' : 'WebPage', '@id': url + '#webpage', url, name: title, description: summary, inLanguage: 'sv-SE', isPartOf: { '@id': website['@id'] }, publisher: { '@id': organization['@id'] } };
  const graph = [organization, website, webpage];
  if (page === 'news' && !home) graph.push({ '@type': 'ItemList', '@id': url + '#articles', numberOfItems: articles.length, itemListElement: articles.map((article,i)=>({ '@type': 'ListItem', position: i+1, name: article.title, url: new URL(articlePath(article),c.siteURL).href })) });
  const metadata = `<link rel="canonical" href="${e(url)}"><meta name="description" content="${e(description(summary))}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:locale" content="sv_SE"><meta property="og:site_name" content="${siteName}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description(summary))}"><meta property="og:url" content="${e(url)}"><meta property="og:image" content="${e(c.siteURL+'/seo/kd-hassleholm.png')}"><meta property="og:image:alt" content="${siteName}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${jsonLD({'@context':'https://schema.org','@graph':graph})}</script>`;
  const noJS = '<noscript><style>.menu-toggle,#news-filters,#news-more,.focus-tabs,.policy-search-controls{display:none!important}.site-header{height:auto!important}.header-inner{flex-wrap:wrap;padding-block:16px}#navigation{display:flex!important;position:static!important;flex-wrap:wrap;width:100%;gap:16px;padding:12px 0;background:white}.site-header nav a.button{margin-left:0}</style></noscript>';
  return html.replace('</head>', metadata + noJS + '</head>');
}

export function seoPages() {
  return {
    name: 'static-seo-pages',
    async buildStart() {
      await mkdir('public/seo', { recursive: true });
      await copyFile('assets/logo.png', 'public/seo/kd-hassleholm.png');
    },
    transformIndexHtml: { order: 'pre', async handler(html, ctx) { return renderSEOPage(html, ctx.path, await loadSiteContent()); } },
  };
}
