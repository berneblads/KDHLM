import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { createCanvas, loadImage } from '@napi-rs/canvas';
const files = (await readdir('assets/Stock', { recursive: true })).filter(name => /\.(jpe?g|png|webp)$/i.test(name)).sort();
await mkdir('artifacts/stock-review', { recursive: true });
await writeFile('artifacts/stock-review/files.json', JSON.stringify(files, null, 2));
for (let start = 0; start < files.length; start += 36) {
  const canvas = createCanvas(1440, 1200), ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let j = 0; j < Math.min(36, files.length - start); j++) {
    const index = start + j, x = (j % 6) * 240, y = Math.floor(j / 6) * 200;
    try {
      const img = await loadImage('assets/Stock/' + files[index]);
      const scale = Math.min(232 / img.width, 158 / img.height);
      ctx.drawImage(img, x + (240-img.width*scale)/2, y, img.width*scale, img.height*scale);
    } catch { /* Broken or unsupported files remain labelled for review. */ }
    ctx.fillStyle = '#111'; ctx.font = '14px Arial';
    ctx.fillText(String(index) + ': ' + files[index].replaceAll('\\', '/').slice(0, 29), x + 4, y + 174);
    ctx.fillText(files[index].replaceAll('\\', '/').slice(29, 62), x + 4, y + 191);
  }
  const path = `artifacts/stock-review/sheet-${start/36}.jpg`;
  await writeFile(path, canvas.toBuffer('image/jpeg', 80));
  console.log(path);
}
