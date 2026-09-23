// Durable REST Redis cache. Only the filtered public payload is stored, never the workbook.
export function cacheConfigured(env = process.env) { return Boolean(env.CACHE_REST_URL && env.CACHE_REST_TOKEN); }
export async function cacheCommand(command, env = process.env) {
  const url = new URL(env.CACHE_REST_URL);
  if (url.protocol !== 'https:') throw new Error('HTTPS required');
  const response = await fetch(url, { method:'POST', headers:{Authorization:`Bearer ${env.CACHE_REST_TOKEN}`,'Content-Type':'application/json'}, body:JSON.stringify(command),signal:AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Cache unavailable');
  const payload = await response.json(); if (payload.error) throw new Error('Cache unavailable');
  return payload.result;
}
export async function readCache(key) { const value = await cacheCommand(['GET',key]); return value ? JSON.parse(value) : null; }
export async function writeCache(key, value) { await cacheCommand(['SET',key,JSON.stringify(value)]); }
export const publicJSON = (body, status = 200) => Response.json(body, {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
