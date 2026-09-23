import { createHash } from 'node:crypto';
import { downloadCalendar } from '../server/calendar.js';
import { cacheConfigured, readCache, writeCache, publicJSON } from '../server/cache.js';
const configured = () => ['MS_TENANT_ID','MS_CLIENT_ID','MS_CLIENT_SECRET','MS_DRIVE_ID','MS_ITEM_ID'].every(k=>Boolean(process.env[k])) && cacheConfigured();

export async function GET() {
  if (!configured()) return publicJSON({events:[], available:false},503);
  const key = 'kd:calendar:v1:' + createHash('sha256').update([process.env.MS_TENANT_ID,process.env.MS_DRIVE_ID,process.env.MS_ITEM_ID,process.env.MS_SHEET_NAME || 'Kalender'].join(':')).digest('hex').slice(0,24);
  let previous;
  try {
    previous = await readCache(key);
    if (previous && Date.now()-previous.fetchedAt < 300000) return publicJSON({events:previous.events});
    const {events,rejected} = await downloadCalendar();
    if (rejected) console.warn('Calendar: invalid published rows skipped', {count:rejected});
    // An entirely invalid published dataset must not replace the last good snapshot.
    if (rejected && !events.length) throw new Error('Invalid dataset');
    await writeCache(key,{events,fetchedAt:Date.now()});
    return publicJSON({events});
  } catch {
    console.error('Calendar refresh unavailable');
    return previous ? publicJSON({events:previous.events}) : publicJSON({events:[],available:false},503);
  }
}
