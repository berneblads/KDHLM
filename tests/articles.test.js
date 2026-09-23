import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {articlePath,publishedArticles} from '../article-utils.js';
import {renderArticle,generateArticlePages} from '../scripts/generate-articles.js';
const article={id:'stable-id',slug:'en-lokal-nyhet',published:true,title:'En lokal nyhet',category:'Nyheter',intro:'En ingress.',image:'https://example.com/photo.jpg',alt:'Bild',date:'2026-01-01',paragraphs:['Första stycket.','Andra stycket.']};
test('URLs are stable and drafts, future dates and invalid dates are excluded',()=>{
  assert.equal(articlePath(article),'/artiklar/en-lokal-nyhet.html');assert.equal(articlePath({...article,title:'Ny rubrik'}),articlePath(article));
  assert.throws(()=>articlePath({id:'../../escape'}));
  assert.deepEqual(publishedArticles([article,{...article,published:false},{...article,date:'invalid'},{...article,date:'2999-01-01'}]),[article]);
});
test('article text, canonical and structured data are present in raw HTML with safe escaping',()=>{
  const html=renderArticle({...article,title:'<script>alert(1)</script>',paragraphs:['<img src=x onerror=alert(1)>']},{siteURL:'https://kdhlm.se',image:article.image,header:'',footer:''});
  assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img src=x/);assert.doesNotMatch(html,/<img src=x/);
  assert.match(html,/rel="canonical" href="https:\/\/kdhlm.se\/artiklar\/en-lokal-nyhet.html"/);
  const data=JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(data['@type'],'Article');assert.equal(data.datePublished,article.date);
});
test('generation includes published URLs in sitemap, excludes examples, and removes withdrawn generated pages',async()=>{
  const root=await mkdtemp(join(tmpdir(),'kd-articles-test-'));
  try{
    await mkdir(join(root,'public'));await writeFile(join(root,'public/sitemap.xml'),'<urlset><url><loc>https://kdhlm.se/</loc></url></urlset>');
    await writeFile(join(root,'aktuellt.html'),'<header class="site-header"></header><footer class="site-footer"></footer>');
    const content={siteURL:'https://kdhlm.se',navigation:[],footerNavigation:[],links:{},subpages:{articles:[article,{...article,id:'draft',slug:'draft',published:false}],exampleArticles:[{...article,id:'example',slug:'example'}]}};
    await generateArticlePages({root,content});
    assert.match(await readFile(join(root,'artiklar/en-lokal-nyhet.html'),'utf8'),/Första stycket/);
    assert.match(await readFile(join(root,'artiklar/example.html'),'utf8'),/noindex,follow/);
    const sitemap=await readFile(join(root,'public/sitemap.xml'),'utf8');assert.match(sitemap,/en-lokal-nyhet.html/);assert.doesNotMatch(sitemap,/example.html|draft.html/);
    const manifest=await readFile(join(root,'generated-articles.js'),'utf8');assert.match(manifest,/en-lokal-nyhet.html/);assert.doesNotMatch(manifest,/draft.html/);
    content.subpages.articles=[];await generateArticlePages({root,content});
    await assert.rejects(readFile(join(root,'artiklar/en-lokal-nyhet.html')), {code:'ENOENT'});
    assert.doesNotMatch(await readFile(join(root,'public/sitemap.xml'),'utf8'),/en-lokal-nyhet/);
  }finally{await rm(root,{recursive:true,force:true});}
});
