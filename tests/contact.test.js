import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from '../server/contact.js';

const input={name:'Testperson',email:'test@example.com',message:'En fråga om Hässleholm.\nTack!',website:'',submissionId:'fa673196-6c89-4f84-b4ef-feb26671a3c0'};
const env={RESEND_API_KEY:'test-key',CONTACT_FROM_EMAIL:'Webb <webb@example.com>'};
const request=(body=input,headers={})=>new Request('https://example.com/api/contact',{method:'POST',headers:{origin:'https://example.com','content-type':'application/json',...headers},body:JSON.stringify(body)});

test('sends to fixed recipient with reply-to and stable retry key; never exposes provider details',async()=>{
  const calls=[];
  const handle=createContactHandler({env,fetchImpl:async(url,options)=>{calls.push({url,...options});return Response.json({id:'provider-id'});}});
  const response=await handle(request({...input,to:'attacker@example.com'}));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true,code:'sent'});
  await handle(request());
  assert.equal(calls[0].url,'https://api.resend.com/emails');
  const payload=JSON.parse(calls[0].body);
  assert.deepEqual(payload.to,['hassleholm@kristdemokraterna.se']);assert.equal(payload.reply_to,input.email);
  assert.equal(payload.from,env.CONTACT_FROM_EMAIL);assert.ok(payload.text.includes(input.message));
  assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
  await handle(request({...input,message:'Ändrat meddelande'}));
  assert.notEqual(calls[0].headers['Idempotency-Key'],calls[2].headers['Idempotency-Key']);
});

test('rejects malformed fields, spam trap, invalid origin and oversized bodies before sending',async()=>{
  const handle=createContactHandler({env,fetchImpl:async()=>{assert.fail('Must not send');}});
  for(const body of [null,[],{...input,name:' '},{...input,email:'a@b\nBcc: x@y.se'},{...input,message:' '},{...input,message:'a'.repeat(5001)},{...input,name:'a'.repeat(101)},{...input,submissionId:'bad'},{...input,website:'spam'}])assert.equal((await handle(request(body))).status,400);
  assert.equal((await handle(request(input,{origin:'https://other.example'}))).status,403);
  assert.equal((await handle(request(input,{'content-type':'text/plain'}))).status,415);
  assert.equal((await handle(request({...input,message:'a'.repeat(33000)}))).status,413);
  assert.equal((await handle(new Request('https://example.com/api/contact'))).status,405);
});

test('missing configuration and provider failures never return success',async()=>{
  assert.equal((await createContactHandler({env:{}})(request())).status,503);
  for(const fetchImpl of [async()=>new Response('private error',{status:401}),async()=>{throw Error('private');},async()=>Response.json({})]){
    const response=await createContactHandler({env,fetchImpl})(request());assert.equal(response.status,502);assert.deepEqual(await response.json(),{ok:false,code:'send_failed'});
  }
});

test('throttles repeated attempts and expires the limit',async()=>{
  let time=0,calls=0;
  const handle=createContactHandler({env,now:()=>time,fetchImpl:async()=>{calls++;return Response.json({id:'sent'});}});
  for(let i=0;i<5;i++)assert.equal((await handle(request())).status,200);
  assert.equal((await handle(request())).status,429);assert.equal(calls,5);
  time=600001;assert.equal((await handle(request())).status,200);
});
