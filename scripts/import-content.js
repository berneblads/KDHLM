// One-time, literal-only extraction. Never executes downloaded JavaScript.
import { parseExpressionAt } from 'acorn';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
const raw = await readFile('scripts/source-site.txt', 'utf8');
const start = raw.indexOf('window.siteContent=') + 'window.siteContent='.length;
function literal(node) {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;
  if (node.type === 'ArrayExpression') return node.elements.map(literal);
  if (node.type === 'ObjectExpression') return Object.fromEntries(node.properties.map(p => [p.key.name ?? p.key.value, literal(p.value)]));
  throw new Error('Non-literal source rejected');
}
const source = literal(parseExpressionAt(raw, start, { ecmaVersion: 'latest' }));
await writeFile('scripts/imported-politics.json', JSON.stringify({ topics: source.topics, candidates: source.candidatesSection.candidates, national: source.nationalProposals }, null, 2));
await mkdir('assets/fonts', { recursive: true });
for (const [family, weights, style] of [['barlow', [400, 500, 600, 700], 'normal'], ['barlow-condensed', [600, 700, 800], 'normal'], ['lora', [400], 'italic']]) {
  for (const weight of weights) {
    const name = `${family}-latin-${weight}-${style}.woff2`;
    await copyFile(`node_modules/@fontsource/${family}/files/${name}`, `assets/fonts/${name}`);
  }
  await copyFile(`node_modules/@fontsource/${family}/LICENSE`, `assets/fonts/${family}-LICENSE.txt`);
}
console.log('Imported', source.topics.length, 'policy areas and', source.candidatesSection.candidates.length, 'candidates.');
