import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { articleImages } from '../article-images.js';

export async function prepareArticleImages() {
  const selectionsInfo = await stat(new URL('../article-images.js', import.meta.url));
  await mkdir(new URL('../public/article-media/', import.meta.url), { recursive: true });
  for (const selection of Object.values(articleImages)) {
    const source = new URL('../assets/' + selection.source, import.meta.url);
    const target = new URL('../public' + selection.image, import.meta.url);
    const sourceInfo = await stat(source);
    const targetInfo = await stat(target).catch(() => null);
    if (targetInfo?.mtimeMs >= Math.max(sourceInfo.mtimeMs, selectionsInfo.mtimeMs)) continue;
    const image = await loadImage(fileURLToPath(source));
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = createCanvas(Math.round(image.width * scale), Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    await writeFile(target, await canvas.encode('webp', 80));
  }
}
