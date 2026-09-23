// Encode generated source assets as WebP without altering their composition.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  for (const name of process.argv.slice(2)) {
    if (!/^[a-z-]+$/.test(name)) throw new Error('Invalid image name');
    const source = await readFile(`artifacts/design-sources/mockup-${name}.png`);
    const encoded = await page.evaluate(async data => {
      const image = new Image(); image.src = data; await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      return canvas.toDataURL('image/webp', .86).split(',')[1];
    }, `data:image/png;base64,${source.toString('base64')}`);
    const output = Buffer.from(encoded, 'base64');
    await writeFile(`assets/mockup-${name}.webp`, output);
    console.log(`${name}: ${Math.round(source.length / 1024)} KB → ${Math.round(output.length / 1024)} KB`);
  }
} finally { await browser.close(); }
