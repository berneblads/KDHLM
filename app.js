import './content.js';
import { initPoliticsExplorer } from './politics-explorer.js';
import { initPolicyFocus } from './policy-focus.js';
import { initMedia } from './media.js';
import { articlePath, publishedArticles } from './article-utils.js';
import { generatedArticlePaths } from './generated-articles.js';
import { formatDate, localDate, timeLabel, upcomingEvents, makeICS, sampleInstant } from './calendar-utils.js';
import { municipalEvents, mergeMunicipalEvents } from './municipal-calendar.js';
const c = window.siteContent;
if (document.body.classList.contains('home-page')) {
  const brand = document.querySelector('.site-header .brand');
  brand.querySelector('img').src = c.images.whiteLogo;
  if (!brand.querySelector('span')) { const name = document.createElement('span'); name.textContent = c.brandName; brand.append(name); }
}
initPolicyFocus(c);
const $ = (selector, root = document) => root.querySelector(selector);
const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
function safeURL(raw, { image = false } = {}) {
  try { const url = new URL(raw, location.origin); if (url.origin === location.origin || (url.protocol === 'https:' && !url.username && !url.password)) return url.href; } catch { /* malformed URL */ }
  return image ? c.images.logo : '#';
}
function link(label, href, className) { const a = el('a', label, className); a.href = safeURL(href); if (new URL(a.href).origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } return a; }
function picture(src, alt, className) { const img = el('img', undefined, className); img.src = safeURL(src, { image: true }); img.alt = alt || ''; img.loading = 'lazy'; img.decoding = 'async'; return img; }
document.querySelectorAll('[data-text]').forEach(node => { node.textContent = c.text[node.dataset.text] ?? ''; });
let returnFocus;
const dialog = $('#info-dialog');
function openDialog(title, nodes) { returnFocus = document.activeElement; $('#dialog-title').textContent = title; $('#dialog-body').replaceChildren(...nodes); dialog.showModal(); }
dialog.addEventListener('close', () => returnFocus?.focus());
$('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
function showContact() {
  const d = c.contact;
  openDialog(d.title, [el('p', d.name), el('p', d.address), link(d.email, `mailto:${d.email}`), el('p', d.phone), link(d.sourceLabel, c.links.representatives, 'text-link')]);
  // Email is controlled editorial content, with an explicit mailto scheme.
  $('#dialog-body a').href = `mailto:${d.email}`;
  const phone = $('#dialog-body p:last-of-type'); phone.replaceChildren(link(d.phone, '#')); phone.firstChild.href = `tel:${d.phone.replace(/[^+\d]/g, '')}`;
}
function navItem(item) { const node = link(item.label, item.href || c.links[item.link], item.primary ? 'button' : ''); if (item.link === 'membership') node.removeAttribute('target'); return node; }
$('#navigation').replaceChildren(...c.navigation.map(navItem));
$('#navigation').querySelectorAll('a').forEach(a=>{if(new URL(a.href).pathname===location.pathname && !new URL(a.href).hash)a.setAttribute('aria-current','page');});
$('#footer-navigation').replaceChildren(...c.footerNavigation.map(navItem));
const footerBrand = $('.site-footer .brand');
footerBrand.replaceChildren(picture(c.images.whiteLogo, 'KD'), el('span', c.brandName));
if (document.body.classList.contains('subpage')) {
  const social = el('div', undefined, 'footer-social');
  for (const name of ['facebook', 'instagram']) {
    const a = link('', c.links[name], 'social-icon');
    a.setAttribute('aria-label', name === 'facebook' ? 'Facebook' : 'Instagram');
    a.append(lineIcon(name)); social.append(a);
    $(`#footer-navigation a[href="${c.links[name]}"]`)?.remove();
  }
  $('.footer-inner').append(social, el('span', 'Människan före systemet', 'footer-signature'));
  const ornament = el('div', undefined, 'hero-ornament');
  ornament.setAttribute('aria-hidden', 'true');
  ornament.append(el('span', 'Ett starkare\nHässleholm\ntillsammans', 'hero-signature'));
  $('.sub-hero')?.prepend(ornament);
}
document.querySelectorAll('[data-membership]').forEach(a => { a.href = c.links.membership; });
const menu = $('.menu-toggle');
function closeMenu() { $('#navigation').classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Öppna menyn'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; $('#navigation').classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Stäng menyn' : 'Öppna menyn'); });
$('#navigation').addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

if (document.body.classList.contains('subpage')) {
  if (!document.body.classList.contains('article-page')) await initSubpage();
  if (document.body.classList.contains('home-page')) await startHome();
} else if (document.body.classList.contains('politics-page')) {
  $('#program-link').href = c.links.program;
  $('#politik').replaceChildren();
  $('#national-politics').replaceChildren();
  for (const topic of c.politics.topics) {
    const details = el('details', undefined, 'policy-detail'); details.id = topic.id;
    const list = el('ul'); list.append(...topic.bullets.map(b => el('li', b)));
    details.append(el('summary', topic.label), el('h3', topic.title), el('p', topic.intro), list); $('#politik').append(details);
  }
  for (const candidate of c.politics.candidates) { const card = el('article', undefined, 'candidate'); card.append(el('h3', candidate.name), el('p', candidate.role), el('p', candidate.description)); $('#candidates-grid').append(card); }
  for (const p of c.politics.national) { const item = el('article', undefined, 'national-item'); item.append(el('h3', p.title), el('p', p.text), link('Läs mer hos Kristdemokraterna ↗', p.source)); $('#national-politics').append(item); }
  const target = document.getElementById(location.hash.slice(1)); if (target?.tagName === 'DETAILS') { target.open = true; target.scrollIntoView(); }
} else {
  await startHome();
}

async function startHome() {
  // Show the real planning calendar locally too; samples require ?data=demo.
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const demo = isLocal && new URLSearchParams(location.search).get('data') === 'demo';
  let samples;
  if (demo) { const { exampleContent } = await import('./examples.js'); samples = exampleContent(c.images); c.examples = samples; }

  const oldHash = { '#politik': '/politik.html', '#kandidater': '/valprogram.html#kandidater', '#pdf': c.links.program };
  if (oldHash[location.hash]) location.replace(oldHash[location.hash]);

  let events = demo ? [] : municipalEvents, visibleCount = 3, calendarMode = 'list', openEvents = new Set(), renderedUpcoming = '';
  let selectedMonth = localDate(new Date()).slice(0, 7), monthSelected = null;
  const list = $('#calendar-list');
  const more = $('#calendar-more');
  function eventDetails(event, parent) {
    parent.append(el('p', event.description), el('p', event.address));
    const actions = el('div', undefined, 'event-actions');
    const place = el('button', c.text.showPlace, 'button button-outline');
    const placePanel = el('div', undefined, 'place-panel'); placePanel.hidden = true; placePanel.id = `place-${calendarMode}-${event.id}`;
    place.setAttribute('aria-expanded', 'false'); place.setAttribute('aria-controls', placePanel.id);
    placePanel.append(el('p', event.place), el('p', event.address));
    if (Number.isFinite(event.latitude) && Number.isFinite(event.longitude)) {
      placePanel.append(el('p', c.text.mapConsent));
      const loadMap = el('button', c.text.mapLoad, 'button button-outline');
      loadMap.addEventListener('click', () => { const { latitude: lat, longitude: lon } = event; const iframe = el('iframe'); iframe.title = `Karta: ${event.place}`; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer'; iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-.005},${lat-.003},${lon+.005},${lat+.003}&layer=mapnik&marker=${lat},${lon}`; placePanel.append(iframe); loadMap.remove(); });
      placePanel.append(loadMap);
    } else placePanel.append(el('p', c.text.mapUnavailable));
    place.addEventListener('click', () => { placePanel.hidden = !placePanel.hidden; place.setAttribute('aria-expanded', String(!placePanel.hidden)); });
    const download = el('button', c.text.addCalendar, 'button button-outline');
    download.addEventListener('click', () => { const url = URL.createObjectURL(new Blob([makeICS(event)], { type: 'text/calendar;charset=utf-8' })); const a = el('a'); a.href = url; a.download = `${event.id}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    actions.append(place, download); parent.append(actions, placePanel);
  }
  function eventRow(event, forceOpen = false) {
    const article = el('article', undefined, 'event'); const button = el('button', undefined, 'event-summary');
    const detailId = `event-${calendarMode}-${event.id}`;
    const tile = el('span', undefined, 'date-tile'); tile.setAttribute('aria-hidden', 'true'); tile.append(el('strong', formatDate(event.start, { day: '2-digit' })), el('span', formatDate(event.start, { month: 'short' }).replace('.', '')));
    const text = el('span'); const title = el('span', event.title, 'event-title');
    if (event.status === 'cancelled') title.append(el('span', c.text.cancelled, 'cancelled'));
    text.append(title, el('span', `${formatDate(event.start, { year: 'numeric' })} · ${timeLabel(event)} · ${event.place}`, 'event-meta'));
    const arrow = el('span', '→', 'event-arrow'); arrow.setAttribute('aria-hidden', 'true');
    button.append(tile, text, arrow); button.setAttribute('aria-label', `${event.title}, ${formatDate(event.start, { day: 'numeric', month: 'long', year: 'numeric' })}, ${timeLabel(event)}${event.status === 'cancelled' ? ', inställt' : ''}`);
    const body = el('div', undefined, 'event-details'); body.id = detailId; body.hidden = !(forceOpen || openEvents.has(event.id)); button.setAttribute('aria-expanded', String(!body.hidden)); button.setAttribute('aria-controls', detailId);
    eventDetails(event, body);
    button.addEventListener('click', () => { body.hidden = !body.hidden; button.setAttribute('aria-expanded', String(!body.hidden)); body.hidden ? openEvents.delete(event.id) : openEvents.add(event.id); });
    article.append(button, body); return article;
  }
  function renderCalendar() {
    const upcoming = upcomingEvents(events);
    renderedUpcoming = upcoming.map(e => e.id).join('|');
    list.hidden = calendarMode !== 'list'; $('#calendar-month').hidden = calendarMode !== 'month';
    $('#list-view').setAttribute('aria-pressed', String(calendarMode === 'list')); $('#month-view').setAttribute('aria-pressed', String(calendarMode === 'month'));
    more.hidden = calendarMode !== 'list' || upcoming.length <= visibleCount;
    if (calendarMode === 'list') { list.replaceChildren(...upcoming.slice(0, visibleCount).map(e => eventRow(e))); if (!upcoming.length) list.append(el('p', c.text.calendarEmpty, 'empty-state')); }
    else renderMonth();
  }
  function renderMonth() {
    const [year, month] = selectedMonth.split('-').map(Number); const start = new Date(Date.UTC(year, month - 1, 1, 12));
    $('#month-heading').textContent = formatDate(start, { month: 'long', year: 'numeric' });
    const grid = $('#month-grid'); grid.replaceChildren(...c.text.weekdays.map(d => el('div', d, 'weekday')));
    const weekday = (start.getUTCDay() + 6) % 7; const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let index = 0; index < Math.ceil((weekday + days)/7)*7; index++) {
      const day = index - weekday + 1, cell = el('div', undefined, 'month-day');
      if (day < 1 || day > days) cell.classList.add('empty');
      else {
        const iso = `${selectedMonth}-${String(day).padStart(2,'0')}`; cell.append(el('span', String(day)));
        if (iso === localDate(new Date())) cell.classList.add('today');
        for (const event of events.filter(e => localDate(e.start) <= iso && localDate(Date.parse(e.end)-1) >= iso)) {
          const b = el('button', `${event.status === 'cancelled' ? 'Inställt: ' : ''}${event.title}`); b.setAttribute('aria-expanded', String(monthSelected === event.id)); b.setAttribute('aria-controls', 'month-details'); b.setAttribute('aria-label', `${day} ${$('#month-heading').textContent}: ${event.title}`);
          b.addEventListener('click', () => { monthSelected = event.id; grid.querySelectorAll('button').forEach(n => n.setAttribute('aria-expanded', String(n === b))); $('#month-details').replaceChildren(eventRow(event, true)); }); cell.append(b);
        }
      }
      grid.append(cell);
    }
    const selected = events.find(e => e.id === monthSelected);
    $('#month-details').replaceChildren(...(selected ? [eventRow(selected, true)] : []));
  }
  $('#list-view').addEventListener('click', () => { calendarMode = 'list'; renderCalendar(); });
  $('#month-view').addEventListener('click', () => { calendarMode = 'month'; renderCalendar(); });
  more.addEventListener('click', () => { visibleCount += 3; renderCalendar(); });
  const moveMonth = (delta) => { const [y,m] = selectedMonth.split('-').map(Number); selectedMonth = new Date(Date.UTC(y,m - 1 + delta,1,12)).toISOString().slice(0,7); monthSelected = null; renderMonth(); };
  $('#month-prev').addEventListener('click', () => moveMonth(-1)); $('#month-next').addEventListener('click', () => moveMonth(1));
  async function refreshCalendar() {
    try {
      const data = demo ? { events: samples.events.map(e => ({ ...e, start: sampleInstant(e.startLocal), end: sampleInstant(e.endLocal) })) } : await fetchJSON(c.integrations.calendar);
      if (!Array.isArray(data.events)) throw new Error('Unavailable');
      const valid = data.events.filter(e => /^[\w-]{1,100}$/.test(e.id) && typeof e.title === 'string' && Number.isFinite(Date.parse(e.start)) && Number.isFinite(Date.parse(e.end)));
      const next = demo ? valid : mergeMunicipalEvents(valid);
      const changed = JSON.stringify(events) !== JSON.stringify(next); events = next;
      $('#calendar-notice').textContent = demo ? c.text.calendarExample : '';
      // Do not destroy a visitor's open controls or keyboard focus on unchanged polls.
      if (changed || !list.childElementCount || upcomingEvents(events).map(e => e.id).join('|') !== renderedUpcoming) renderCalendar();
    } catch {
      if (!events.length) { $('#calendar-notice').textContent = c.text.calendarUnavailable; list.replaceChildren(); more.hidden = true; }
      else if (upcomingEvents(events).map(e => e.id).join('|') !== renderedUpcoming) renderCalendar();
    }
  }
  if (!demo) renderCalendar();
  await refreshCalendar();
  setInterval(() => { if (!document.hidden) refreshCalendar(); }, c.integrations.refreshMs);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCalendar(); });


}
async function fetchJSON(url) { const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000), cache: 'no-store' }); if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable'); return response.json(); }

function lineIcon(name) {
  const paths={heart:['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'],school:['m2 8 10-5 10 5-10 5Z','M6 10v7c4 3 8 3 12 0v-7','M22 8v9'],people:['M9 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0','M21 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0','M1 21v-5a5 5 0 0 1 10 0v5Z','M13 21v-5a5 5 0 0 1 10 0v5Z'],leaf:['M20 3C7 2 2 8 5 16s17 6 15-13Z','M3 23 16 8'],chart:['M2 14h4v8H2Z','M10 8h4v14h-4Z','M18 2h4v20h-4Z'],city:['M2 22V10h7v12','M9 22V2h10v20','M19 14h4v8H1','M12 6h1m3 0h0M12 10h1m3 0h0M12 14h1m3 0h0M12 18h1m3 0h0M5 14h0m0 4h0'],book:['M12 5C8 2 4 2 1 3v17c4-1 8-1 11 2 3-3 7-3 11-2V3c-3-1-7-1-11 2Z','M12 5v17'],mail:['M2 4h20v16H2Z','m2 5 10 8L22 5'],phone:['M5 2 2 5c0 8 9 17 17 17l3-3-6-4-2 2c-3-1-6-4-7-7l2-2Z'],calendar:['M3 5h18v17H3Z','M3 10h18M7 2v6M17 2v6M7 14h1m4 0h1m4 0h1M7 18h1m4 0h1'],person:['M17 8a5 5 0 1 0-10 0 5 5 0 0 0 10 0','M2 23c0-12 20-12 20 0Z'],search:['M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0','m15 15 6 6']};
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.35');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('line-icon');
  paths.facebook=['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z','M14 22v-9h3l.5-4H14V7c0-1 .5-2 2-2h2','M10 22V13H7V9h3V7c0-4 2-5 5-5'];
  paths.instagram=['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z','M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0','M17.5 6.5h.01'];
  for(const d of paths[name]||paths.people){const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);svg.append(p);}return svg;
}

async function initSubpage() {
  const s=c.subpages,t=s.text,page=document.body.dataset.page;
  const area=s.areas.find(a=>a.id===document.body.dataset.area);
  const hero=page==='media'?{title:'I MEDIA',intro:'Det lokala arbetet.\nDe större perspektiven.',image:s.heroes.news.image,alt:s.heroes.news.alt}:page==='area'?{title:area.title.toLocaleUpperCase('sv-SE'),intro:t.areaIntro,image:area.image,alt:area.alt}:s.heroes[document.body.classList.contains('home-page')?'home':page];
  $('#sub-title').textContent=hero.title;$('#sub-intro').textContent=hero.intro;$('#sub-image').src=hero.image;$('#sub-image').alt=hero.alt;$('#sub-image').style.objectPosition=hero.position||'center';
  if (!document.body.classList.contains('home-page')) document.title=hero.title.replaceAll('\n',' ')+' – KD Hässleholm';
  if(page==='area') {$('#breadcrumbs').hidden=false;$('#breadcrumbs').append(link('Vår politik','/politik.html'),el('span',' / '+area.title));}
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('data')!=='live';
  const published=publishedArticles(s.articles);
  const articles=(published.length?published:local?s.exampleArticles.map(a=>({...a,example:true})):[]).filter(a=>a.category!=='Gruppledaren'&&generatedArticlePaths.includes(articlePath(a))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const areaLink=a=>'/politik-'+a.id+'.html';
  function articleCard(article,small=false) {
    const href=articlePath(article),card=el('article',undefined,small?'news-card related-card':'news-card');
    const imageLink=link('',href,'news-image-link');if(article.category==='Debatt')imageLink.classList.add('debate-image');imageLink.setAttribute('tabindex','-1');imageLink.setAttribute('aria-hidden','true');imageLink.append(picture(article.image,'','news-image'));card.append(imageLink);
    const copy=el('div',undefined,'news-copy'),heading=el('h2');heading.append(link(article.title,href));
    const meta=el('div',undefined,'news-card-meta');
    meta.append(el('p',(article.example?'EXEMPEL · ':'')+article.category,'article-category'));
    if(article.date){const date=el('time',new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Stockholm'}).format(new Date(article.date)));date.dateTime=article.date;meta.append(date);}
    copy.append(meta,heading);if(!small)copy.append(el('p',article.intro,'news-excerpt'));
    if(article.author)copy.append(el('p',article.author,'news-author'));
    const read=link(t.readArticle,href,'text-button');read.setAttribute('aria-label',`${t.readArticle.replace(' →','')}: ${article.title}`);copy.append(read);card.append(copy);return card;
  }
  if(page==='news') {
    let filter=location.hash==='#i-media'?'I media':location.hash==='#debatt'?'Debatt':'Alla',count=3,mediaStarted=false;
    const mediaRoot=el('section');mediaRoot.id='media-root';mediaRoot.hidden=true;mediaRoot.setAttribute('aria-label','I media');$('#news-more').after(mediaRoot);
    const render=()=>{const media=filter==='I media';mediaRoot.hidden=!media;$('#news-grid').hidden=media;$('#news-notice').hidden=media;const items=articles.filter(a=>filter==='Alla'||a.category===filter);$('#news-grid').replaceChildren(...items.slice(0,count).map(a=>articleCard(a)));$('#news-notice').textContent=items.some(a=>a.example)?t.newsExample:!items.length?t.newsEmpty:filter==='Debatt'?`${items.length} debattartiklar · Senaste först`:'';$('#news-more').hidden=media||count>=items.length;if(media&&!mediaStarted){mediaStarted=true;initMedia(mediaRoot);}};
    for(const label of [...t.newsFilters,'I media']){const b=el('button',label);b.setAttribute('aria-pressed',String(label===filter));b.addEventListener('click',()=>{filter=label;count=3;history.replaceState(null,'',location.pathname+location.search+(filter==='I media'?'#i-media':filter==='Debatt'?'#debatt':''));$('#news-filters').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render();});$('#news-filters').append(b);}
    $('#news-more').textContent=t.moreNews;$('#news-more').addEventListener('click',()=>{count+=3;render();});render();
  }
  if(page==='media') initMedia($('#media-root'));
  if(page==='politics') initPoliticsExplorer(c);
  if(page==='area') {
    $('#proposals-heading').textContent='Våra förslag från 2026';$('#related-heading').textContent=t.related;
    $('#proposals-heading').after(el('p','Lokal politik ur valprogrammet som antogs den 26 maj 2026.','policy-period'));
    for(const [i,group] of area.groups.entries()) {const topic=c.politics.topics.find(p=>p.id===group.topic);const details=el('details',undefined,'proposal');details.open=i===0;const summary=el('summary',group.title);const list=el('ul');const bullets=topic.bullets.filter(b=>!group.include||group.include.some(term=>b.toLocaleLowerCase('sv-SE').includes(term)));list.append(...bullets.map(b=>el('li',b)));details.append(summary,list);$('#area-proposals').append(details);}
    const source=el('p',undefined,'policy-source');source.append(link('Läs hela valprogrammet 2026 (PDF) →',c.links.program));$('#area-proposals').after(source);
    if(area.id==='landsbygd'){const rural=el('p',undefined,'policy-source');rural.append(link('Fördjupning: landsbygdsprogrammet från 2023 (Word) →','/program/landsbygdsprogram-2023.docx'));source.after(rural);}
    const relatedArticles=articles.filter(a=>!a.example&&a.areas?.includes(area.id)).slice(0,2);
    if(relatedArticles.length)$('#related-news').append(...relatedArticles.map(a=>articleCard(a,true)));
    else {$('#related-heading').textContent=t.relatedFallback;for(const item of s.areas.filter(a=>a.id!==area.id).slice(0,2)){const card=link('',areaLink(item),'related-policy');card.append(picture(item.image,item.alt),el('div'));card.lastChild.append(el('small','VÅR POLITIK'),el('h3',item.title),el('span','Läs mer →'));$('#related-news').append(card);}}
    $('#area-contact').append(lineIcon('mail'),el('div'));$('#area-contact div').append(el('h3',t.areaQuestion),el('p',t.areaContact),link(t.contactForm,'/kontakt.html','button button-outline'));
  }
  if(page==='about') {
    $('#about-intro').append(...s.about.paragraphs.map(p=>el('p',p)));
    $('#board-heading').textContent=t.boardHeading;
  }
  if(page==='people'||page==='about') await initDirectory(page);
  if(page==='contact') {
    $('#contact-details-heading').textContent=t.detailsHeading;
    for(const item of [{icon:'mail',title:t.emailHeading,text:c.contact.email,href:'mailto:'+c.contact.email},{icon:'phone',title:t.phoneHeading,text:c.contact.phone,href:'tel:'+c.contact.phone.replace(/[^+\d]/g,'')},{icon:'people',title:t.representativesHeading,text:t.representativesDescription,href:'/fortroendevalda.html'}]){const row=el('div',undefined,'contact-detail');const a=el('a',item.text);a.href=item.href;row.append(lineIcon(item.icon),el('div'));row.lastChild.append(el('h3',item.title),a);$('#contact-details').append(row);}
    $('#contact-details').append(el('p',c.contact.address,'contact-address'));
    $('#contact-meet').append(lineIcon('calendar'),el('div'));$('#contact-meet div').append(el('h2',t.meetHeading),el('p',t.meetText),link(t.meetLink,'/#traffa-oss'));
    $('#contact-social').append(el('h2',t.followHeading));
    for (const name of ['facebook','instagram']) { const a=link('',c.links[name],'social-icon');a.setAttribute('aria-label',name==='facebook'?'Facebook':'Instagram');a.append(lineIcon(name));$('#contact-social').append(a); }
    $('#contact-social').append(el('p',t.followText));
  }
}

async function initDirectory(page) {
  const inlineContacts=document.body.dataset.contactDisplay==='inline';
  const t=c.subpages.text;let people=[],filter=new URLSearchParams(location.search).get('filter')||'all',query='',count=4,signature='';
  const status=$('#directory-status');status.textContent=t.directoryLoading;
  const smallBoard=matchMedia('(max-width:760px)');
  const groups=[{id:'board',role:'board',label:'styrelsen',personLabel:'styrelsepersoner',page:0,all:false},{id:'political',role:'political',label:'förtroendevalda',personLabel:'förtroendevalda',page:0,all:false}];
  if(page==='about') {
   for(const group of groups){
    const toolbar=el('div',undefined,'board-toolbar');
    const countLabel=el('p',undefined,'board-count');countLabel.id=group.id+'-count';countLabel.setAttribute('role','status');
    const actions=el('div',undefined,'board-actions');
    const prev=el('button','←','board-arrow'),next=el('button','→','board-arrow'),all=el('button','Visa alla','board-show-all');
    prev.id=group.id+'-prev';next.id=group.id+'-next';all.id=group.id+'-show-all';
    prev.setAttribute('aria-label','Föregående '+group.personLabel);next.setAttribute('aria-label','Nästa '+group.personLabel);
    for(const button of [prev,next,all]){button.type='button';button.setAttribute('aria-controls',group.id+'-grid');}
    all.setAttribute('aria-pressed','false');
    function move(delta){group.page+=delta;render();if(!matchMedia('(prefers-reduced-motion:reduce)').matches)$('#'+group.id+'-grid').animate([{opacity:.35,transform:`translateX(${delta*12}px)`},{opacity:1,transform:'translateX(0)'}],{duration:180,easing:'ease-out'});}
    prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    all.addEventListener('click',()=>{group.all=!group.all;group.page=0;render();});
    smallBoard.addEventListener('change',()=>{group.page=0;render();});
    actions.append(prev,next,all);toolbar.append(countLabel,actions);$('#'+group.id+'-grid').before(toolbar);
    group.controls={prev,next,all,countLabel};
   }
  }
  function card(person,compact=false,roleGroup='board'){
    const article=el('article',undefined,'person-card'+(compact?' compact-person':''));
    const portrait=el('div',undefined,'person-portrait');if(person.image){const img=picture(person.image,person.name);img.addEventListener('error',()=>{if(person.imageThumbnail && img.src!==safeURL(person.imageThumbnail,{image:true})){img.src=safeURL(person.imageThumbnail,{image:true});}else{portrait.replaceChildren(lineIcon('person'),el('span',t.portraitMissing));}});portrait.append(img);}else portrait.append(lineIcon('person'),el('span',t.portraitMissing));article.append(portrait);
    if(page==='about') {
      article.classList.add('board-card');
      const info=el('div',undefined,'board-person-info');
      info.append(el('h3',person.name));
      const assignments=person.roles.filter(r=>r.group===roleGroup);
      const roles=el('ul',undefined,'board-role');
      for(const role of assignments)roles.append(el('li',role.title));
      info.append(el('p',assignments[0]?.title||'','board-card-role'));
      const contacts=el('div',undefined,'board-contacts');
      for(const field of [{key:'email',icon:'mail',label:'E-post',scheme:'mailto:'},{key:'phone',icon:'phone',label:'Telefon',scheme:'tel:'}]){
        const value=person[field.key];const row=el('div',undefined,'board-contact');
        row.append(lineIcon(field.icon));
        if(value){const a=el('a',value);a.href=field.scheme+(field.key==='phone'?value.replace(/[^+\d]/g,''):value);if(field.key==='email'&&value.includes('@')){const split=value.lastIndexOf('@')+1;a.replaceChildren(document.createTextNode(value.slice(0,split)),el('wbr'),document.createTextNode(value.slice(split)));}row.append(a);}
        else row.append(el('span',field.label+' ej publicerad','contact-unavailable'));
        contacts.append(row);
      }
      const more=el('button','Uppdrag & kontakt →','person-open');more.type='button';more.setAttribute('aria-label','Uppdrag och kontakt för '+person.name);
      more.addEventListener('click',()=>{const detail=el('div',undefined,'person-dialog');detail.append(el('h3',roleGroup==='board'?'Uppdrag i styrelsen':'Lokala politiska uppdrag'),roles,contacts);openDialog(person.name,[detail]);});
      info.append(more);article.append(info);return article;
    }
    const details=el('details',undefined,'person-details');const summary=el('summary');summary.append(el('strong',person.name),el('span',person.roles.find(r=>r.group===(page==='about'||filter==='board'?'board':'political'))?.title||person.roles[0].title));details.append(summary);
    const body=el('div',undefined,'person-contact');for(const role of person.roles)body.append(el('p',role.title));
    if(!inlineContacts){
      if(person.email){const a=el('a',t.email);a.href='mailto:'+person.email;body.append(a);}
      if(person.phone){const a=el('a',t.call);a.href='tel:'+person.phone.replace(/[^+\d]/g,'');body.append(a);}
    }
    body.append(link(t.profile,person.profile));details.append(body);article.append(details);
    if(inlineContacts){
      const contacts=el('div',undefined,'person-contact person-contact-inline');
      contacts.append(el('p',person.email||'E-post ej publicerad'),el('p',person.phone||'Telefon ej publicerad'));
      article.append(contacts);
    }
    return article;
  }
  function render(){
    if(page==='about'){
     for(const group of groups){
      const members=people.filter(p=>p.roles.some(r=>r.group===group.role)),size=smallBoard.matches?2:4;
      if(group.role==='political')members.sort((a,b)=>a.name.localeCompare(b.name,'sv'));
      const pages=Math.ceil(members.length/size);group.page=Math.max(0,Math.min(group.page,pages-1));
      const start=group.all?0:group.page*size,end=group.all?members.length:Math.min(start+size,members.length);
      $('#'+group.id+'-grid').replaceChildren(...members.slice(start,end).map(p=>card(p,false,group.role)));
      $('#'+group.id+'-grid').classList.toggle('board-expanded',group.all);
      const controls=group.controls;
      controls.countLabel.textContent=members.length?`${start+1}–${end} av ${members.length}`:'Inga '+group.personLabel+' att visa';
      controls.prev.disabled=group.all||group.page===0;controls.next.disabled=group.all||group.page>=pages-1;
      controls.all.textContent=group.all?'Visa färre':group.role==='board'?'Visa hela styrelsen':'Visa alla förtroendevalda';controls.all.setAttribute('aria-pressed',String(group.all));
      controls.all.hidden=members.length<=size;
     }
      return;
    }
    const fold=v=>v.toLocaleLowerCase('sv-SE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const matches=people.filter(p=>{
      const group=filter==='all'||(filter==='board'&&p.roles.some(r=>r.group==='board'))||(filter==='council'&&p.roles.some(r=>r.group==='political'&&/kommunfullmäktige/i.test(r.title)))||(filter==='committees'&&p.roles.some(r=>r.group==='political'&&!/kommunfullmäktige/i.test(r.title)));
      return group&&fold(p.name+' '+p.roles.map(r=>r.title).join(' ')).includes(fold(query));
    });
    $('#people-grid').replaceChildren(...matches.slice(0,count).map(p=>card(p)));if(!matches.length)$('#people-grid').append(el('p',t.peopleEmpty,'empty-state'));$('#people-more').hidden=count>=matches.length;
  }
  if(page==='people'){
    if(!t.peopleFilters.some(f=>f.id===filter))filter='all';$('#search-label').textContent=t.search;$('#people-search').placeholder=t.search;$('.people-search').prepend(lineIcon('search'));
    $('#people-search').addEventListener('input',e=>{query=e.target.value;count=4;render();});
    for(const item of t.peopleFilters){const b=el('button',item.label);b.setAttribute('aria-pressed',String(item.id===filter));b.addEventListener('click',()=>{filter=item.id;count=4;$('#people-filters').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render();});$('#people-filters').append(b);}
    $('#people-more').textContent=t.peopleMore;$('#people-more').addEventListener('click',()=>{count+=4;render();});
  }
  function accept(data){
    if(!Array.isArray(data.people)||!data.people.length||data.people.length>150)throw new Error('Invalid directory');
    const valid=data.people.filter(p=>typeof p.name==='string'&&Array.isArray(p.roles)&&p.roles.length&&p.roles.every(r=>typeof r.title==='string'&&['board','political'].includes(r.group))&&typeof p.profile==='string'&&p.profile.startsWith('https://kristdemokraterna.se/'));
    if(valid.length!==data.people.length)throw new Error('Invalid directory');
    const next=JSON.stringify(valid);c.directory=data;people=valid;if(next!==signature){signature=next;render();}
    $('#directory-source').replaceChildren(link(t.directorySource,data.source));
  }
  // Immediate saved public content, followed by the actual source; no credentials required.
  try{accept(await fetchJSON('/data/representatives.json'));status.textContent='';}catch{/* Try the API next. */}
  async function update(){try{const data=await fetchJSON('/api/representatives');accept(data);status.textContent=Date.now()-Date.parse(data.checkedAt)>86400000?t.directoryFallback:'';}catch{status.textContent=people.length?t.directoryFallback:'Uppgifterna kan inte visas just nu. Se vår officiella sida.';if(!people.length)$('#directory-source').replaceChildren(link(t.directorySource,c.links.representatives));}}
  await update();setInterval(()=>{if(!document.hidden)update();},300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
}
