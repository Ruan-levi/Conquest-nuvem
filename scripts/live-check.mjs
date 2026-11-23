import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

const base=process.env.CONQUEST_CHECK_URL || 'http://127.0.0.1:4000';
const rand=randomBytes(6).toString('hex');
const username='e5test'+rand;
const password='SenhaDidatica-'+rand;
async function call(path,{method='GET',body,token}={}){
  const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:res.status,body:await res.json()};
}
const guest=await call('/api/ranking');assert.equal(guest.status,200);
const denied=await call('/api/me');assert.equal(denied.status,401);
const sign=await call('/api/register',{method:'POST',body:{username,display_name:'Jogador teste entrega',password}});assert.equal(sign.status,200);
const auth=await call('/api/login',{method:'POST',body:{username,password}});assert.equal(auth.status,200);
const token=auth.body.token;
const profile=await call('/api/me',{token});assert.equal(profile.body.username,username);
const update=await call('/api/me',{method:'PATCH',body:{display_name:'Jogador AWS'},token});assert.equal(update.body.display_name,'Jogador AWS');
const scored=await call('/api/scores',{method:'POST',body:{score:870,correct:8,finished:true},token});assert.equal(scored.status,200);
const hist=await call('/api/scores',{token});assert.ok(hist.body.find(x=>x.score===870));
const now=await call('/api/ranking');assert.ok(now.body.find(x=>x.name==='Jogador AWS'));
const forbidden=await call('/api/admin/players',{token});assert.equal(forbidden.status,403);
const logout=await call('/api/logout',{method:'POST',body:{},token});assert.equal(logout.status,200);
const revoked=await call('/api/me',{token});assert.equal(revoked.status,401);
console.log(JSON.stringify({guest:guest.status,guest_denied:denied.status,register:sign.status,login:auth.status,profile:profile.status,nickname:update.status,save_score:scored.status,history:hist.status,ranking:now.status,restricted:forbidden.status,logout:logout.status,revoked:revoked.status,success:true}));