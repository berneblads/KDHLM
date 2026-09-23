import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

export async function verifyContact(page,base){
  let mode='failure',calls=[];
  await page.route('**/api/contact',async route=>{
    calls.push(route.request().postDataJSON());
    if(mode==='network')return route.abort();
    await new Promise(resolve=>setTimeout(resolve,200));
    return route.fulfill({status:mode==='success'?200:mode==='rate'?429:503,json:mode==='success'?{ok:true,code:'sent'}:{ok:false,code:mode==='rate'?'rate_limit':'unavailable'}});
  });
  try{
    await page.goto(base+'/kontakt.html');
    await page.locator('#contact-submit').click();assert.equal(calls.length,0);
    await page.locator('#contact-name').fill('Testperson');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('Ett testmeddelande.');
    await page.locator('#contact-submit').click();
    await expect(page.locator('#contact-submit')).toBeDisabled();
    await expect(page.locator('#form-status')).toContainText('Din text finns kvar');
    await expect(page.locator('#contact-message')).toHaveValue('Ett testmeddelande.');
    mode='network';await page.locator('#contact-submit').click();
    await expect(page.locator('#contact-submit')).toBeEnabled();
    await expect(page.locator('#contact-email')).toHaveValue('test@example.com');
    mode='rate';await page.locator('#contact-submit').click();
    await expect(page.locator('#form-status')).toContainText('Vänta tio minuter');
    mode='success';await page.locator('#contact-submit').click();
    await expect(page.locator('#form-status')).toContainText('Ditt meddelande har skickats');
    await expect(page.locator('#contact-message')).toHaveValue('');
    await expect(page.locator('#contact-submit')).toBeEnabled();
    assert.equal(new Set(calls.map(call=>call.submissionId)).size,1);
    assert.equal(calls[0].website,'');
    await expect(page.locator('#email-draft')).toHaveCount(0);
    for(const width of [320,390,1440]){
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:`artifacts/contact-form-${width}.png`,fullPage:true});
    }
  }finally{await page.unroute('**/api/contact');}
}

if(process.argv[1]?.endsWith('verify-contact.js')){
  const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await verifyContact(page,base);assert.deepEqual(errors,[]);
    // Missing configuration is exercised by unit tests; this read-only request checks the real adapter.
    const response=await page.request.get(base+'/api/contact');assert.equal(response.status(),405);
    console.log('Contact verified: validation, sending state, server/network errors, rate limit, retry, success, mobile layout and local API. No real mail sent.');
  }finally{await browser.close();}
}
