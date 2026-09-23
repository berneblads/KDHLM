// One-time editorial selection from the visually reviewed stock contact sheets.
import { readFile, writeFile } from 'node:fs/promises';
import { debateArticles } from '../debate-articles.js';
const files = JSON.parse(await readFile('artifacts/stock-review/files.json', 'utf8'));
const choices = [
  [400, 'Äldre par med kaffekoppar vid en gemensam fikastund.'],
  [98, 'Person som simmar utomhus.'],
  [406, 'Äldre person som pratar i telefon.'],
  [362, 'Stetoskop på grönt vårdtyg.'],
  [214, 'Hand som skriver med penna på papper.'],
  [101, 'Två händer som håller ett hjärta.'],
  [319, 'Skylt för Studiefrämjandet i Hässleholm.'],
  [77, 'Tom gungbräda på en lekplats i kvällsljus.'],
  [231, 'Tomt klassrum med bord och stolar.'],
  [398, 'Omsorgspersonal håller en äldre persons händer.'],
  [396, 'Vårdpersonal och äldre kvinna i samtal.'],
  [191, 'Fotbollsplan upplyst av strålkastare på kvällen.'],
  [304, 'Stadsmiljö i Hässleholm med kyrkan i fonden.'],
  [264, 'Rött hus i grönskande landsbygdsmiljö.'],
  [397, 'Yngre kvinna omfamnar en äldre kvinna.'],
  [268, 'Lila Pågatåg på järnvägsspår.'],
  [401, 'Läkare håller en äldre patients hand.'],
  [403, 'Läkare och äldre patient vid ett vårdsamtal.'],
  [70, 'Händer som arbetar med ekonomiska underlag och miniräknare.'],
  [305, 'Gata och bebyggelse i centrala Hässleholm.'],
  [368, 'En hand håller en äldre persons hand.'],
  [404, 'Omsorgspersonal hjälper en äldre person.'],
  [258, 'Riksdagshuset i Stockholm.'],
  [91, 'Skylt med texten Här kan du rösta utanför en byggnad.'],
  [270, 'Öppen dörr till en buss.'],
];
const selections = Object.fromEntries(debateArticles.map((a, i) => {
  const [index, alt] = choices[i];
  return [a.id, { source: 'Stock/' + files[index].replaceAll('\\', '/'), image: '/article-media/stock-' + a.id + '.webp', alt, caption: 'Illustrationsbild. ' + alt }];
}));
await writeFile('article-images.js', '// Editorial image choices; originals remain in assets/Stock.\nexport const articleImages = ' + JSON.stringify(selections, null, 2) + ';\n\nexport function withArticleImage(article) {\n  const selected = articleImages[article.id];\n  if (!selected) return article;\n  const { source, ...image } = selected;\n  return { ...article, ...image };\n}\n');
