import { publicJSON } from '../server/cache.js';

const safeFacebook = value => { try { const u=new URL(value); return u.protocol==='https:' && (u.hostname==='facebook.com'||u.hostname.endsWith('.facebook.com')) ? u.href : undefined; } catch{return undefined;} };
const safeImage = value => { try { const u=new URL(value); return u.protocol==='https:' && (u.hostname.endsWith('.fbcdn.net')||u.hostname.endsWith('.fbsbx.com')) ? u.href : undefined; } catch{return undefined;} };
export function filterPosts(data, author) {
  return (Array.isArray(data.data)?data.data:[]).filter(p=>typeof p.id==='string'&&(typeof p.message==='string'||p.full_picture)).map(p=>({
    id:p.id.replace(/[^\w-]/g,'_'), author, text:typeof p.message==='string'?p.message.slice(0,15000):'',
    ...(Number.isFinite(Date.parse(p.created_time))?{date:new Date(p.created_time).toISOString()}:{}),
    ...(safeImage(p.full_picture)?{image:safeImage(p.full_picture),alt:''}:{}),
    ...(safeFacebook(p.permalink_url)?{url:safeFacebook(p.permalink_url)}:{}),
  }));
}
export async function GET(request) {
  const env=process.env;
  if (!env.META_PAGE_ID || !env.META_PAGE_ACCESS_TOKEN || !/^v\d+\.0$/.test(env.META_API_VERSION || '') || !env.META_PAGE_NAME || !safeFacebook(env.META_PAGE_URL)) return publicJSON({posts:[],available:false},503);
  if (!/^\d+$/.test(env.META_PAGE_ID)) return publicJSON({posts:[],available:false},503);
  const after = new URL(request.url).searchParams.get('after');
  if (after && (!/^[a-zA-Z0-9_=-]+$/.test(after) || after.length>2000)) return publicJSON({posts:[]},400);
  try {
    const url=new URL(`https://graph.facebook.com/${env.META_API_VERSION}/${env.META_PAGE_ID}/published_posts`);
    url.searchParams.set('fields','id,message,created_time,full_picture,permalink_url'); url.searchParams.set('limit','3'); if(after)url.searchParams.set('after',after);
    const response=await fetch(url,{headers:{Authorization:`Bearer ${env.META_PAGE_ACCESS_TOKEN}`},signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('Facebook unavailable'); const data=await response.json(); if(data.error)throw new Error('Facebook unavailable');
    // Never forward Graph's next URL: it can contain the access token.
    const cursor=data.paging?.next && data.paging?.cursors?.after;
    return publicJSON({posts:filterPosts(data,env.META_PAGE_NAME),next:typeof cursor==='string'&&/^[a-zA-Z0-9_=-]{1,2000}$/.test(cursor)?cursor:null,pageURL:env.META_PAGE_URL});
  } catch { console.error('Facebook feed unavailable'); return publicJSON({posts:[],available:false},503); }
}
