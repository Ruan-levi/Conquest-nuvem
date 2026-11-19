import { randomInt } from 'node:crypto';
import { QUIZ_LENGTH, POINTS_PER_CORRECT, questionCount, publicQuestion, checkAnswer, nextQuestionIndex, isValidRunId } from './_shared/quiz.js';

// O Nhost publica este arquivo em /v1/challenge.
// Todo acesso ao banco com admin secret acontece exclusivamente neste processo.
const START = `mutation StartConquest($uid: uuid!, $question: Int!) {
  insert_conquest_verified_runs_one(object: {user_id: $uid, current_question: $question}) {
    id current_round score correct_answers
  }
}`;
const READ = `query ConquestRun($id: uuid!, $uid: uuid!) {
  conquest_verified_runs(where: {id: {_eq: $id}, user_id: {_eq: $uid}}, limit: 1) {
    id current_round current_question score correct_answers completed
  }
}`;
const ADVANCE = `mutation AdvanceConquest($id: uuid!, $uid: uuid!, $round: Int!, $question: Int!, $next: Int!, $delta: Int!, $hit: Int!, $done: Boolean!, $finished: timestamptz) {
  update_conquest_verified_runs(
    where: {id: {_eq: $id}, user_id: {_eq: $uid}, current_round: {_eq: $round}, current_question: {_eq: $question}, completed: {_eq: false}},
    _inc: {current_round: 1, score: $delta, correct_answers: $hit},
    _set: {current_question: $next, completed: $done, finished_at: $finished}
  ) { affected_rows returning {current_round score correct_answers completed} }
}`;

function send(res, status, data) { res.status(status).json(data); }
function setCors(req, res) {
  const origin = req.headers.origin;
  const extra = (process.env.CONQUEST_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'https://ruan-levi.github.io', ...extra]);
  if (typeof origin === 'string' && allowed.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}
function requireConfig() {
  if (!process.env.NHOST_AUTH_URL || !process.env.NHOST_GRAPHQL_URL || !process.env.NHOST_ADMIN_SECRET) {
    const error = new Error('Nhost Functions nao configurado'); error.status = 503; throw error;
  }
}
async function authenticatedUser(req) {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer\s+\S+$/i.test(authorization)) {
    const error = new Error('Entre na sua conta para iniciar o desafio.'); error.status = 401; throw error;
  }
  const verified = await fetch(process.env.NHOST_AUTH_URL.replace(/\/$/, '') + '/token/verify', {
    method: 'POST', headers: { Authorization: authorization }
  });
  if (!verified.ok) { const error = new Error('Sessao expirada ou token invalido.'); error.status = 401; throw error; }
  // Token validado pelo servico Nhost Auth acima. Nunca confiar em um JWT nao verificado.
  const jwt = authorization.replace(/^Bearer\s+/i, '');
  let payload;
  try { payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8')); }
  catch { const error = new Error('Token malformado.'); error.status = 401; throw error; }
  const uid = payload['https://hasura.io/jwt/claims']?.['x-hasura-user-id'] || payload.sub;
  if (!isValidRunId(uid)) { const error = new Error('Usuario nao identificado.'); error.status = 401; throw error; }
  return uid;
}
async function graph(query, variables) {
  const response = await fetch(process.env.NHOST_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET },
    body: JSON.stringify({ query, variables })
  });
  if (!response.ok) throw new Error('GraphQL HTTP ' + response.status);
  const body = await response.json();
  if (body.errors?.length) throw new Error('Erro GraphQL na configuracao Hasura');
  return body.data;
}

export default async function challenge(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); send(res, 405, { error: 'Metodo nao permitido' }); return; }
  try {
    requireConfig();
    const uid = await authenticatedUser(req);
    const action = req.body?.action;
    if (action === 'start') {
      const qid = randomInt(questionCount());
      const data = await graph(START, { uid, question: qid });
      if (!data?.insert_conquest_verified_runs_one?.id) throw new Error('Nao foi possivel iniciar partida');
      send(res, 200, {
        runId: data.insert_conquest_verified_runs_one.id,
        round: 1, totalRounds: QUIZ_LENGTH,
        score: 0, correctAnswers: 0, question: publicQuestion(qid)
      });
      return;
    }
    if (action === 'answer') {
      const { runId, choice, round } = req.body || {};
      if (!isValidRunId(runId) || !Number.isInteger(choice) || choice < 0 || choice > 3 || !Number.isInteger(round) || round < 1 || round > QUIZ_LENGTH) {
        send(res, 400, { error: 'Dados da resposta invalidos.' }); return;
      }
      const data = await graph(READ, { id: runId, uid });
      const run = data?.conquest_verified_runs?.[0];
      if (!run) { send(res, 404, { error: 'Partida nao encontrada.' }); return; }
      if (run.completed || run.current_round !== round - 1) {
        send(res, 409, { error: 'Esta rodada ja foi respondida ou foi encerrada.' }); return;
      }
      const result = checkAnswer(run.current_question, choice);
      const done = round === QUIZ_LENGTH;
      const next = done ? run.current_question : nextQuestionIndex(run.current_question, randomInt);
      const updated = await graph(ADVANCE, {
        id: runId, uid, round: run.current_round, question: run.current_question,
        next, delta: result.correct ? POINTS_PER_CORRECT : 0,
        hit: result.correct ? 1 : 0, done, finished: done ? new Date().toISOString() : null
      });
      const changes = updated?.update_conquest_verified_runs;
      if (changes?.affected_rows !== 1) { send(res, 409, { error: 'Resposta ja processada. Atualize a partida.' }); return; }
      const current = changes.returning[0];
      send(res, 200, {
        correct: result.correct, correctOption: result.correctOption,
        finished: done, score: current.score, correctAnswers: current.correct_answers,
        round: done ? QUIZ_LENGTH : round + 1, totalRounds: QUIZ_LENGTH,
        question: done ? null : publicQuestion(next)
      });
      return;
    }
    send(res, 400, { error: 'Acao desconhecida.' });
  } catch (error) {
    const status = error.status || 502;
    if (status >= 500) console.error('Conquest challenge: falha operacional', error.message);
    send(res, status, { error: status >= 500 ? 'Servidor indisponivel; confira o projeto Nhost e as migracoes.' : error.message });
  }
}