import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import challenge from '../../functions/challenge.js';
import { publicQuestion, checkAnswer, nextQuestionIndex, questionCount, QUIZ_LENGTH } from '../../functions/_shared/quiz.js';

const USER_ID = '12345678-1234-1234-1234-123456789012';
const RUN_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const authToken = 'header.' + Buffer.from(JSON.stringify({ sub: USER_ID })).toString('base64url') + '.signature';
const originalFetch = global.fetch;
const originalEnv = {
  NHOST_AUTH_URL: process.env.NHOST_AUTH_URL,
  NHOST_GRAPHQL_URL: process.env.NHOST_GRAPHQL_URL,
  NHOST_ADMIN_SECRET: process.env.NHOST_ADMIN_SECRET,
};
beforeEach(() => {
  process.env.NHOST_AUTH_URL = 'https://test.auth.example/v1';
  process.env.NHOST_GRAPHQL_URL = 'https://test.graphql.example/v1';
  process.env.NHOST_ADMIN_SECRET = 'INTERNAL_SECRET_FOR_UNIT_TEST_ONLY';
});
afterEach(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
function req(body, headers = {}) { return { method: 'POST', body, headers }; }
function makeRes() {
  return {
    statusCode: 200, headers: {}, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    end() { return this; },
  };
}
function authed(body) { return req(body, { authorization: 'Bearer ' + authToken, origin: 'https://ruan-levi.github.io' }); }
function jsonResponse(data, status = 200) { return { ok: status < 400, status, json: async () => ({ data }) }; }

test('banco e respostas permanecem no backend', () => {
  assert.ok(questionCount() >= QUIZ_LENGTH);
  assert.deepEqual(Object.keys(publicQuestion(0)).sort(), ['options', 'text']);
  assert.equal(checkAnswer(0, 1).correct, true);
  assert.throws(() => checkAnswer(0, 8));
  for (let i = 0; i < questionCount(); i++) {
    const next = nextQuestionIndex(i, () => 0);
    assert.notEqual(next, i);
  }
});
test('recusa acesso sem autenticacao antes de consultar o banco', async () => {
  global.fetch = async () => { throw Error('Nao deve consultar Nhost'); };
  const res = makeRes();
  await challenge(req({ action: 'start' }), res);
  assert.equal(res.statusCode, 401);
});
test('cria desafio com token verificado e sem expor gabarito', async () => {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/token/verify')) return { ok: true, status: 200 };
    return jsonResponse({ insert_conquest_verified_runs_one: { id: RUN_ID, score: 0, correct_answers: 0 } });
  };
  const res = makeRes();
  await challenge(authed({ action: 'start' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.runId, RUN_ID);
  assert.equal(res.body.totalRounds, 6);
  assert.equal(res.body.question.options.length, 4);
  assert.equal(res.body.question.answer, undefined);
  assert.equal(res.headers['access-control-allow-origin'], 'https://ruan-levi.github.io');
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[1].options.body).variables.uid, USER_ID);
  assert.equal(calls[1].options.headers['x-hasura-admin-secret'], process.env.NHOST_ADMIN_SECRET);
});
test('valida alternativa no servidor e avanca rodada atomicamente', async () => {
  const graphCalls = [];
  global.fetch = async (url, options) => {
    if (url.includes('/token/verify')) return { ok: true, status: 200 };
    const payload = JSON.parse(options.body); graphCalls.push(payload);
    if (payload.query.includes('ConquestRun(')) return jsonResponse({ conquest_verified_runs: [{ id: RUN_ID, current_round: 0, current_question: 0, score: 0, correct_answers: 0, completed: false }] });
    return jsonResponse({ update_conquest_verified_runs: { affected_rows: 1, returning: [{ current_round: 1, score: 100, correct_answers: 1, completed: false }] } });
  };
  const res = makeRes();
  await challenge(authed({ action: 'answer', runId: RUN_ID, choice: 1, round: 1 }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.correct, true);
  assert.equal(res.body.score, 100);
  assert.equal(res.body.round, 2);
  assert.equal(graphCalls[1].variables.delta, 100);
  assert.equal(graphCalls[1].variables.round, 0);
  assert.equal(graphCalls[1].variables.question, 0);
  assert.ok(graphCalls[1].query.includes('current_round: {_eq: $round}'));
});
test('bloqueia resposta repetida por conflito sem duplicar pontos', async () => {
  global.fetch = async (url, options) => {
    if (url.includes('/token/verify')) return { ok: true };
    const { query } = JSON.parse(options.body);
    if (query.includes('ConquestRun(')) return jsonResponse({ conquest_verified_runs: [{ id: RUN_ID, current_round: 0, current_question: 0, score: 0, correct_answers: 0, completed: false }] });
    return jsonResponse({ update_conquest_verified_runs: { affected_rows: 0, returning: [] } });
  };
  const res = makeRes();
  await challenge(authed({ action: 'answer', runId: RUN_ID, choice: 1, round: 1 }), res);
  assert.equal(res.statusCode, 409);
});
test('exige dados validos e ignora tokens falsos', async () => {
  global.fetch = async url => url.includes('/token/verify') ? { ok: false, status: 401 } : jsonResponse({});
  const unauth = makeRes();
  await challenge(authed({ action: 'start' }), unauth);
  assert.equal(unauth.statusCode, 401);
  global.fetch = async url => url.includes('/token/verify') ? { ok: true } : jsonResponse({});
  const badAnswer = makeRes();
  await challenge(authed({ action: 'answer', runId: RUN_ID, round: 1, choice: 99 }), badAnswer);
  assert.equal(badAnswer.statusCode, 400);
});
test('responde OPTIONS com CORS seguro', async () => {
  const res = makeRes();
  await challenge({ method: 'OPTIONS', headers: { origin: 'https://ruan-levi.github.io' } }, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['access-control-allow-origin'], 'https://ruan-levi.github.io');
  const denied = makeRes();
  await challenge({ method: 'OPTIONS', headers: { origin: 'https://evil.example' } }, denied);
  assert.equal(denied.headers['access-control-allow-origin'], undefined);
});