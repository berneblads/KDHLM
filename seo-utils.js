export const siteName = 'Kristdemokraterna i Hässleholm';
export const jsonLD = data => JSON.stringify(data).replace(/</g, '\\u003c');
export function description(text, limit = 170) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return clean.slice(0, limit - 1).replace(/\s+\S*$/, '') + '…';
}
export function articleAuthors(article) {
  const authors = article.authors || (article.author ? article.author.split(/,\s*/) : []);
  return authors.map(author => typeof author === 'string' ? { '@type': 'Person', name: author } : { '@type': 'Person', name: author.name, ...(author.url ? { url: author.url } : {}) });
}
export function articleDates(article) {
  // Imported filename dates describe when the text was written, not when this site published it.
  const published = article.publishedAt || (!article.sourceFile ? article.date : undefined);
  return {
    ...(article.sourceFile && article.date ? { dateCreated: article.date } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(article.modified ? { dateModified: article.modified } : {}),
  };
}
