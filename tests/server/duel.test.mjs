import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import duel from '../../functions/duel.js';
import { DUEL_ROUNDS, publicQuestion, checkDuelAnswer } from '../../functions/_shared/duel-questions.js';

const HOST = '11111111-1111-4111-8111-111111111111';
const GUEST = '22222222-2222-4222-8222-222222222222';
const INTRUDER = '33333333-3333-4333-8333-333333333333';
const ROOM_ID = '44444444-4444-4444-8444-444444444444';
const oldFetch = globalThis.fetch;
const oldEnv = {
  NHOST_GRAPHQL_URL: process.env.NHOST_GRAPHQL_URL,
  NHOST_AUTH_URL: process.env.NHOST_AUTH_URL,
  NHOST_ADMIN_SECRET: process.env.NHOST_ADMIN_SECRET
};

before(() => {
  process.env.NHOST_GRAPHQL_URL = 'https://example.test/graphql';
  process.env.NHOST_AUTH_URL = 'https://example.test/auth/v1';
  process.env.NHOST_ADMIN_SECRET = 'server-only-test-secret';
});
after(() => {
  globalThis.fetch = oldFetch;
  Object.entries(oldEnv).forEach(([k, value]) => {
    if (value === undefined) delete process.env[k]; else process.env[k] = value;
  });
});

function token(uid) {
  const payload = Buffer.from(JSON.stringify({ sub: uid })).toString('base64url');
  return `Bearer header.${payload}.signature`;
}
function request(method, body, uid) {
  return { method, body, headers: { origin: 'https://ruan-levi.github.io', ...(uid ? { authorization: token(uid) } : {}) } };
}
async function invoke(req) {
  let status = 200;
  const headers = {};
  const res = {
    setHeader(k, v) { headers[k] = v; },
    status(code) { status = code; return this; },
    json(data) { return { status, data, headers }; },
    end() { return { status, headers }; }
  };
  return duel(req, res);
}
function backend() {
  let room = null;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/token/verify')) return { ok: true };
    assert.equal(url, 'https://example.test/graphql');
    assert.equal(options.headers['x-hasura-admin-secret'], 'server-only-test-secret');
    const { query, variables: v } = JSON.parse(options.body);
    let data;
    if (query.includes('OpenDuel')) data = { conquest_duels_aggregate: { aggregate: { count: room && room.host_id === v.uid && room.status !== 'finished' ? 1 : 0 } } };
    else if (query.includes('CreateDuel')) {
      room = { id: ROOM_ID, code: v.code, host_id: v.uid, guest_id: null, host_nickname: v.nickname,
        guest_nickname: null, status: 'waiting', host_round: 0, guest_round: 0, host_score: 0, guest_score: 0,
        host_correct: 0, guest_correct: 0, created_at: new Date().toISOString(), finished_at: null };
      data = { insert_conquest_duels_one: { ...room } };
    } else if (query.includes('FindDuel')) data = { conquest_duels: room?.code === v.code ? [{ ...room }] : [] };
    else if (query.includes('ReadDuel')) data = { conquest_duels: room?.id === v.id && [room.host_id, room.guest_id].includes(v.uid) ? [{ ...room }] : [] };
    else if (query.includes('JoinDuel')) {
      const ok = room?.id === v.id && room.status === 'waiting' && !room.guest_id && room.host_id !== v.uid;
      if (ok) Object.assign(room, { guest_id: v.uid, guest_nickname: v.nickname, status: 'active' });
      data = { update_conquest_duels: { affected_rows: ok ? 1 : 0 } };
    } else if (query.includes('HostAnswer') || query.includes('GuestAnswer')) {
      const host = query.includes('HostAnswer');
      const field = host ? 'host' : 'guest';
      const ok = room?.status === 'active' && room[field + '_id'] === v.uid && room[field + '_round'] === v.round;
      if (ok) {
        room[field + '_round']++;
        room[field + '_score'] += v.delta;
        room[field + '_correct'] += v.hit;
      }
      data = { update_conquest_duels: { affected_rows: ok ? 1 : 0 } };
    } else if (query.includes('FinishDuel')) {
      const ok = room?.id === v.id && room.status === 'active' && room.host_round === 6 && room.guest_round === 6;
      if (ok) Object.assign(room, { status: 'finished', finished_at: v.finished });
      data = { update_conquest_duels: { affected_rows: ok ? 1 : 0 } };
    } else if (query.includes('CancelDuel')) {
      const ok = room?.id === v.id && [room.host_id, room.guest_id].includes(v.uid) && ['active', 'waiting'].includes(room.status);
      if (ok) room.status = 'cancelled';
      data = { update_conquest_duels: { affected_rows: ok ? 1 : 0 } };
    } else if (query.includes('DuelRanking')) {
      data = { conquest_duel_leaderboard: room?.status === 'finished' ? [
        { nickname: room.host_nickname, best_score: room.host_score, wins: 1, played: 1, user_id: room.host_id },
        { nickname: room.guest_nickname, best_score: room.guest_score, wins: 0, played: 1, user_id: room.guest_id }
      ] : [] };
    } else throw new Error('Operação GraphQL não esperada: ' + query.slice(0, 100));
    return { ok: true, async json() { return { data }; } };
  };
  return { get room() { return room; } };
}

test('banco seguro: nenhuma resposta é publicada ao buscar pergunta', () => {
  assert.equal(DUEL_ROUNDS, 6);
  assert.deepEqual(Object.keys(publicQuestion(ROOM_ID, 1)).sort(), ['options', 'text']);
  assert.deepEqual(publicQuestion(ROOM_ID, 1), publicQuestion(ROOM_ID, 1));
  assert.throws(() => checkDuelAnswer(ROOM_ID, 1, 12), RangeError);
});

test('duelo de dois jogadores: autentica, convida, responde, encerra e publica ranking', async () => {
  const state = backend();
  const unauthed = await invoke(request('POST', { action: 'create', nickname: 'Liora' }));
  assert.equal(unauthed.status, 401);

  const created = await invoke(request('POST', { action: 'create', nickname: 'Liora' }, HOST));
  assert.equal(created.status, 200);
  assert.equal(created.data.room.status, 'waiting');
  assert.match(created.data.room.code, /^[A-HJ-NP-Z2-9]{8}$/);
  assert.equal(created.data.room.question, null);
  const code = created.data.room.code;

  const outsider = await invoke(request('POST', { action: 'status', roomId: ROOM_ID }, INTRUDER));
  assert.equal(outsider.status, 404);
  const joined = await invoke(request('POST', { action: 'join', nickname: 'Cael', code }, GUEST));
  assert.equal(joined.status, 200);
  assert.equal(joined.data.room.status, 'active');
  assert.equal(joined.data.room.question.options.length, 4);
  const ownJoin = await invoke(request('POST', { action: 'join', nickname: 'Cael', code }, HOST));
  assert.equal(ownJoin.status, 200);

  for (let round = 1; round <= DUEL_ROUNDS; round++) {
    const answer = Array.from({ length: 4 }, (_, choice) => choice).find(choice => checkDuelAnswer(ROOM_ID, round, choice).correct);
    const host = await invoke(request('POST', { action: 'answer', roomId: ROOM_ID, round, choice: answer }, HOST));
    assert.equal(host.status, 200);
    assert.equal(host.data.answer.correct, true);
    if (round === 1) {
      const replay = await invoke(request('POST', { action: 'answer', roomId: ROOM_ID, round, choice: answer }, HOST));
      assert.equal(replay.status, 409);
    }
    const guest = await invoke(request('POST', { action: 'answer', roomId: ROOM_ID, round, choice: (answer + 1) % 4 }, GUEST));
    assert.equal(guest.status, 200);
    assert.equal(guest.data.answer.correct, false);
  }

  assert.equal(state.room.host_score, 600);
  assert.equal(state.room.guest_score, 0);
  assert.equal(state.room.status, 'finished');
  const result = await invoke(request('POST', { action: 'status', roomId: ROOM_ID }, GUEST));
  assert.equal(result.data.room.winner, 'host');
  const ranking = await invoke(request('GET'));
  assert.equal(ranking.status, 200);
  assert.deepEqual(ranking.data.ranking[0], { nickname: 'Liora', bestScore: 600, wins: 1, played: 1 });
  assert.equal(JSON.stringify(ranking.data).includes(HOST), false, 'Não divulgar IDs de usuários no ranking');
  assert.equal(ranking.headers['Access-Control-Allow-Origin'], 'https://ruan-levi.github.io');
});

test('validação do usuário e das respostas antes de modificar o banco', async () => {
  backend();
  const wrong = await invoke(request('POST', { action: 'join', code: '123', nickname: 'Player' }, HOST));
  assert.equal(wrong.status, 400);
  const noRoom = await invoke(request('POST', { action: 'answer', roomId: ROOM_ID, round: 1, choice: 0 }, HOST));
  assert.equal(noRoom.status, 404);
  const invalidAlias = await invoke(request('POST', { action: 'create', nickname: '<script>' }, HOST));
  assert.equal(invalidAlias.status, 400);
});
