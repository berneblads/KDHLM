import ExcelJS from 'exceljs';
import { DateTime } from 'luxon';

export const HEADERS = ['id','rubrik','startdatum','starttid','slutdatum','sluttid','plats','adress','beskrivning','status','publicera'];
const text = (value, limit = 5000) => typeof value === 'string' ? value.trim().slice(0, limit) : typeof value === 'number' ? String(value) : '';
const isPublished = value => value === true || value === 1 || ['ja','true','1'].includes(text(value).toLowerCase());
function excelDate(value, date1904) {
  if (value instanceof Date) return value.toISOString().slice(0,10);
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 30) + Math.floor(value)*86400000).toISOString().slice(0,10);
  return text(value);
}
function excelTime(value) {
  if (value instanceof Date) return value.toISOString().slice(11,16);
  if (typeof value === 'number' && value >= 0 && value < 1) { const mins = Math.round(value*1440); return `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`; }
  return text(value);
}
export function stockholmInstant(date, time, date1904 = false) {
  const day = excelDate(date, date1904), clock = excelTime(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(clock)) throw new Error('Invalid date/time');
  const local = `${day}T${clock}`;
  const dt = DateTime.fromISO(local, { zone: 'Europe/Stockholm' });
  // Reject nonexistent spring times and ambiguous autumn times rather than silently shifting them.
  if (!dt.isValid || dt.toFormat("yyyy-MM-dd'T'HH:mm") !== local || dt.getPossibleOffsets().length !== 1) throw new Error('Invalid or ambiguous local time');
  return dt.toUTC().toISO({ suppressMilliseconds: true });
}
export function validateRows(rows, date1904 = false) {
  const result = new Map(), duplicateIds = new Set(); let rejected = 0;
  for (const row of rows) {
    if (!isPublished(row.publicera)) continue;
    try {
      const id = text(row.id, 101), title = text(row.rubrik, 200), place = text(row.plats, 300);
      if (!/^[\w-]{1,100}$/.test(id) || !title || !place) throw new Error('Missing required field');
      const statusText = text(row.status).toLowerCase();
      if (!['','planerad','scheduled','inställd','inställt','cancelled'].includes(statusText)) throw new Error('Invalid status');
      const start = stockholmInstant(row.startdatum,row.starttid,date1904), end = stockholmInstant(row.slutdatum,row.sluttid,date1904);
      if (Date.parse(end) <= Date.parse(start)) throw new Error('Invalid interval');
      if (result.has(id)) duplicateIds.add(id);
      result.set(id, { id, title, start, end, place, address:text(row.adress,500), description:text(row.beskrivning), status:['inställd','inställt','cancelled'].includes(statusText)?'cancelled':'scheduled' });
    } catch { rejected++; }
  }
  for (const id of duplicateIds) { result.delete(id); rejected++; }
  return { events:[...result.values()].sort((a,b)=>Date.parse(a.start)-Date.parse(b.start)), rejected };
}
export async function parseWorkbook(buffer, sheetName = 'Kalender') {
  if (buffer.byteLength > 10*1024*1024) throw new Error('Workbook too large');
  const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet || sheet.rowCount > 5001) throw new Error('Invalid worksheet');
  const keys = sheet.getRow(1).values.slice(1).map(v=>text(v).toLowerCase());
  if (!HEADERS.every(h=>keys.includes(h)) || new Set(keys).size !== keys.length) throw new Error('Invalid headers');
  const rows=[];
  sheet.eachRow((row,index)=> { if(index>1) rows.push(Object.fromEntries(keys.map((key,i)=>[key,row.getCell(i+1).value]))); });
  return validateRows(rows, Boolean(workbook.properties.date1904));
}
export async function downloadCalendar(env = process.env, fetcher = fetch) {
  const tokenResponse = await fetcher(`https://login.microsoftonline.com/${encodeURIComponent(env.MS_TENANT_ID)}/oauth2/v2.0/token`, {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:env.MS_CLIENT_ID,client_secret:env.MS_CLIENT_SECRET,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'}), signal:AbortSignal.timeout(10000),
  });
  if (!tokenResponse.ok) throw new Error('Authentication failed');
  const { access_token } = await tokenResponse.json();
  if (typeof access_token !== 'string') throw new Error('Missing token');
  // File download supports application permissions. Excel workbook APIs do not.
  const file = await fetcher(`https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(env.MS_DRIVE_ID)}/items/${encodeURIComponent(env.MS_ITEM_ID)}/content`, {
    headers:{Authorization:`Bearer ${access_token}`}, redirect:'follow', signal:AbortSignal.timeout(15000),
  });
  if (!file.ok || Number(file.headers.get('content-length')) > 10*1024*1024) throw new Error('File unavailable');
  const buffer = Buffer.from(await file.arrayBuffer());
  return parseWorkbook(buffer, env.MS_SHEET_NAME || 'Kalender');
}
