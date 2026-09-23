import { readFile, writeFile } from 'node:fs/promises';

const sources = JSON.parse(await readFile('artifacts/debate-sources.json', 'utf8'));
const slug = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const names = ['Simon Berneblad Mandegård', 'Pär Palmgren', 'Elias Höghäll', 'Tobias Eriksson', 'Margaretha Lindquist', 'Erika Heil Utbult', 'Birgitta Södertun', 'Christer Caesar', 'Gilbert Nathell', 'Mats Björklund', 'Martin Hallander', 'Hanna Nilsson', 'Daneil Kronqvist'];
const report = { imported: [], omitted: [] };
const articles = [];
for (const source of sources) {
  const date = source.file.match(/^26(\d{2})(\d{2})/);
  let reason = !date ? 'Saknar datum från 2026 i filnamnet.' : source.file.startsWith('260528') ? 'Ofärdiga undertecknare: XX Från Kristianstad/Hässleholm.' : /^(260512|260819)/.test(source.file) && !source.file.includes('(1)') ? 'Alternativ version. Versionen med (1) används tills vidare; originalet bevaras.' : '';
  if (reason) { report.omitted.push({ file: source.file, reason }); continue; }
  let paragraphs = source.paragraphs.map(p => p.replace(/\s+/g, ' ').trim());
  if (source.file.startsWith('260729')) {
    // Paragraph boundaries checked against the PDF's line positions, including its page break.
    const starts = [0, 1, 7, 12, 13, 17, 22, 29, 33, 38, 41, 45, 48, 50, 52, 54];
    paragraphs = starts.slice(0, -1).map((start, i) => paragraphs.slice(start, starts[i + 1]).join(' '));
  }
  const title = source.file.startsWith('260821') ? 'Till dig som sitter ensam hemma – vi ser dig' : paragraphs.shift().replace(/\.$/, '').replace('bidragtill', 'bidrag till');
  const signatures = [];
  while (paragraphs.length) {
    const last = paragraphs.at(-1);
    const authorAt = names.map(name => last.indexOf(name + ' (')).filter(i => i >= 0).sort((a,b) => a-b)[0];
    if (authorAt === undefined && last !== 'Kristdemokraterna') break;
    paragraphs.pop();
    if (authorAt > 0) { signatures.unshift(last.slice(authorAt)); paragraphs.push(last.slice(0, authorAt).trim()); break; }
    signatures.unshift(last);
  }
  const author = names.filter(name => signatures.some(s => s.includes(name))).sort((a,b) => signatures.join(' ').indexOf(a)-signatures.join(' ').indexOf(b)).join(', ');
  const intro = paragraphs.shift();
  const culture = /Folkbildnings|Vänstern|simhall|M kallar/.test(title);
  const travel = /natttrafik|Markarydsbanan/.test(title);
  const image = culture ? 'Kulturhuset_.jpg' : travel ? 'Centrala Hässleholm.jpg' : 'avenyn.jpg';
  const alt = culture ? 'Kulturhuset i Hässleholm' : travel ? 'Centrala Hässleholm med centralstationen' : 'Avenyn i Hässleholm';
  const article = { id: slug(title), category: 'Debatt', published: true, date: `2026-${date[1]}-${date[2]}`, title, intro, author, signatures, image, alt, caption: `Illustrationsbild: ${alt}.`, paragraphs, sourceFile: source.file };
  articles.push(article);
  report.imported.push({ file: source.file, title, date: article.date, author: author || null });
}
articles.sort((a,b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title,'sv'));
if (new Set(articles.map(a => a.id)).size !== articles.length) throw new Error('Duplicate article slug');
await writeFile('debate-articles.js', '// Imported from local editorial documents. See artifacts/debate-import-report.json.\nexport const debateArticles = ' + JSON.stringify(articles, null, 2) + ';\n');
await writeFile('artifacts/debate-import-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ imported: articles.length, omitted: report.omitted },null,2));
