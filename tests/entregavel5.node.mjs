import test from 'node:test';
import assert from 'node:assert/strict';
import { createConquestService } from '../server/service.mjs';
const newService=()=>createConquestService(':memory:');
test('cadastro, autenticação e sessão de jogador',()=>{
 const s=newService();try{
  const user=s.dispatch('POST','/api/register',{username:'aluno1',display_name:'Aventureiro',password:'SenhaTeste123!'});
  assert.equal(user.role,'jogador');
  const {token}=s.dispatch('POST','/api/login',{username:'aluno1',password:'SenhaTeste123!'});
  assert.equal(s.dispatch('GET','/api/me',{},token).username,'aluno1');
  s.dispatch('POST','/api/logout',{},token);
  assert.throws(()=>s.dispatch('GET','/api/me',{},token),e=>e.status===401);
 }finally{s.close();}
});
test('pontuação, histórico e ranking público',()=>{
 const s=newService();try{
  s.dispatch('POST','/api/register',{username:'aluno2',display_name:'Explorador',password:'SenhaTeste123!'});
  const {token}=s.dispatch('POST','/api/login',{username:'aluno2',password:'SenhaTeste123!'});
  assert.deepEqual(s.dispatch('GET','/api/ranking'),[]);
  assert.equal(s.dispatch('POST','/api/scores',{score:350,correct:6,finished:true},token).saved,true);
  assert.equal(s.dispatch('GET','/api/scores',{},token).length,1);
  assert.equal(s.dispatch('GET','/api/ranking')[0].best_score,350);
 }finally{s.close();}
});
test('autorização, consulta pública e perfil',()=>{
 const s=newService();try{
  s.dispatch('POST','/api/register',{username:'jogador3',display_name:'Cavaleiro',password:'SenhaTeste123!'});
  const {token}=s.dispatch('POST','/api/login',{username:'jogador3',password:'SenhaTeste123!'});
  assert.equal(s.dispatch('GET','/api/health').status,'ok');
  assert.throws(()=>s.dispatch('GET','/api/admin/players',{},token),e=>e.status===403);
  assert.throws(()=>s.dispatch('GET','/api/scores'),e=>e.status===401);
  assert.equal(s.dispatch('PATCH','/api/me',{display_name:'Liora'},token).display_name,'Liora');
  assert.throws(()=>s.dispatch('POST','/api/scores',{score:-1,correct:9,finished:true},token),e=>e.status===400);
 }finally{s.close();}
});
