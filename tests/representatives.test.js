import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDirectory,fetchDirectory,parseProfilePortrait,DIRECTORY_SOURCE} from '../server/representatives.js';
const person={persIdnr:123,firstName:'Test',lastName:'Person',email:'test@example.com',phoneNumber:'070-123 45 67',avatar:'/images/person.jpg',organizationalAssignments:[{assignmentName:'Ordförande'},{assignmentName:'Duplicerad äldre uppgift'}],politicalAssignments:[{assignmentName:'Kommunfullmäktige, ledamot'}],privateNotes:'NEVER EXPORT'};
const html=(board=[person],political=[person])=>`<script type="application/json">${JSON.stringify({district:'Hässleholm',items:{organizatorialAssignments:board,politicalAssignments:political}})}</script>`;
test('directory merges public profiles, uses visible roles, and only exposes allowed fields',()=>{
  const result=parseDirectory(html());assert.equal(result.people.length,1);assert.equal(result.people[0].roles.length,2);assert.equal(result.people[0].roles[0].title,'Ordförande');assert.equal(result.source,DIRECTORY_SOURCE);assert.equal(JSON.stringify(result).includes('NEVER EXPORT'),false);assert.equal(JSON.stringify(result).includes('Duplicerad'),false);
});
test('source role changes and removals replace previous data without duplicates',()=>{
  const next=parseDirectory(html([{...person,organizationalAssignments:[{assignmentName:'Ledamot'}]}],[]));assert.equal(next.people[0].roles.length,1);assert.equal(next.people[0].roles[0].title,'Ledamot');assert.equal(next.people[0].id,'123');
});

test('all distinct local political assignments are retained once',()=>{
  const political={...person,politicalAssignments:[{assignmentName:'Kommunfullmäktige, ledamot'},{assignmentName:'Kommunfullmäktige, ledamot'},{assignmentName:'Kultur/fritid, vice ordf.'}]};
  const result=parseDirectory(html([person],[political]));
  assert.deepEqual(result.people[0].roles.filter(r=>r.group==='political').map(r=>r.title),['Kommunfullmäktige, ledamot','Kultur/fritid, vice ordf.']);
});
test('changed markup or malformed data fails closed; malicious URLs are discarded',()=>{
  assert.throws(()=>parseDirectory('<html>Maintenance</html>'));assert.throws(()=>parseDirectory(html([],[])));
  assert.throws(()=>parseDirectory(html([{...person,persIdnr:'<script>'}],[])));
  const next=parseDirectory(html([{...person,avatar:'https://evil.example/p.jpg',email:'bad\nheader'}],[]));assert.equal(next.people[0].image,null);assert.equal(next.people[0].email,undefined);
});
test('fetch uses a fixed public source and propagates failures for last-good fallback',async()=>{
  const requested=[];const data=await fetchDirectory(async url=>{requested.push(url);return new Response(html());});assert.equal(requested[0],DIRECTORY_SOURCE);assert.equal(data.people.length,1);assert.ok(requested.every(url=>url.startsWith('https://kristdemokraterna.se/')));
  await assert.rejects(()=>fetchDirectory(async()=>new Response('',{status:503})));
});
test('profile portraits must belong to the exact public person on the official image host',()=>{
  const profile=item=>`<script type="application/json">${JSON.stringify({item})}</script>`;
  const item={persIdnr:123,hideUserImage:false,userImage:'/images/large.jpg'};
  assert.equal(parseProfilePortrait(profile(item),'123'),'https://kristdemokraterna.se/images/large.jpg');
  assert.equal(parseProfilePortrait(profile(item),'456'),null);
  assert.equal(parseProfilePortrait(profile({...item,hideUserImage:true}),'123'),null);
  assert.equal(parseProfilePortrait(profile({...item,userImage:'https://evil.example/p.jpg'}),'123'),null);
});
test('larger portrait is preferred and cached when a later profile fetch fails',async()=>{
  const data=await fetchDirectory(async url=>new Response(url===DIRECTORY_SOURCE?html():`<script type="application/json">${JSON.stringify({item:{persIdnr:123,hideUserImage:false,userImage:'/images/profile-large.jpg'}})}</script>`));
  assert.equal(data.people[0].image,'https://kristdemokraterna.se/images/profile-large.jpg');assert.equal(data.people[0].imageThumbnail,'https://kristdemokraterna.se/images/person.jpg');
  const fallback=await fetchDirectory(async url=>{if(url!==DIRECTORY_SOURCE)throw new Error('Unavailable');return new Response(html());});
  assert.equal(fallback.people[0].image,data.people[0].image);
});
