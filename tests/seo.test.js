import test from 'node:test';
import assert from 'node:assert/strict';
import { articleAuthors, articleDates, description, jsonLD } from '../seo-utils.js';
import { renderSEOPage } from '../scripts/seo-pages.js';
import { siteContent } from '../content.js';

test('coauthors are separate people and missing authors are not invented', () => {
  assert.deepEqual(articleAuthors({author:'Anna Andersson, Erik Eriksson'}).map(a=>a.name),['Anna Andersson','Erik Eriksson']);
  assert.deepEqual(articleAuthors({}),[]);
});
test('filename dates never pretend to be website publication dates', () => {
  assert.deepEqual(articleDates({sourceFile:'260101.docx',date:'2026-01-01'}),{dateCreated:'2026-01-01'});
  assert.deepEqual(articleDates({sourceFile:'260101.docx',date:'2026-01-01',publishedAt:'2026-09-23',modified:'2026-09-24'}),{dateCreated:'2026-01-01',datePublished:'2026-09-23',dateModified:'2026-09-24'});
});
test('metadata remains bounded and script-safe', () => {
  assert.ok(description('Ett långt ord '.repeat(100)).length<=170);
  assert.ok(!jsonLD({text:'</script><img src=x>'}).includes('<'));
});
test('static archive excludes drafts and future articles and escapes content', () => {
  const article={id:'synlig',date:'2026-01-01',published:true,title:'<script>unsafe</script>',intro:'Ingress',category:'Debatt',image:'/image.jpg',alt:'Bild'};
  const content={...siteContent,subpages:{...siteContent.subpages,articles:[article,{...article,id:'utkast',published:false},{...article,id:'framtida',date:'2999-01-01'}]}};
  const input='<html><head><title>Aktuellt</title></head><body data-page="news"><div id="news-grid" class="news-grid"></div></body></html>';
  const output=renderSEOPage(input,'/aktuellt.html',content);
  assert.match(output,/\/artiklar\/synlig.html/);assert.doesNotMatch(output,/utkast.html|framtida.html|<script>unsafe/);
  assert.match(output,/&lt;script&gt;unsafe/);
});
