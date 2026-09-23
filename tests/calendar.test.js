import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { HEADERS, validateRows, parseWorkbook, stockholmInstant, downloadCalendar } from '../server/calendar.js';
import { makeICS, upcomingEvents } from '../calendar-utils.js';
import { filterPosts, GET as facebookGET } from '../api/facebook.js';
import { GET as calendarGET } from '../api/calendar.js';
const row={id:'meeting-1',rubrik:'Årsmöte',startdatum:'2026-09-10',starttid:'18:00',slutdatum:'2026-09-10',sluttid:'20:00',plats:'Hässleholm',adress:'Gatan 1',beskrivning:'Rad ett\nRad två; ja, bra',status:'planerad',publicera:'ja',secret:'PRIVATE'};
test('Stockholm dates: summer, winter, DST gaps and ambiguous times',()=>{
  assert.equal(stockholmInstant('2026-07-01','18:00'),'2026-07-01T16:00:00Z');
  assert.equal(stockholmInstant('2026-01-01','18:00'),'2026-01-01T17:00:00Z');
  assert.throws(()=>stockholmInstant('2026-03-29','02:30'));
  assert.throws(()=>stockholmInstant('2026-10-25','02:30'));
  assert.throws(()=>stockholmInstant('2026-02-30','18:00'));
  assert.throws(()=>stockholmInstant('2026-09-10junk','18:00'));
  assert.throws(()=>stockholmInstant('2026-09-10','18:00junk'));
});
test('private, malformed and duplicate rows never leak; valid rows survive',()=>{
  const result=validateRows([row,{...row,id:'private',publicera:'nej'},{...row,id:'bad',startdatum:'broken'},{...row,id:'duplicate'},{...row,id:'duplicate'}]);
  assert.equal(result.events.length,1);assert.equal(result.rejected,2);assert.equal(result.events[0].id,row.id);
  assert.equal(JSON.stringify(result).includes('PRIVATE'),false);assert.equal(JSON.stringify(result).includes('publicera'),false);
  const changed=validateRows([{...row,rubrik:'Ny rubrik'}]).events[0];assert.equal(changed.id,row.id);assert.equal(changed.title,'Ny rubrik');
});
test('real XLSX with native dates, time fractions and a malformed row',async()=>{
  const book=new ExcelJS.Workbook(),sheet=book.addWorksheet('Kalender');sheet.addRow(HEADERS);
  sheet.addRow(HEADERS.map(key=>({...row,startdatum:new Date('2026-09-10T00:00:00Z'),starttid:.75,slutdatum:new Date('2026-09-10T00:00:00Z'),sluttid:20/24})[key]));
  sheet.addRow(HEADERS.map(key=>({...row,id:'bad',starttid:'25:00'})[key]));
  const parsed=await parseWorkbook(await book.xlsx.writeBuffer());assert.equal(parsed.events.length,1);assert.equal(parsed.rejected,1);assert.equal(parsed.events[0].start,'2026-09-10T16:00:00Z');
});
test('Graph download uses application token on server and only returns public data',async()=>{
  const book=new ExcelJS.Workbook();book.addWorksheet('Kalender').addRows([HEADERS,HEADERS.map(k=>row[k])]);const buffer=await book.xlsx.writeBuffer();const calls=[];
  const mock=async(url,opts)=>{calls.push([url,opts]);return calls.length===1?Response.json({access_token:'SECRET'}):new Response(buffer);};
  const result=await downloadCalendar({MS_TENANT_ID:'tenant',MS_CLIENT_ID:'client',MS_CLIENT_SECRET:'secret',MS_DRIVE_ID:'drive',MS_ITEM_ID:'file'},mock);
  assert.equal(calls.length,2);assert.match(calls[1][0],/\/drives\/drive\/items\/file\/content$/);assert.equal(calls[1][1].headers.Authorization,'Bearer SECRET');assert.equal(result.events.length,1);assert.equal(JSON.stringify(result).includes('SECRET'),false);
});
test('ICS has stable UID, UTC time, cancellation, escaping, UTF-8 folding and CRLF',()=>{
  const event=validateRows([row]).events[0];event.title='Å'.repeat(120);event.status='cancelled';
  const ics=makeICS(event,new Date('2026-01-01T00:00:00Z'));
  assert.match(ics,/UID:meeting-1@kdhlm.se/);assert.match(ics,/DTSTART:20260910T160000Z/);assert.match(ics,/DTEND:20260910T180000Z/);assert.match(ics,/STATUS:CANCELLED/);
  assert.match(ics,/DESCRIPTION:Rad ett\\nRad två\\; ja\\, bra/);
  assert.ok(ics.split('\r\n').every(line=>Buffer.byteLength(line)<=75));assert.equal(ics.replaceAll('\r\n','').includes('\n'),false);
});
test('past events disappear while ongoing and cancelled future events remain',()=>{
  const e=validateRows([row]).events[0];assert.equal(upcomingEvents([e],Date.parse('2026-09-10T17:00Z')).length,1);assert.equal(upcomingEvents([e],Date.parse(e.end)).length,0);
  assert.equal(upcomingEvents([{...e,status:'cancelled'}],Date.parse('2026-09-01')).length,1);
});
test('Facebook returns only allowlisted fields and never Graph token-bearing pagination URLs',()=>{
  const posts=filterPosts({data:[{id:'123_456',message:'<script>alert(1)</script>',created_time:'2026-01-01T12:00:00Z',full_picture:'javascript:alert(1)',permalink_url:'https://evil.example/',access_token:'SECRET'}],paging:{next:'https://graph.facebook.com?access_token=SECRET'}},'KD');
  assert.equal(posts.length,1);assert.equal(posts[0].image,undefined);assert.equal(posts[0].url,undefined);assert.equal(JSON.stringify(posts).includes('SECRET'),false);
});
test('unconfigured APIs fail closed with public, nontechnical responses',async()=>{
  const c=await calendarGET(),f=await facebookGET(new Request('http://localhost/api/facebook'));
  assert.equal(c.status,503);assert.equal(f.status,503);assert.deepEqual(await c.json(),{events:[],available:false});assert.deepEqual(await f.json(),{posts:[],available:false});
});
test('durable calendar snapshot survives upstream failure and refresh updates the same ID',async()=>{
  const env={MS_TENANT_ID:'test',MS_CLIENT_ID:'test',MS_CLIENT_SECRET:'test',MS_DRIVE_ID:'test',MS_ITEM_ID:'test',CACHE_REST_URL:'https://cache.example',CACHE_REST_TOKEN:'test'};
  const old=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]])),originalFetch=globalThis.fetch,originalError=console.error;
  let saved=null,broken=false,title='Original';
  Object.assign(process.env,env);
  globalThis.fetch=async(url,options)=>{
    if(String(url).startsWith('https://cache.example')) {const command=JSON.parse(options.body);if(command[0]==='GET')return Response.json({result:saved?JSON.stringify(saved):null});saved=JSON.parse(command[2]);return Response.json({result:'OK'});}
    if(String(url).includes('login.microsoftonline'))return Response.json({access_token:'TEST'});
    if(broken)return new Response('',{status:503});
    const book=new ExcelJS.Workbook();book.addWorksheet('Kalender').addRows([HEADERS,HEADERS.map(k=>({...row,rubrik:title})[k])]);return new Response(await book.xlsx.writeBuffer());
  };
  console.error=()=>{};
  try {
    const first=await (await calendarGET()).json();assert.equal(first.events[0].title,'Original');
    saved.fetchedAt=0;title='Ändrad';const second=await (await calendarGET()).json();assert.equal(second.events[0].title,'Ändrad');assert.equal(second.events[0].id,first.events[0].id);
    saved.fetchedAt=0;broken=true;
    const {GET:coldStart}=await import('../api/calendar.js?cold-start-test');const fallback=await coldStart();assert.equal(fallback.status,200);assert.deepEqual(await fallback.json(),second);
  } finally {globalThis.fetch=originalFetch;console.error=originalError;for(const [k,value] of Object.entries(old)){if(value===undefined)delete process.env[k];else process.env[k]=value;}}
});
