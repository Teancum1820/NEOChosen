import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../preview/worker.mjs';

test('private review protects every asset and validates signed sessions', async () => {
  const origin='https://review.example';
  let assetReads=0;
  const env={REVIEW_PASSWORD:'test-only-password', ASSETS:{fetch:async ()=>{assetReads++;return new Response('private asset');}}};
  for(const path of ['/','/images/northeast-ohio-skyline.svg','/media-kit/example.pdf']) {
    const response=await worker.fetch(new Request(origin+path),env);
    assert.match(await response.text(),/Review password/);
    assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  }
  assert.equal(assetReads,0);
  assert.equal((await worker.fetch(new Request(origin),{...env,REVIEW_PASSWORD:undefined})).status,503);
  const login=(password,originHeader=origin,returnTo='/lakewood/')=>worker.fetch(new Request(origin+'/__preview/login',{method:'POST',headers:{Origin:originHeader,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password,returnTo})}),env);
  assert.equal((await login('wrong')).status,401);
  assert.equal((await login(env.REVIEW_PASSWORD,'https://other.example')).status,403);
  const accepted=await login(env.REVIEW_PASSWORD);
  assert.equal(accepted.status,303);
  assert.equal(accepted.headers.get('Location'),'/lakewood/');
  const cookie=accepted.headers.get('Set-Cookie');
  assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/);
  const request=()=>new Request(origin+'/lakewood/',{headers:{Cookie:cookie.split(';')[0]}});
  const asset=await worker.fetch(request(),env);
  assert.equal(await asset.text(),'private asset');
  assert.equal(asset.headers.get('X-Robots-Tag'),'noindex, nofollow, noarchive');
  assert.equal(assetReads,1);
  assert.match(await (await worker.fetch(request(),{...env,REVIEW_PASSWORD:'rotated-test-password'})).text(),/Review password/);
  const tampered=cookie.split(';')[0].replace(/.$/,'X');
  assert.match(await (await worker.fetch(new Request(origin,{headers:{Cookie:tampered}}),env)).text(),/Review password/);
  assert.equal((await login(env.REVIEW_PASSWORD,origin,'//other.example')).headers.get('Location'),'/');
  assert.equal(assetReads,1);
});
