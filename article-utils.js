export function articlePath(article) {
  const slug=article.slug||article.id;
  if(typeof slug!=='string'||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Article requires a stable lowercase slug or id');
  return `/artiklar/${slug}.html`;
}
export function publishedArticles(articles,now=Date.now()) {
  return articles.filter(a=>a.published===true&&(!a.date||(Number.isFinite(Date.parse(a.date))&&Date.parse(a.date)<=now)));
}
