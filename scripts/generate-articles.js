import {readFile,writeFile,mkdir,copyFile,unlink,readdir,rename} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {basename,resolve,sep} from 'node:path';
import {articlePath,publishedArticles} from '../article-utils.js';
import {siteName,description,articleAuthors,articleDates,jsonLD} from '../seo-utils.js';
import {withArticleImage} from '../article-images.js';

export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderArticle(article,{siteURL,image,header,footer}) {
  const e=escapeHTML,url=new URL(articlePath(article),siteURL).href;
  const authors=articleAuthors(article),summary=description(article.intro);
  const schema={'@context':'https://schema.org','@type':'Article','@id':url+'#article',url,headline:article.title,description:summary,mainEntityOfPage:url,inLanguage:'sv-SE',articleSection:article.category,image:new URL(image,siteURL).href,...(authors.length?{author:authors}:{}),publisher:{'@type':'Organization','@id':siteURL+'/#organization',name:siteName,url:siteURL},...articleDates(article)};
  const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Startsida',item:siteURL+'/'},{'@type':'ListItem',position:2,name:'Aktuellt',item:siteURL+'/aktuellt.html'},{'@type':'ListItem',position:3,name:article.title,item:url}]};
  return `<!doctype html>
<html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(article.title)} – KD Hässleholm</title><meta name="description" content="${e(summary)}">
<meta name="robots" content="${article.example?'noindex,follow':'index,follow,max-image-preview:large'}"><link rel="canonical" href="${e(url)}">
<meta property="og:type" content="article"><meta property="og:locale" content="sv_SE"><meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${e(article.title)}"><meta property="og:description" content="${e(summary)}"><meta property="og:url" content="${e(url)}"><meta property="og:image" content="${e(new URL(image,siteURL).href)}"><meta property="og:image:alt" content="${e(article.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#005EA1">
${article.example?'':`<script type="application/ld+json">${jsonLD(schema)}</script><script type="application/ld+json">${jsonLD(breadcrumb)}</script>`}
<link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script><link rel="icon" type="image/svg+xml" href="/favicon.svg"></head>
<body class="subpage article-page"><a class="skip-link" href="#main">Hoppa till innehållet</a>${header}
<main id="main"><article class="article-content container">
<nav class="article-breadcrumbs" aria-label="Brödsmulor"><a href="/">Startsida</a> / <a href="/aktuellt.html">Aktuellt</a></nav>
<header class="article-heading"><p class="article-category">${e(article.category)}</p><h1>${e(article.title)}</h1>
${article.example?'<p class="article-example">Exempelartikel – visar sidans utformning och är inte en publicerad nyhet.</p>':''}
<div class="article-meta">${article.date?`<time datetime="${e(article.date)}">${article.sourceFile?'Skriven ':''}${e(new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Stockholm'}).format(new Date(article.date)))}</time>`:''}${authors.length?`<span>Av ${e(authors.map(a=>a.name).join(', '))}</span>`:''}${article.modified?`<time datetime="${e(article.modified)}">Uppdaterad ${e(article.modified.slice(0,10))}</time>`:''}</div>
<p class="article-lead">${e(article.intro)}</p></header>
<figure class="article-cover"><div class="article-cover-image${article.category==='Debatt'?' debate-image':''}"><img src="${e(image)}" alt="${e(article.alt)}" fetchpriority="high"></div>${article.caption?`<figcaption>${e(article.caption)}</figcaption>`:''}</figure>
<div class="article-body">${article.paragraphs.map(p=>`<p>${e(p)}</p>`).join('\n')}</div>
${article.signatures?.length?`<div class="article-signatures">${article.signatures.map(s=>`<p>${e(s)}</p>`).join('')}</div>`:''}
${article.category==='Debatt'?'<p class="article-debate-return"><a href="/aktuellt.html#debatt">← Fler debattartiklar</a></p>':''}
<nav class="article-return" aria-label="Fortsätt läsa"><a class="button button-outline" href="/aktuellt.html">← Alla artiklar</a><a href="/">Till startsidan</a></nav>
</article></main>${footer}<dialog id="info-dialog"><button id="dialog-close" class="dialog-close" aria-label="Stäng">×</button><h2 id="dialog-title"></h2><div id="dialog-body"></div></dialog></body></html>`;
}

export async function loadSiteContent() {
  const c=(await import(new URL(`../content.js?articles=${Date.now()}`,import.meta.url))).siteContent;
  const {debateArticles}=await import(new URL(`../debate-articles.js?articles=${Date.now()}`,import.meta.url));
  c.subpages.articles=[...c.subpages.articles.filter(a=>!a.sourceFile),...debateArticles.map(a=>withArticleImage({...a,image:new URL('../assets/'+a.image,import.meta.url).href}))];
  return c;
}
export async function generateArticlePages({root=fileURLToPath(new URL('../',import.meta.url)),content}={}) {
  const c=content||await loadSiteContent();
  const source=await readFile(resolve(root,'aktuellt.html'),'utf8');
  const nav=items=>items.map(item=>`<a${item.primary?' class="button"':''} href="${escapeHTML(item.href||c.links[item.link])}">${escapeHTML(item.label)}</a>`).join('');
  const header=source.match(/<header class="site-header">[\s\S]*?<\/header>/)[0].replace('<nav id="navigation" aria-label="Huvudmeny"></nav>',`<nav id="navigation" aria-label="Huvudmeny">${nav(c.navigation)}</nav>`);
  const footer=source.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0].replace('<nav id="footer-navigation" aria-label="Sidfotsmeny"></nav>',`<nav id="footer-navigation" aria-label="Sidfotsmeny">${nav(c.footerNavigation)}</nav>`);
  const published=publishedArticles(c.subpages.articles),articles=[...published,...c.subpages.exampleArticles.map(a=>({...a,example:true}))];
  const directory=resolve(root,'artiklar');await mkdir(directory,{recursive:true});await mkdir(resolve(root,'public/article-media'),{recursive:true});
  const manifest=resolve(directory,'.generated.json');let old=[];try{old=JSON.parse(await readFile(manifest,'utf8'));}catch{}
  const files=[],seen=new Set();
  for(const article of articles){
    const path=articlePath(article),filename=basename(path);if(seen.has(path))throw new Error('Duplicate article URL: '+path);seen.add(path);
    if(!article.title||!article.intro||!Array.isArray(article.paragraphs)||!article.paragraphs.length)throw new Error('Incomplete article: '+path);
    let image=article.image;
    if(image.startsWith('file:')){
      const local=fileURLToPath(image);if(!local.startsWith(resolve(root,'assets')+sep))throw new Error('Article image outside assets');
      const name=basename(local);await copyFile(local,resolve(root,'public/article-media',name));image='/article-media/'+name;
    }
    if(!image.startsWith('/')&&!image.startsWith('https://'))throw new Error('Invalid article image');
    await writeFile(resolve(directory,filename),renderArticle(article,{siteURL:c.siteURL,image,header,footer}));files.push(filename);
  }
  for(const filename of old){if(!files.includes(filename)&&/^[a-z0-9-]+\.html$/.test(filename))await unlink(resolve(directory,filename)).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  await writeFile(manifest,JSON.stringify(files));
  // Keep client cards in sync with this build; a scheduled date alone cannot create a static page.
  await writeFile(resolve(root,'generated-articles.js'),`// Generated by scripts/generate-articles.js\nexport const generatedArticlePaths = ${JSON.stringify([...seen])};\n`);
  const sitemapPath=resolve(root,'public/sitemap.xml');
  const pages=[];
  for(const name of (await readdir(root)).filter(name=>name.endsWith('.html'))){const html=await readFile(resolve(root,name),'utf8');if(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html))pages.push(name);}
  let sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(name=>`  <url><loc>${escapeHTML(new URL(name==='index.html'?'/':'/'+name,c.siteURL).href)}</loc></url>`).join('\n')+'\n</urlset>';
  sitemap=sitemap.replace(/\s*<\/urlset>/, '\n'+published.map(a=>{const dates=articleDates(a),changed=dates.dateModified||dates.datePublished;return `  <url><loc>${escapeHTML(new URL(articlePath(a),c.siteURL).href)}</loc>${changed?`<lastmod>${escapeHTML(changed)}</lastmod>`:''}</url>`;}).join('\n')+'\n</urlset>');
  const sitemapTemp=sitemapPath+'.'+randomUUID()+'.tmp';await writeFile(sitemapTemp,sitemap);await rename(sitemapTemp,sitemapPath);
  if(!content)await writeFile(resolve(root,'public/robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL('/sitemap.xml',c.siteURL).href}\n`);
  return files.map(name=>resolve(directory,name));
}
