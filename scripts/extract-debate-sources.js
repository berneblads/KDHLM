import { readdir, readFile, writeFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { SaxesParser } from 'saxes';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const sources = [];
for (const file of (await readdir('artiklar')).filter(name => /\.(docx|pdf)$/i.test(name))) {
  const buffer = await readFile(`artiklar/${file}`);
  const paragraphs = [];
  let metadata = '';
  if (file.endsWith('.docx')) {
    const zip = await JSZip.loadAsync(buffer);
    const parser = new SaxesParser();
    let paragraph = '', inText = false;
    parser.on('opentag', tag => {
      if (tag.name === 'w:p') paragraph = '';
      if (tag.name === 'w:t') inText = true;
      if (tag.name === 'w:tab' || tag.name === 'w:br') paragraph += ' ';
    });
    parser.on('text', text => { if (inText) paragraph += text; });
    parser.on('closetag', tag => {
      if (tag.name === 'w:t') inText = false;
      if (tag.name === 'w:p' && paragraph.trim()) paragraphs.push(paragraph.trim());
    });
    parser.write(await zip.file('word/document.xml').async('string')).close();
    metadata = zip.file('docProps/core.xml') ? await zip.file('docProps/core.xml').async('string') : '';
  } else {
    const task = getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
    const pdf = await task.promise;
    metadata = JSON.stringify((await pdf.getMetadata()).info);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      let line = '';
      for (const item of text.items) {
        if (!('str' in item)) continue;
        line += item.str;
        if (item.hasEOL) { if (line.trim()) paragraphs.push(line.trim()); line = ''; }
        else line += ' ';
      }
      if (line.trim()) paragraphs.push(line.trim());
    }
    await task.destroy();
  }
  sources.push({ file, paragraphs, metadata });
}
await writeFile('artifacts/debate-sources.json', JSON.stringify(sources, null, 2));
for (const source of sources) console.log(JSON.stringify({ file: source.file, paragraphs: source.paragraphs.length, start: source.paragraphs.slice(0, 3), end: source.paragraphs.slice(-3) }));
