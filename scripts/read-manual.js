import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile } from 'node:fs/promises';
const pdf = await getDocument({ data: new Uint8Array(await readFile('scripts/KD_Grafisk_Manual.pdf')), useSystemFonts: true }).promise;
let text = '';
for (let n = 1; n <= pdf.numPages; n++) {
  const p = await pdf.getPage(n);
  text += `\nPAGE ${n}\n` + (await p.getTextContent()).items.map(i => i.str).join(' ');
}
await writeFile('scripts/manual-notes.txt', text);
console.log(text);
