import snapshot from '../public/data/representatives.json' with {type:'json'};
import { fetchDirectory } from '../server/representatives.js';
import { cacheConfigured, readCache, writeCache } from '../server/cache.js';
let latest=snapshot, lastAttempt=0, pending;
const key='kd:official-directory:v2';
async function refresh() {
  try {
    if(cacheConfigured()) { const cached=await readCache(key);if(cached?.people?.length){latest=cached;if(Date.now()-Date.parse(cached.checkedAt)<300000)return;} }
    latest=await fetchDirectory();
    if(cacheConfigured())await writeCache(key,latest);
  } catch { console.warn('Official directory refresh unavailable; retaining last successful snapshot'); }
}
export async function GET() {
  if(Date.now()-lastAttempt>=300000) { lastAttempt=Date.now();pending=refresh().finally(()=>{pending=null;}); }
  if(pending)await pending;
  return Response.json(latest,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
