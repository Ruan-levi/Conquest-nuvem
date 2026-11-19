import { randomInt } from 'node:crypto';
import { DUEL_ROUNDS, POINTS_PER_HIT, publicQuestion, checkDuelAnswer } from './_shared/duel-questions.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^[A-HJ-NP-Z2-9]{8}$/;
const ROOM_FIELDS = `id code host_id guest_id host_nickname guest_nickname status host_round guest_round
  host_score guest_score host_correct guest_correct created_at finished_at`;
const RANKING = `query DuelRanking {
  conquest_duel_leaderboard(order_by: [{best_score: desc}, {wins: desc}, {played: desc}], limit: 15) {
    nickname best_score wins played
  }
}`;
const CREATE = `mutation CreateDuel($code: String!, $uid: uuid!, $nickname: String!) {
  insert_conquest_duels_one(object: {code: $code, host_id: $uid, host_nickname: $nickname}) { ${ROOM_FIELDS} }
}`;
const COUNT_OPEN = `query OpenDuel($uid: uuid!, $since: timestamptz!) {
  conquest_duels_aggregate(where: {host_id: {_eq: $uid}, created_at: {_gte: $since}, status: {_in: ["waiting", "active"]}}) {
    aggregate { count }
  }
}`;
const FIND_BY_CODE = `query FindDuel($code: String!) {
  conquest_duels(where: {code: {_eq: $code}}, limit: 1) { ${ROOM_FIELDS} }
}`;
const READ = `query ReadDuel($id: uuid!, $uid: uuid!) {
  conquest_duels(where: {id: {_eq: $id}, _or: [{host_id: {_eq: $uid}}, {guest_id: {_eq: $uid}}]}, limit: 1) {
    ${ROOM_FIELDS}
  }
}`;
const JOIN = `mutation JoinDuel($id: uuid!, $uid: uuid!, $nickname: String!) {
  update_conquest_duels(where: {id: {_eq: $id}, status: {_eq: "waiting"}, guest_id: {_is_null: true}, host_id: {_neq: $uid}},
    _set: {guest_id: $uid, guest_nickname: $nickname, status: "active"}) { affected_rows }
}`;
const HOST_ANSWER = `mutation HostAnswer($id: uuid!, $uid: uuid!, $round: Int!, $delta: Int!, $hit: Int!) {
  update_conquest_duels(where: {id: {_eq: $id}, host_id: {_eq: $uid}, host_round: {_eq: $round}, status: {_eq: "active"}},
    _inc: {host_round: 1, host_score: $delta, host_correct: $hit}) { affected_rows }
}`;
const GUEST_ANSWER = `mutation GuestAnswer($id: uuid!, $uid: uuid!, $round: Int!, $delta: Int!, $hit: Int!) {
  update_conquest_duels(where: {id: {_eq: $id}, guest_id: {_eq: $uid}, guest_round: {_eq: $round}, status: {_eq: "active"}},
    _inc: {guest_round: 1, guest_score: $delta, guest_correct: $hit}) { affected_rows }
}`;
const FINISH = `mutation FinishDuel($id: uuid!, $finished: timestamptz!) {
  update_conquest_duels(where: {id: {_eq: $id}, status: {_eq: "active"}, host_round: {_eq: 6}, guest_round: {_eq: 6}},
    _set: {status: "finished", finished_at: $finished}) { affected_rows }
}`;
const CANCEL = `mutation CancelDuel($id: uuid!, $uid: uuid!) {
  update_conquest_duels(where: {id: {_eq: $id}, status: {_in: ["waiting", "active"]}, _or: [{host_id: {_eq: $uid}}, {guest_id: {_eq: $uid}}]},
    _set: {status: "cancelled"}) { affected_rows }
}`;

function error(status, message) { return Object.assign(new Error(message), { status }); }
function code() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
}
function nickname(value) {
  const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!/^[\p{L}\p{N} _-]{3,24}$/u.test(name)) {
    throw error(400, 'Apelido de 3 a 24 caracteres (letras, números, espaço, _ ou -).');
  }
  return name;
}
function setCors(req, res) {
  const extra = (process.env.CONQUEST_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  const origins = new Set(['https://ruan-levi.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173', ...extra]);
  const origin = req.headers?.origin;
  if (origins.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}
function requireConfig() {
  if (!process.env.NHOST_GRAPHQL_URL ||
      !process.env.NHOST_ADMIN_SECRET || !process.env.NHOST_AUTH_URL) {
    throw error(503, 'Função Nhost não configurada.');
  }
}
async function graph(query, variables = {}) {
  const response = await fetch(process.env.NHOST_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET },
    body: JSON.stringify({ query, variables })
  });
  if (!response.ok) throw error(503, 'GraphQL indisponível.');
  const body = await response.json();
  if (body.errors?.length) {
    const conflict = body.errors.some(x => x.extensions?.code === 'constraint-violation' &&
      /conquest_duels_code_key/i.test(x.message || ''));
    throw error(conflict ? 409 : 503, 'Migração ou tabela não configurada no Nhost.');
  }
  return body.data;
}
async function authenticatedUser(req) {
  const authorization = req.headers?.authorization;
  if (typeof authorization !== 'string' || !/^Bearer\s+\S+$/i.test(authorization)) {
    throw error(401, 'Entre na sua conta Nhost para participar.');
  }
  const verified = await fetch(process.env.NHOST_AUTH_URL.replace(/\/$/, '') + '/token/verify', {
    method: 'POST', headers: { Authorization: authorization }
  });
  if (!verified.ok) throw error(401, 'Sessão inválida ou expirada.');
  let payload;
  try {
    const encoded = authorization.replace(/^Bearer\s+/i, '').split('.')[1];
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch { throw error(401, 'Token inválido.'); }
  // Só usa claims depois da verificação criptográfica pelo Nhost Auth.
  const uid = payload?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id'] || payload?.sub;
  if (typeof uid !== 'string' || !UUID.test(uid)) throw error(401, 'Usuário não identificado.');
  return uid;
}
async function getRoom(id, uid) {
  const data = await graph(READ, { id, uid });
  const room = data?.conquest_duels?.[0];
  if (!room) throw error(404, 'Partida não encontrada para esta conta.');
  return room;
}
function viewRoom(room, uid) {
  const host = uid === room.host_id;
  const me = host ? 'host' : 'guest';
  const round = Number(host ? room.host_round : room.guest_round);
  const otherRound = Number(host ? room.guest_round : room.host_round);
  const finished = room.status === 'finished';
  return {
    id: room.id, code: room.code, status: room.status, role: me, rounds: DUEL_ROUNDS,
    host: { nickname: room.host_nickname, score: room.host_score, answered: room.host_round },
    guest: room.guest_id ? { nickname: room.guest_nickname, score: room.guest_score, answered: room.guest_round } : null,
    myAnswered: round, opponentAnswered: otherRound,
    question: room.status === 'active' && round < DUEL_ROUNDS ? publicQuestion(room.id, round + 1) : null,
    winner: finished ? (room.host_score > room.guest_score ? 'host' : room.guest_score > room.host_score ? 'guest' : 'draw') : null
  };
}
async function updateFinished(room, uid) {
  if (room.status !== 'active' || room.host_round !== DUEL_ROUNDS || room.guest_round !== DUEL_ROUNDS) return room;
  await graph(FINISH, { id: room.id, finished: new Date().toISOString() });
  return getRoom(room.id, uid);
}

export default async function duel(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Método não permitido.' });
  try {
    requireConfig();
    if (req.method === 'GET') {
      const data = await graph(RANKING);
      // Nunca enviar user_id do banco ao visitante.
      const rows = (data?.conquest_duel_leaderboard || []).map(r => ({
        nickname: r.nickname, bestScore: r.best_score, wins: r.wins, played: r.played
      }));
      return res.status(200).json({ ranking: rows });
    }
    const uid = await authenticatedUser(req);
    const action = req.body?.action;
    if (action === 'create') {
      const name = nickname(req.body.nickname);
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const count = await graph(COUNT_OPEN, { uid, since });
      if ((count?.conquest_duels_aggregate?.aggregate?.count || 0) >= 3) {
        throw error(429, 'Você já tem três partidas abertas. Encerre uma antes de criar outra.');
      }
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const data = await graph(CREATE, { uid, nickname: name, code: code() });
          return res.status(200).json({ room: viewRoom(data.insert_conquest_duels_one, uid) });
        } catch (err) {
          if (err.status !== 409) throw err;
        }
      }
      throw error(503, 'Não foi possível gerar um código. Tente novamente.');
    }
    if (action === 'join') {
      const invitation = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
      if (!CODE.test(invitation)) throw error(400, 'Código de convite inválido.');
      const name = nickname(req.body.nickname);
      const data = await graph(FIND_BY_CODE, { code: invitation });
      const found = data?.conquest_duels?.[0];
      if (!found) throw error(404, 'Convite não encontrado.');
      if (found.host_id === uid || found.guest_id === uid) return res.status(200).json({ room: viewRoom(found, uid) });
      if (found.status !== 'waiting' || found.guest_id) throw error(409, 'Sala ocupada ou encerrada.');
      if (Date.now() - new Date(found.created_at).getTime() > 60 * 60 * 1000) throw error(410, 'Convite expirou.');
      const changed = await graph(JOIN, { id: found.id, uid, nickname: name });
      if (changed.update_conquest_duels?.affected_rows !== 1) throw error(409, 'Alguém já entrou nesta sala.');
      return res.status(200).json({ room: viewRoom(await getRoom(found.id, uid), uid) });
    }
    const id = req.body?.roomId;
    if (typeof id !== 'string' || !UUID.test(id)) throw error(400, 'Identificador da sala inválido.');
    const room = await getRoom(id, uid);
    if (action === 'status') return res.status(200).json({ room: viewRoom(await updateFinished(room, uid), uid) });
    if (action === 'cancel') {
      if (room.status !== 'waiting' && room.status !== 'active') throw error(409, 'Partida já encerrada.');
      const changed = await graph(CANCEL, { id, uid });
      if (changed.update_conquest_duels?.affected_rows !== 1) throw error(409, 'Partida já encerrada.');
      return res.status(200).json({ room: viewRoom(await getRoom(id, uid), uid) });
    }
    if (action === 'answer') {
      const choice = req.body?.choice;
      const round = req.body?.round;
      if (!Number.isInteger(choice) || choice < 0 || choice > 3 ||
          !Number.isInteger(round) || round < 1 || round > DUEL_ROUNDS) {
        throw error(400, 'Resposta ou rodada inválida.');
      }
      if (room.status !== 'active') throw error(409, 'Aguarde o outro jogador ou crie uma nova sala.');
      const host = uid === room.host_id;
      const previousRound = Number(host ? room.host_round : room.guest_round);
      if (round !== previousRound + 1) throw error(409, 'Rodada já respondida ou fora de ordem.');
      const checked = checkDuelAnswer(room.id, round, choice);
      const changed = await graph(host ? HOST_ANSWER : GUEST_ANSWER, {
        id, uid, round: previousRound,
        delta: checked.correct ? POINTS_PER_HIT : 0, hit: checked.correct ? 1 : 0
      });
      if (changed.update_conquest_duels?.affected_rows !== 1) throw error(409, 'Resposta já processada. Atualize a partida.');
      const updated = await updateFinished(await getRoom(id, uid), uid);
      return res.status(200).json({ room: viewRoom(updated, uid), answer: checked });
    }
    throw error(400, 'Ação desconhecida.');
  } catch (err) {
    if (!err.status || err.status >= 500) console.error('Conquest duelo: falha operacional', err.message);
    return res.status(err.status || 503).json({ error: err.status && err.status < 500 ? err.message : 'Nhost indisponível. Verifique a Function, as migrações e o Hasura.' });
  }
}
