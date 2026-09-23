export const DIRECTORY_SOURCE = 'https://kristdemokraterna.se/vart-parti/foretradare/kd-lokalt/skane/hassleholm';
const origin = new URL(DIRECTORY_SOURCE).origin;
const plain = (v, limit=200) => typeof v === 'string' ? v.replace(/\s+/g,' ').trim().slice(0,limit) : '';
const portraitCache=new Map();
export function parseProfilePortrait(html,id) {
  if(typeof html!=='string'||html.length>5_000_000)return null;
  for(const match of html.matchAll(/<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const {item}=JSON.parse(match[1]);
      if(String(item?.persIdnr)!==String(id)||item.hideUserImage!==false||typeof item.userImage!=='string')continue;
      const url=new URL(item.userImage,origin);
      if(url.origin===origin&&url.pathname.startsWith('/images/')&&!url.username&&!url.password)return url.href;
    } catch { /* Only read the matching public profile data. */ }
  }
  return null;
}
export function parseDirectory(html) {
  if (typeof html !== 'string' || html.length > 5_000_000) throw new Error('Invalid directory response');
  let data;
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {const value=JSON.parse(match[1]);if(value.items?.organizatorialAssignments && value.items?.politicalAssignments && value.district==='Hässleholm') { data=value; break; }} catch { /* Ignore unrelated script data; never execute it. */ }
  }
  if (!data || !Array.isArray(data.items.organizatorialAssignments) || !Array.isArray(data.items.politicalAssignments) || !data.items.organizatorialAssignments.length) throw new Error('Directory schema changed');
  const people = new Map();
  for (const [key,roleKey,group] of [['organizatorialAssignments','organizationalAssignments','board'],['politicalAssignments','politicalAssignments','political']]) {
    for (const person of data.items[key]) {
      const id=String(person.persIdnr),name=plain(`${person.firstName || ''} ${person.lastName || ''}`);
      // Local political assignments are repeated in the public source data; retain each distinct role once.
      const titles=group==='political'?[...new Set((person[roleKey]||[]).map(r=>plain(r.assignmentName)).filter(Boolean))]:[plain(person[roleKey]?.[0]?.assignmentName)];
      const title=titles[0];
      if(!/^\d{1,12}$/.test(id)||!name||!title)throw new Error('Invalid public person');
      let image=null;
      if(typeof person.avatar==='string') { const url=new URL(person.avatar,origin);if(url.origin===origin && url.pathname.startsWith('/images/'))image=url.href; }
      const email=plain(person.email),phone=plain(person.phoneNumber,40);
      const current=people.get(id)||{id,name,roles:[],image,profile:`${origin}/vart-parti/foretradare/foretradare/foretradare?id=${id}`,...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?{email}:{}),...(/^[+\d\s()-]{5,40}$/.test(phone)?{phone}:{})};
      for(const title of titles)if(!current.roles.some(r=>r.group===group && r.title===title))current.roles.push({group,title});
      people.set(id,current);
    }
  }
  if(people.size>150)throw new Error('Unexpected directory size');
  return {source:DIRECTORY_SOURCE,checkedAt:new Date().toISOString(),people:[...people.values()]};
}
export async function fetchDirectory(fetcher=fetch) {
  const response=await fetcher(DIRECTORY_SOURCE,{headers:{Accept:'text/html'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error('Directory unavailable');
  const directory=parseDirectory(await response.text());
  const queue=directory.people.filter(person=>person.image);
  await Promise.all(Array.from({length:Math.min(4,queue.length)},async()=>{
    while(queue.length){
      const person=queue.shift(),thumbnail=person.image,cached=portraitCache.get(thumbnail);
      let image=cached?.image;
      if(!cached||Date.now()-cached.at>86400000){
        try {
          const profile=await fetcher(person.profile,{headers:{Accept:'text/html'},signal:AbortSignal.timeout(4000)});
          if(profile.ok){image=parseProfilePortrait(await profile.text(),person.id)||image;if(image)portraitCache.set(thumbnail,{image,at:Date.now()});}
        }catch{ /* Retain the last verified image or the directory thumbnail. */ }
      }
      if(image){person.imageThumbnail=thumbnail;person.image=image;}
    }
  }));
  return directory;
}
